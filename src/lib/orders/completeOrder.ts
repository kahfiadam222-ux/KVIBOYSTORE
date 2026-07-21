import type { SupabaseClient } from "@supabase/supabase-js";
import { payoutToSeller } from "@/lib/xendit/payout";
import { transitionOrderState } from "@/lib/orders/transition";
import { logger } from "@/lib/debug";

type Order = {
  id: string;
  seller_id: string | null;
  amount: number;
  currency: string;
  is_platform_owned: boolean;
  state?: string;
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
    // CAS: only one concurrent confirm wins.
    const moved = await transitionOrderState(
      admin,
      orderId,
      "delivered",
      "completed",
      {
        actorType: actor.type,
        actorId: actor.id ?? null,
        reason,
      },
    );
    if (!moved) {
      logger.info("completeOrder skipped — state race", { orderId });
    }
    return;
  }

  // Stay on delivered until payout succeeds so cron/retry can re-enter.
  // Intermediate buyer_confirmed only after we have a payout destination;
  // if payout fails we leave state at delivered for a later retry.
  const claimed = await transitionOrderState(
    admin,
    orderId,
    "delivered",
    "buyer_confirmed",
    {
      actorType: actor.type,
      actorId: actor.id ?? null,
      reason,
    },
  );

  if (!claimed) {
    // Already confirmed by another caller — allow payout retry from buyer_confirmed.
    const { data: current } = await admin
      .from("orders")
      .select("state")
      .eq("id", orderId)
      .single();
    if (current?.state !== "buyer_confirmed") {
      logger.info("completeOrder skipped — not deliverable", {
        orderId,
        state: current?.state,
      });
      return;
    }
  }

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

  try {
    const payout = await payoutToSeller({
      orderId,
      amount: order.amount,
      currency: order.currency,
      channelCode: sellerProfile.payout_channel_code,
      accountNumber: sellerProfile.payout_account_number,
      accountHolderName: sellerProfile.payout_account_holder_name ?? "",
    });

    // Only debit ledger + complete if we still own buyer_confirmed.
    const completed = await transitionOrderState(
      admin,
      orderId,
      "buyer_confirmed",
      "completed",
      {
        actorType: "system",
        reason: "Payout released to seller",
      },
    );

    if (!completed) return;

    await admin.from("escrow_ledger").insert({
      order_id: orderId,
      entry_type: "payout_released",
      direction: "debit",
      amount: order.amount,
      reference_disbursement_id: payout.id,
    });
  } catch (err) {
    logger.error("Payout failed — order left at buyer_confirmed for retry", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
    // Do not throw to buyer confirm UX for transient payout failures when
    // confirmation already recorded; cron can retry buyer_confirmed later.
  }
}
