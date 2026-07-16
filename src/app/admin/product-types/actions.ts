"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const RISK_TIERS = ["tier_1", "tier_2", "tier_3"] as const;
export const DELIVERY_METHODS = [
  "shared_account",
  "private_account",
  "invite_family",
  "voucher",
  "redeem_code",
  "license_key",
  "lifetime_license",
] as const;

export type ProductTypeActionState = { ok: boolean; error?: string };

function revalidate() {
  revalidatePath("/admin/product-types");
  revalidatePath("/admin/listings");
  revalidatePath("/seller/dashboard");
  revalidatePath("/");
}

function isValidTier(v: string): boolean {
  return (RISK_TIERS as readonly string[]).includes(v);
}
function isValidMethod(v: string): boolean {
  return (DELIVERY_METHODS as readonly string[]).includes(v);
}

export async function createProductType(
  _prev: ProductTypeActionState,
  formData: FormData
): Promise<ProductTypeActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Nama jenis produk wajib diisi." };

  const riskTier = String(formData.get("riskTier") ?? "tier_1");
  const deliveryMethod = String(formData.get("deliveryMethod") ?? "redeem_code");
  if (!isValidTier(riskTier)) return { ok: false, error: "Risk tier tidak valid." };
  if (!isValidMethod(deliveryMethod))
    return { ok: false, error: "Metode pengiriman tidak valid." };

  const { error } = await admin.from("product_types").insert({
    name,
    risk_tier: riskTier,
    delivery_method: deliveryMethod,
  });

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: `Jenis produk "${name}" sudah ada.` };
    return { ok: false, error: error.message };
  }

  revalidate();
  return { ok: true };
}

export async function updateProductType(
  _prev: ProductTypeActionState,
  formData: FormData
): Promise<ProductTypeActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "ID jenis produk tidak valid." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Nama jenis produk wajib diisi." };

  const riskTier = String(formData.get("riskTier") ?? "tier_1");
  const deliveryMethod = String(formData.get("deliveryMethod") ?? "redeem_code");
  if (!isValidTier(riskTier)) return { ok: false, error: "Risk tier tidak valid." };
  if (!isValidMethod(deliveryMethod))
    return { ok: false, error: "Metode pengiriman tidak valid." };

  const { error } = await admin
    .from("product_types")
    .update({ name, risk_tier: riskTier, delivery_method: deliveryMethod })
    .eq("id", id);

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: `Jenis produk "${name}" sudah ada.` };
    return { ok: false, error: error.message };
  }

  revalidate();
  return { ok: true };
}

export async function deleteProductType(id: string): Promise<ProductTypeActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  // Cegah hapus jika masih dipakai produk (FK RESTRICT) — beri pesan jelas.
  const { count } = await admin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("product_type_id", id);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `Tidak bisa dihapus: masih dipakai ${count} produk. Ubah jenis produk-produk itu dulu.`,
    };
  }

  const { error } = await admin.from("product_types").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidate();
  return { ok: true };
}
