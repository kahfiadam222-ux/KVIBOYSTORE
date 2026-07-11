import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-callback-token");
  if (process.env.XENDIT_WEBHOOK_TOKEN && token !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
  }

  const body = await request.json();
  const orderId = body.external_id as string;
  const status = body.status as string;

  if (status !== "PAID") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, amount, state")
    .eq("id", orderId)
    .single();

  // Already processed (webhook retries are common) — acknowledge without double-crediting the ledger.
  if (!order || order.state !== "created") {
    return NextResponse.json({ received: true });
  }

  await admin.from("orders").update({ state: "payment_held" }).eq("id", orderId);

  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: "created",
    to_state: "payment_held",
    actor_type: "system",
    reason: "Xendit invoice paid",
  });

  await admin.from("escrow_ledger").insert({
    order_id: orderId,
    entry_type: "payment_held",
    direction: "credit",
    amount: order.amount,
  });

  return NextResponse.json({ received: true });
}
