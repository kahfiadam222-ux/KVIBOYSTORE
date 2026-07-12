"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundInvoice } from "@/lib/xendit/refund";
import { payoutToSeller } from "@/lib/xendit/payout";

export async function resolveDisputeRefund(disputeId: string, orderId: string) {
  const admin_user = await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, state, amount, currency, xendit_invoice_id")
    .eq("id", orderId)
    .single();

  if (!order || !order.xendit_invoice_id) return;

  const refund = await refundInvoice({
    invoiceId: order.xendit_invoice_id,
    amount: order.amount,
    currency: order.currency,
  });

  await admin.from("escrow_ledger").insert({
    order_id: orderId,
    entry_type: "refund_issued",
    direction: "debit",
    amount: order.amount,
    reference_disbursement_id: refund.id,
  });

  await admin.from("orders").update({ state: "refunded" }).eq("id", orderId);

  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: order.state,
    to_state: "refunded",
    actor_type: "admin",
    actor_id: admin_user.id,
    reason: "Dispute resolved: refunded to buyer",
  });

  await admin
    .from("disputes")
    .update({
      status: "resolved",
      resolution: "refunded",
      resolved_by_admin_id: admin_user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId);

  revalidatePath("/admin/disputes");
}

export async function resolveDisputeRelease(disputeId: string, orderId: string) {
  const admin_user = await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, state, amount, currency, seller_id, is_platform_owned")
    .eq("id", orderId)
    .single();

  // Platform-owned orders have no seller to release funds to — only refund applies.
  if (!order || order.is_platform_owned || !order.seller_id) return;

  const { data: sellerProfile } = await admin
    .from("seller_profiles")
    .select("payout_channel_code, payout_account_number, payout_account_holder_name")
    .eq("user_id", order.seller_id)
    .single();

  if (!sellerProfile?.payout_channel_code || !sellerProfile.payout_account_number) return;

  const payout = await payoutToSeller({
    orderId,
    amount: order.amount,
    currency: order.currency,
    channelCode: sellerProfile.payout_channel_code,
    accountNumber: sellerProfile.payout_account_number,
    accountHolderName: sellerProfile.payout_account_holder_name ?? "",
  });

  await admin.from("escrow_ledger").insert({
    order_id: orderId,
    entry_type: "payout_released",
    direction: "debit",
    amount: order.amount,
    reference_disbursement_id: payout.id,
  });

  await admin.from("orders").update({ state: "completed" }).eq("id", orderId);

  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: order.state,
    to_state: "completed",
    actor_type: "admin",
    actor_id: admin_user.id,
    reason: "Dispute rejected: payout released to seller",
  });

  await admin
    .from("disputes")
    .update({
      status: "resolved",
      resolution: "rejected, released to seller",
      resolved_by_admin_id: admin_user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId);

  revalidatePath("/admin/disputes");
}
