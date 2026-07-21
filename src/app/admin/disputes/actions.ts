"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundInvoice } from "@/lib/xendit/refund";
import { payoutToSeller } from "@/lib/xendit/payout";
import { transitionOrderState } from "@/lib/orders/transition";
import { logger } from "@/lib/debug";

export async function resolveDisputeRefund(disputeId: string, orderId: string) {
  const admin_user = await requireAdmin();
  const admin = createAdminClient();

  const { data: dispute } = await admin
    .from("disputes")
    .select("id, status, order_id")
    .eq("id", disputeId)
    .single();

  if (!dispute || dispute.status !== "open" || dispute.order_id !== orderId) {
    return;
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, state, amount, currency, xendit_invoice_id")
    .eq("id", orderId)
    .single();

  if (!order || !order.xendit_invoice_id) return;
  if (order.state !== "buyer_disputed" && order.state !== "under_review") return;

  // CAS: only one resolution path wins.
  const refunded = await transitionOrderState(
    admin,
    orderId,
    order.state,
    "refunded",
    {
      actorType: "admin",
      actorId: admin_user.id,
      reason: "Dispute resolved: refunded to buyer",
    },
  );

  if (!refunded) return;

  let referenceId: string | null = null;
  let reason = "Dispute resolved: refunded to buyer via Xendit";
  try {
    const refund = await refundInvoice({
      invoiceId: order.xendit_invoice_id,
      amount: order.amount,
      currency: order.currency,
    });
    referenceId = refund.id ?? null;
  } catch (err) {
    reason =
      "Dispute resolved: refund not supported by payment channel — requires manual bank transfer by ops";
    logger.error("Xendit refund failed — order marked refunded for ops manual transfer", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const { data: existingLedger } = await admin
    .from("escrow_ledger")
    .select("id")
    .eq("order_id", orderId)
    .eq("entry_type", "refund_issued")
    .maybeSingle();

  if (!existingLedger) {
    await admin.from("escrow_ledger").insert({
      order_id: orderId,
      entry_type: "refund_issued",
      direction: "debit",
      amount: order.amount,
      reference_disbursement_id: referenceId,
    });
  }

  // Update transition reason if refund path needed manual ops.
  if (reason.includes("manual")) {
    await admin.from("order_state_transitions").insert({
      order_id: orderId,
      from_state: "refunded",
      to_state: "refunded",
      actor_type: "admin",
      actor_id: admin_user.id,
      reason,
    });
  }

  await admin
    .from("disputes")
    .update({
      status: "resolved",
      resolution: reason.includes("manual")
        ? "refunded_manual_ops_required"
        : "refunded",
      resolved_by_admin_id: admin_user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .eq("status", "open");

  revalidatePath("/admin/disputes");
  revalidatePath(`/orders/${orderId}`);
}

export async function resolveDisputeRelease(disputeId: string, orderId: string) {
  const admin_user = await requireAdmin();
  const admin = createAdminClient();

  const { data: dispute } = await admin
    .from("disputes")
    .select("id, status, order_id")
    .eq("id", disputeId)
    .single();

  if (!dispute || dispute.status !== "open" || dispute.order_id !== orderId) {
    return;
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, state, amount, currency, seller_id, is_platform_owned")
    .eq("id", orderId)
    .single();

  // Platform-owned orders have no seller to release funds to — only refund applies.
  if (!order || order.is_platform_owned || !order.seller_id) return;
  if (order.state !== "buyer_disputed" && order.state !== "under_review") return;

  const { data: sellerProfile } = await admin
    .from("seller_profiles")
    .select("payout_channel_code, payout_account_number, payout_account_holder_name")
    .eq("user_id", order.seller_id)
    .single();

  if (!sellerProfile?.payout_channel_code || !sellerProfile.payout_account_number) return;

  let payoutId: string | null = null;
  try {
    const payout = await payoutToSeller({
      orderId,
      amount: order.amount,
      currency: order.currency,
      channelCode: sellerProfile.payout_channel_code,
      accountNumber: sellerProfile.payout_account_number,
      accountHolderName: sellerProfile.payout_account_holder_name ?? "",
    });
    payoutId = payout.id ?? null;
  } catch (err) {
    logger.error("Dispute release payout failed — order left in dispute", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  const completed = await transitionOrderState(
    admin,
    orderId,
    order.state,
    "completed",
    {
      actorType: "admin",
      actorId: admin_user.id,
      reason: "Dispute rejected: payout released to seller",
    },
  );

  if (!completed) return;

  const { data: existingLedger } = await admin
    .from("escrow_ledger")
    .select("id")
    .eq("order_id", orderId)
    .eq("entry_type", "payout_released")
    .maybeSingle();

  if (!existingLedger) {
    await admin.from("escrow_ledger").insert({
      order_id: orderId,
      entry_type: "payout_released",
      direction: "debit",
      amount: order.amount,
      reference_disbursement_id: payoutId,
    });
  }

  await admin
    .from("disputes")
    .update({
      status: "resolved",
      resolution: "rejected, released to seller",
      resolved_by_admin_id: admin_user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .eq("status", "open");

  revalidatePath("/admin/disputes");
  revalidatePath(`/orders/${orderId}`);
}
