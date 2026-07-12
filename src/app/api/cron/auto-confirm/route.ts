import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { completeOrder } from "@/lib/orders/completeOrder";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Orders whose delivery reveal window has lapsed with no buyer action —
  // confirming on their behalf is what actually releases held funds instead
  // of leaving them stuck in escrow forever.
  const { data: expiredDeliveries } = await admin
    .from("deliveries")
    .select("order_id, orders ( id, state, seller_id, amount, currency, is_platform_owned )")
    .lt("reveal_expires_at", new Date().toISOString());

  let confirmed = 0;

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

  return NextResponse.json({ confirmed });
}
