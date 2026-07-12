"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { xendit } from "@/lib/xendit/client";

export async function createCheckout(formData: FormData) {
  const listingId = formData.get("listingId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Silakan masuk untuk melanjutkan pembelian.")}`);
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

  const product = listing!.products as unknown as {
    id: string;
    is_platform_owned: boolean;
    seller_id: string | null;
  };

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      buyer_id: user!.id,
      listing_id: listing!.id,
      seller_id: product.seller_id,
      is_platform_owned: product.is_platform_owned,
      amount: listing!.price,
      currency: listing!.currency,
      state: "created",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    redirect(`/?error=${encodeURIComponent("Gagal membuat pesanan, coba lagi.")}`);
  }

  await admin.from("order_state_transitions").insert({
    order_id: order!.id,
    from_state: null,
    to_state: "created",
    actor_type: "system",
    reason: "Order created at checkout",
  });

  const invoice = await xendit.Invoice.createInvoice({
    data: {
      externalId: order!.id,
      amount: listing!.price,
      currency: listing!.currency,
      payerEmail: user!.email,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order!.id}`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order!.id}`,
    },
  });

  // Needed later to call Xendit's Refund API, which refunds against this invoice ID.
  await admin.from("orders").update({ xendit_invoice_id: invoice.id }).eq("id", order!.id);

  redirect(invoice.invoiceUrl);
}
