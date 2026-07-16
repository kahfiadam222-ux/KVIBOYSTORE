"use server";

import { revalidatePath } from "next/cache";
import { requireSeller } from "@/lib/auth/requireSeller";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revealExpiresAt } from "@/lib/orders/autoConfirm";

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
    throw new Error("Akses ditolak. Anda tidak memiliki izin untuk membuat produk.");
  }

  const productTypeId = formData.get("productTypeId");
  const title = formData.get("title");
  const description = formData.get("description");
  const imageUrl = formData.get("imageUrl");
  const priceStr = formData.get("price");
  const stockCountStr = formData.get("stockCount");

  if (!productTypeId || !title || !priceStr || !stockCountStr) {
    throw new Error("Jenis produk, judul, harga, dan stok wajib diisi.");
  }

  const price = Number(priceStr);
  const stockCount = Number(stockCountStr);

  if (isNaN(price) || isNaN(stockCount) || price <= 0 || stockCount < 0) {
    throw new Error("Harga dan stok harus berupa angka valid.");
  }

  // Admin bisa memilih penjual mana pun, ATAU membuat listing milik platform
  // (tanpa penjual). Penjual biasa selalu jadi owner listing-nya sendiri.
  // Constraint products_seller_pairing: platform-owned <=> seller_id NULL.
  let sellerId: string | null = user.id;
  let isPlatformOwned = false;
  if (profile.role === "admin") {
    const specified = String(formData.get("sellerId") ?? "").trim();
    if (!specified || specified === "__platform__") {
      isPlatformOwned = true;
      sellerId = null;
    } else {
      sellerId = specified;
    }
  }

  // Use the admin client for writes — auth is already verified above; the regular
  // client hits RLS policies that often don't grant INSERT on the listings table,
  // which is the root cause of the frequent "Gagal membuat daftar harga" errors.
  const admin = createAdminClient();

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      seller_id: sellerId,
      product_type_id: productTypeId as string,
      title: title as string,
      description: description ? (description as string) : "",
      image_url: imageUrl ? (imageUrl as string) : null,
      is_platform_owned: isPlatformOwned,
      status: "active",
    })
    .select("id")
    .single();

  if (productError || !product) {
    throw new Error(productError?.message || "Gagal membuat produk.");
  }

  const { error: listingError } = await admin.from("listings").insert({
    product_id: product.id,
    price,
    stock_count: stockCount,
    is_active: true,
  });

  if (listingError) {
    throw new Error(`Gagal membuat listing: ${listingError.message}`);
  }

  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/");
}

/** Verifikasi user boleh mengubah listing ini (admin, atau pemilik produknya). */
async function authorizeListingMutation(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi tidak valid. Silakan login kembali.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
    throw new Error("Akses ditolak.");
  }

  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, product_id, products ( seller_id )")
    .eq("id", listingId)
    .single();

  if (!listing) throw new Error("Listing tidak ditemukan.");

  if (profile.role !== "admin") {
    const sellerId = (listing as unknown as { products: { seller_id: string | null } })
      .products?.seller_id;
    if (sellerId !== user.id) {
      throw new Error("Akses ditolak. Produk ini bukan milik Anda.");
    }
  }

  return { admin, productId: listing.product_id as string };
}

export async function setListingActive(listingId: string, isActive: boolean) {
  const { admin } = await authorizeListingMutation(listingId);

  const { error } = await admin
    .from("listings")
    .update({ is_active: isActive })
    .eq("id", listingId);

  if (error) throw new Error(`Gagal mengubah status stok: ${error.message}`);

  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/");
}

export async function deleteListing(listingId: string) {
  const { admin, productId } = await authorizeListingMutation(listingId);

  // Hapus produk → listing ikut terhapus (FK ON DELETE CASCADE). Jika masih ada
  // pesanan yang mereferensikan listing ini, FK akan menolak → beri pesan jelas.
  const { error } = await admin.from("products").delete().eq("id", productId);

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Tidak bisa dihapus: masih ada pesanan terkait produk ini. Nonaktifkan stok saja."
      );
    }
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }

  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/");
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

  const deliveredAt = new Date();
  await admin.from("deliveries").insert({
    order_id: orderId,
    payload_encrypted: payload,
    delivery_method: deliveryMethod,
    delivered_at: deliveredAt.toISOString(),
    reveal_expires_at: revealExpiresAt(deliveredAt),
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

export async function updateListing(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
    throw new Error("Akses ditolak. Anda tidak memiliki izin untuk mengedit produk.");
  }

  const title = formData.get("title");
  const description = formData.get("description");
  const imageUrl = formData.get("imageUrl");
  const productTypeId = formData.get("productTypeId");
  const priceStr = formData.get("price");
  const stockCountStr = formData.get("stockCount");

  if (!title || !productTypeId || !priceStr || !stockCountStr) {
    throw new Error("Judul, jenis, harga, dan stok wajib diisi.");
  }

  const price = Number(priceStr);
  const stockCount = Number(stockCountStr);

  if (isNaN(price) || isNaN(stockCount) || price <= 0 || stockCount < 0) {
    throw new Error("Harga dan stok harus berupa angka valid.");
  }

  // Use admin client for the read+write — the regular client's RLS UPDATE
  // policies on products/listings may reject updates the seller should be
  // allowed to make, which is the root cause of edit failures.
  const admin = createAdminClient();

  const { data: listing } = await admin
    .from("listings")
    .select("id, product_id")
    .eq("id", listingId)
    .single();

  if (!listing) return;

  // Verify ownership if not admin (read via admin client, match seller_id)
  if (profile.role !== "admin") {
    const { data: product } = await admin
      .from("products")
      .select("id")
      .eq("id", listing.product_id)
      .eq("seller_id", user.id)
      .single();

    if (!product) {
      throw new Error("Akses ditolak. Produk ini bukan milik Anda.");
    }
  }

  // Update product details
  const { error: productUpdateError } = await admin
    .from("products")
    .update({
      title: title as string,
      description: description ? (description as string) : "",
      image_url: imageUrl ? (imageUrl as string) : null,
      product_type_id: productTypeId as string,
    })
    .eq("id", listing.product_id);

  if (productUpdateError) {
    throw new Error(`Gagal memperbarui produk: ${productUpdateError.message}`);
  }

  // Update listing pricing and stock
  const { error: listingUpdateError } = await admin
    .from("listings")
    .update({
      price,
      stock_count: stockCount,
    })
    .eq("id", listingId);

  if (listingUpdateError) {
    throw new Error(`Gagal memperbarui stok: ${listingUpdateError.message}`);
  }

  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/");
}
