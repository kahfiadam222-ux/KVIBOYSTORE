import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revealExpiresAt } from "@/lib/orders/autoConfirm";
import { safeEqualSecret } from "@/lib/security/crypto";
import { encryptPayload } from "@/lib/security/payload";
import { transitionOrderState } from "@/lib/orders/transition";
import { logger } from "@/lib/debug";

interface XenditWebhookBody {
  external_id: string;
  status: string;
  amount?: number;
  paid_amount?: number;
  currency?: string;
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
    logger.error("XENDIT_WEBHOOK_TOKEN not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  if (!safeEqualSecret(token, expectedToken)) {
    logger.security("Invalid Xendit webhook token", {
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
    });
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isXenditWebhookBody(body)) {
    logger.error("Xendit webhook body missing expected fields", {
      body: typeof body,
    });
    return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
  }

  const orderId = body.external_id;
  const status = body.status;

  if (status === "EXPIRED" || status === "FAILED") {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, state, listing_id")
      .eq("id", orderId)
      .single();

    if (order && order.state === "created") {
      const cancelled = await transitionOrderState(
        admin,
        orderId,
        "created",
        "cancelled",
        {
          actorType: "system",
          reason: `Xendit invoice status: ${status}`,
        },
      );

      if (cancelled) {
        const { error: stockError } = await admin.rpc("increment_listing_stock", {
          p_listing_id: order.listing_id,
        });

        if (stockError) {
          logger.error("Failed to restore stock after invoice expiry", {
            orderId,
            listingId: order.listing_id,
            error: stockError.message,
          });
        } else {
          logger.info("Order cancelled and stock restored", { orderId, status });
        }
      }
    }

    return NextResponse.json({ received: true });
  }

  if (status !== "PAID") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select(
      "id, amount, currency, is_platform_owned, state, listings ( products ( id, is_platform_owned ) )",
    )
    .eq("id", orderId)
    .single();

  if (!order || order.state !== "created") {
    return NextResponse.json({ received: true });
  }

  // Flag amount mismatches without blocking (webhook shape varies by channel).
  const paidAmount = body.paid_amount ?? body.amount;
  if (
    typeof paidAmount === "number" &&
    Number(paidAmount) !== Number(order.amount)
  ) {
    logger.security("Xendit paid amount mismatch", {
      orderId,
      expected: order.amount,
      paid: paidAmount,
    });
  }

  // CAS: only the first PAID webhook advances created → payment_held.
  const held = await transitionOrderState(
    admin,
    orderId,
    "created",
    "payment_held",
    {
      actorType: "system",
      reason: "Xendit invoice paid",
    },
  );

  if (!held) {
    return NextResponse.json({ received: true });
  }

  // Guard duplicate ledger rows on rare races.
  const { data: existingLedger } = await admin
    .from("escrow_ledger")
    .select("id")
    .eq("order_id", orderId)
    .eq("entry_type", "payment_held")
    .maybeSingle();

  if (!existingLedger) {
    await admin.from("escrow_ledger").insert({
      order_id: orderId,
      entry_type: "payment_held",
      direction: "credit",
      amount: order.amount,
    });
  }

  const product = (
    order.listings as unknown as {
      products: { id: string; is_platform_owned: boolean };
    }
  ).products;

  // Tier 1 platform-owned products are "Instant Delivery".
  if (product?.is_platform_owned) {
    const { data: code } = await admin.rpc("claim_product_code", {
      p_product_id: product.id,
      p_order_id: orderId,
    });

    if (code) {
      const deliveredAt = new Date();
      await admin.from("deliveries").insert({
        order_id: orderId,
        payload_encrypted: encryptPayload(String(code)),
        delivery_method: "redeem_code",
        delivered_at: deliveredAt.toISOString(),
        reveal_expires_at: revealExpiresAt(deliveredAt),
      });

      await transitionOrderState(admin, orderId, "payment_held", "delivered", {
        actorType: "system",
        reason: "Instant delivery: code claimed from inventory",
      });
    } else {
      // Paid but no code inventory — escalate for ops instead of silent stuck state.
      logger.error("Platform code inventory empty after payment", {
        orderId,
        productId: product.id,
      });
      await transitionOrderState(
        admin,
        orderId,
        "payment_held",
        "under_review",
        {
          actorType: "system",
          reason:
            "Instant delivery failed: no product codes available — needs ops fulfillment or refund",
        },
      );
    }
  } else {
    await transitionOrderState(
      admin,
      orderId,
      "payment_held",
      "awaiting_delivery",
      {
        actorType: "system",
        reason: "Awaiting manual delivery from seller",
      },
    );
  }

  return NextResponse.json({ received: true });
}
