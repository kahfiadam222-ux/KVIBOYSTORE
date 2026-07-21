import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { completeOrder } from "@/lib/orders/completeOrder";
import { safeEqualSecret } from "@/lib/security/crypto";
import { logger } from "@/lib/debug";

// A cron endpoint must never serve a cached result — each invocation has to
// see the database's current state, not a snapshot from the last run.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null;

  if (!safeEqualSecret(authHeader, expected)) {
    logger.security("Unauthorized cron auto-confirm attempt", {
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Orders whose delivery reveal window has lapsed with no buyer action —
  // confirming on their behalf is what actually releases held funds instead
  // of leaving them stuck in escrow forever.
  const { data: expiredDeliveries, error } = await admin
    .from("deliveries")
    .select("order_id, orders ( id, state, seller_id, amount, currency, is_platform_owned )")
    .lt("reveal_expires_at", new Date().toISOString());

  if (error) {
    logger.error("Failed to load expired deliveries for auto-confirm", {
      error: error.message,
    });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  let confirmed = 0;
  let payoutRetried = 0;

  for (const row of expiredDeliveries ?? []) {
    const order = row.orders as unknown as {
      id: string;
      state: string;
      seller_id: string | null;
      amount: number;
      currency: string;
      is_platform_owned: boolean;
    } | null;

    if (!order || order.state !== "delivered") continue;

    await completeOrder(
      admin,
      order,
      { type: "system" },
      "Auto-confirmed: buyer did not respond within the reveal window",
    );
    confirmed++;
  }

  // Retry payouts stuck at buyer_confirmed (seller bank missing earlier, or payout failed).
  const { data: pendingPayouts } = await admin
    .from("orders")
    .select("id, state, seller_id, amount, currency, is_platform_owned")
    .eq("state", "buyer_confirmed")
    .eq("is_platform_owned", false)
    .limit(50);

  for (const order of pendingPayouts ?? []) {
    await completeOrder(
      admin,
      order,
      { type: "system" },
      "Payout retry for buyer_confirmed order",
    );
    payoutRetried++;
  }

  // Cancel stale unpaid orders and restore stock (invoice never paid / webhook missed).
  const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: staleOrders } = await admin
    .from("orders")
    .select("id, listing_id")
    .eq("state", "created")
    .lt("created_at", staleCutoff)
    .limit(50);

  let stockRestored = 0;
  for (const order of staleOrders ?? []) {
    const { data: updated } = await admin
      .from("orders")
      .update({ state: "cancelled" })
      .eq("id", order.id)
      .eq("state", "created")
      .select("id")
      .maybeSingle();

    if (!updated) continue;

    await admin.from("order_state_transitions").insert({
      order_id: order.id,
      from_state: "created",
      to_state: "cancelled",
      actor_type: "system",
      reason: "Stale unpaid order auto-cancelled after 24h",
    });

    const { error: stockError } = await admin.rpc("increment_listing_stock", {
      p_listing_id: order.listing_id,
    });
    if (!stockError) stockRestored++;
  }

  logger.info("Auto-confirm cron finished", {
    confirmed,
    payoutRetried,
    stockRestored,
  });
  return NextResponse.json({ confirmed, payoutRetried, stockRestored });
}
