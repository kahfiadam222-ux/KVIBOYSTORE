import type { SupabaseClient } from "@supabase/supabase-js";
import { payoutToSeller } from "@/lib/xendit/payout";

type Order = {
  id: string;
  seller_id: string | null;
  amount: number;
  currency: string;
  is_platform_owned: boolean;
};

// Shared by the buyer's "confirm" action and the auto-confirm cron job —
// both close out a delivered order the same way, they just differ in who
// (or what) triggered the confirmation.
export async function completeOrder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, any, any>,
  order: Order,
  actor: { type: "buyer" | "system"; id?: string },
  reason: string,
) {
  const orderId = order.id;

  if (order.is_platform_owned) {
    await admin.from("orders").update({ state: "completed" }).eq("id", orderId);
    await admin.from("order_state_transitions").insert({
      order_id: orderId,
      from_state: "delivered",
      to_state: "completed",
      actor_type: actor.type,
      actor_id: actor.id ?? null,
      reason,
    });
    return;
  }

  await admin.from("orders").update({ state: "buyer_confirmed" }).eq("id", orderId);
  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: "delivered",
    to_state: "buyer_confirmed",
    actor_type: actor.type,
    actor_id: actor.id ?? null,
    reason,
  });

  const { data: sellerProfile } = await admin
    .from("seller_profiles")
    .select("payout_channel_code, payout_account_number, payout_account_holder_name")
    .eq("user_id", order.seller_id)
    .single();

  // Seller hasn't registered a payout destination yet — order stays at
  // buyer_confirmed until they do; nothing to release funds to otherwise.
  if (!sellerProfile?.payout_channel_code || !sellerProfile.payout_account_number) {
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
}
