"use server";

import { revalidatePath } from "next/cache";
import { requireSeller } from "@/lib/auth/requireSeller";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createListing(formData: FormData) {
  const user = await requireSeller();
  const supabase = await createClient();

  const productTypeId = formData.get("productTypeId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const stockCount = Number(formData.get("stockCount"));

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      product_type_id: productTypeId,
      title,
      description,
      is_platform_owned: false,
      status: "active",
    })
    .select("id")
    .single();

  if (productError || !product) return;

  await supabase.from("listings").insert({
    product_id: product.id,
    price,
    stock_count: stockCount,
    is_active: true,
  });

  revalidatePath("/seller/dashboard");
}

export async function updatePayoutAccount(formData: FormData) {
  const user = await requireSeller();
  // seller_profiles has no client-facing UPDATE policy, so this goes through
  // the admin client; requireSeller() + the eq("user_id", user.id) filter
  // below is what keeps a seller from touching anyone else's payout info.
  const admin = createAdminClient();

  await admin
    .from("seller_profiles")
    .update({
      payout_channel_code: formData.get("payoutChannelCode") as string,
      payout_account_number: formData.get("payoutAccountNumber") as string,
      payout_account_holder_name: formData.get("payoutAccountHolderName") as string,
    })
    .eq("user_id", user.id);

  revalidatePath("/seller/dashboard");
}

export async function deliverOrder(orderId: string, formData: FormData) {
  const user = await requireSeller();
  const supabase = await createClient();

  const payload = formData.get("payload") as string;

  // RLS scopes this to orders where seller_id = auth.uid(), so a seller can
  // only ever deliver their own orders even if orderId were guessed/tampered.
  const { data: order } = await supabase
    .from("orders")
    .select("id, state, seller_id, listings ( products ( product_types ( delivery_method ) ) )")
    .eq("id", orderId)
    .eq("seller_id", user.id)
    .single();

  if (!order || order.state !== "awaiting_delivery") return;

  const deliveryMethod = (
    order.listings as unknown as {
      products: { product_types: { delivery_method: string } };
    }
  ).products.product_types.delivery_method;

  // Ownership was already verified above via the RLS-scoped read (seller_id = auth.uid());
  // these writes use the admin client because orders/deliveries have no client-facing write policy.
  const admin = createAdminClient();

  await admin.from("deliveries").insert({
    order_id: orderId,
    payload_encrypted: payload,
    delivery_method: deliveryMethod,
    delivered_at: new Date().toISOString(),
  });

  await admin.from("orders").update({ state: "delivered" }).eq("id", orderId);

  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: "awaiting_delivery",
    to_state: "delivered",
    actor_type: "seller",
    actor_id: user.id,
    reason: "Seller delivered manually",
  });

  revalidatePath("/seller/dashboard");
}
