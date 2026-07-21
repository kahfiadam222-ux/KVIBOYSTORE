"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { xendit } from "@/lib/xendit/client";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { isValidUuid } from "@/lib/security/validation";
import { logger } from "@/lib/debug";

export async function createCheckout(formData: FormData) {
  const listingId = formData.get("listingId");

  if (!isValidUuid(listingId)) {
    redirect(`/?error=${encodeURIComponent("Produk tidak valid.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Silakan masuk untuk melanjutkan pembelian.")}`);
  }

  const ip = await getClientIp();

  // 1. Rate limit by user ID
  const userCheckoutLimit = checkRateLimit(
    `checkout:user:${user.id}`,
    10,
    5 * 60 * 1000,
  );
  if (!userCheckoutLimit.allowed) {
    redirect(`/?error=${encodeURIComponent("Terlalu banyak percobaan checkout. Silakan coba lagi nanti.")}`);
  }

  // 2. Rate limit by IP address
  const ipCheckoutLimit = checkRateLimit(
    `checkout:ip:${ip}`,
    15,
    5 * 60 * 1000,
  );
  if (!ipCheckoutLimit.allowed) {
    redirect(`/?error=${encodeURIComponent("Terlalu banyak percobaan checkout dari jaringan Anda. Silakan coba lagi nanti.")}`);
  }

  const admin = createAdminClient();

  const { data: listing, error: listingError } = await admin
    .from("listings")
    .select("id, price, currency, products ( id, is_platform_owned, seller_id )")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    redirect(`/?error=${encodeURIComponent("Produk tidak ditemukan.")}`);
  }

  const product = listing.products as unknown as {
    id: string;
    is_platform_owned: boolean;
    seller_id: string | null;
  };

  // Block self-purchase (reputation / review gaming).
  if (product.seller_id && product.seller_id === user.id) {
    redirect(`/?error=${encodeURIComponent("Anda tidak bisa membeli produk milik sendiri.")}`);
  }

  // Atomically claims one unit of stock — prevents overselling when two
  // buyers hit the last unit of a listing at the same time.
  const { data: stockClaimed, error: stockError } = await admin.rpc("decrement_listing_stock", {
    p_listing_id: listing.id,
  });

  if (stockError) {
    logger.error("Stock decrement failed", { listingId: listing.id, error: stockError.message });
    redirect(`/?error=${encodeURIComponent("Terjadi kesalahan sistem. Silakan coba lagi.")}`);
  }

  if (!stockClaimed) {
    redirect(`/?error=${encodeURIComponent("Stok produk ini sudah habis.")}`);
  }

  // From this point on, stock is held. Any failure must restore it.
  let orderId: string | null = null;

  try {
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        buyer_id: user.id,
        listing_id: listing.id,
        seller_id: product.seller_id,
        is_platform_owned: product.is_platform_owned,
        amount: listing.price,
        currency: listing.currency,
        state: "created",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "order_insert_failed");
    }

    orderId = order.id;

    await admin.from("order_state_transitions").insert({
      order_id: order.id,
      from_state: null,
      to_state: "created",
      actor_type: "system",
      reason: "Order created at checkout",
    });

    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId: order.id,
        amount: listing.price,
        currency: listing.currency,
        payerEmail: user.email,
        successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`,
      },
    });

    // Needed later to call Xendit's Refund API, which refunds against this invoice ID.
    await admin.from("orders").update({ xendit_invoice_id: invoice.id }).eq("id", order.id);

    redirect(invoice.invoiceUrl);
  } catch (err) {
    // Next.js redirect() throws a special error — rethrow so navigation still works.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    logger.error("Checkout failed after stock claim — restoring stock", {
      listingId: listing.id,
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });

    // Best-effort: cancel the half-created order so it doesn't sit as "created" forever.
    if (orderId) {
      await admin.from("orders").update({ state: "cancelled" }).eq("id", orderId);
      await admin.from("order_state_transitions").insert({
        order_id: orderId,
        from_state: "created",
        to_state: "cancelled",
        actor_type: "system",
        reason: "Checkout failed after order creation",
      });
    }

    await admin.rpc("increment_listing_stock", { p_listing_id: listing.id });

    redirect(`/?error=${encodeURIComponent("Gagal membuat pesanan, coba lagi.")}`);
  }
}
