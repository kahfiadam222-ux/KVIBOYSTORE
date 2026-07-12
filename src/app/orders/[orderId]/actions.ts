"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { payoutToSeller } from "@/lib/xendit/payout";

export async function confirmDelivery(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, seller_id, amount, currency, state, is_platform_owned")
    .eq("id", orderId)
    .single();

  if (!order || order.buyer_id !== user.id || order.state !== "delivered") return;

  // Platform-owned orders have no seller payout to release, so confirmation
  // closes the order directly instead of routing through payout_released.
  if (order.is_platform_owned) {
    await admin.from("orders").update({ state: "completed" }).eq("id", orderId);
    await admin.from("order_state_transitions").insert({
      order_id: orderId,
      from_state: "delivered",
      to_state: "completed",
      actor_type: "buyer",
      actor_id: user.id,
      reason: "Buyer confirmed receipt",
    });
    revalidatePath(`/orders/${orderId}`);
    return;
  }

  await admin.from("orders").update({ state: "buyer_confirmed" }).eq("id", orderId);
  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: "delivered",
    to_state: "buyer_confirmed",
    actor_type: "buyer",
    actor_id: user.id,
    reason: "Buyer confirmed receipt",
  });

  const { data: sellerProfile } = await admin
    .from("seller_profiles")
    .select("payout_channel_code, payout_account_number, payout_account_holder_name")
    .eq("user_id", order.seller_id)
    .single();

  // Seller hasn't registered a payout destination yet — order stays at
  // buyer_confirmed until they do; nothing to release funds to otherwise.
  if (!sellerProfile?.payout_channel_code || !sellerProfile.payout_account_number) {
    revalidatePath(`/orders/${orderId}`);
    return;
  }

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
    from_state: "buyer_confirmed",
    to_state: "completed",
    actor_type: "system",
    reason: "Payout released to seller",
  });

  revalidatePath(`/orders/${orderId}`);
}
