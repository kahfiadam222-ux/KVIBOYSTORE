import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revealExpiresAt } from "@/lib/orders/autoConfirm";

interface XenditWebhookBody {
  external_id: string;
  status: string;
}

function isXenditWebhookBody(body: unknown): body is XenditWebhookBody {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).external_id === "string" &&
    typeof (body as Record<string, unknown>).status === "string"
  );
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-callback-token");
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expectedToken) {
    console.error("XENDIT_WEBHOOK_TOKEN not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Malformed JSON — can't come from a legitimate Xendit webhook.
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isXenditWebhookBody(body)) {
    console.error("Xendit webhook body missing expected fields:", body);
    return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
  }

  const orderId = body.external_id;
  const status = body.status;

  if (status !== "PAID") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, amount, is_platform_owned, state, listings ( products ( id, is_platform_owned ) )")
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

  const product = (order.listings as unknown as { products: { id: string; is_platform_owned: boolean } })
    .products;

  // Tier 1 platform-owned products are "Instant Delivery" — no seller action needed,
  // so fulfillment fires immediately instead of waiting on a manual delivery step.
  if (product?.is_platform_owned) {
    const { data: code } = await admin.rpc("claim_product_code", {
      p_product_id: product.id,
      p_order_id: orderId,
    });

    if (code) {
      const deliveredAt = new Date();
      await admin.from("deliveries").insert({
        order_id: orderId,
        payload_encrypted: code,
        delivery_method: "redeem_code",
        delivered_at: deliveredAt.toISOString(),
        reveal_expires_at: revealExpiresAt(deliveredAt),
      });

      await admin.from("orders").update({ state: "delivered" }).eq("id", orderId);

      await admin.from("order_state_transitions").insert({
        order_id: orderId,
        from_state: "payment_held",
        to_state: "delivered",
        actor_type: "system",
        reason: "Instant delivery: code claimed from inventory",
      });
    }
  } else {
    // Seller-owned orders need the seller to deliver manually from their dashboard.
    await admin.from("orders").update({ state: "awaiting_delivery" }).eq("id", orderId);

    await admin.from("order_state_transitions").insert({
      order_id: orderId,
      from_state: "payment_held",
      to_state: "awaiting_delivery",
      actor_type: "system",
      reason: "Awaiting manual delivery from seller",
    });
  }

  return NextResponse.json({ received: true });
}
