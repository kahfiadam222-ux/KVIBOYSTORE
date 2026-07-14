"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export type CmsActionState = { ok: boolean; error?: string };

export async function updateStorefrontHero(
  _prev: CmsActionState,
  formData: FormData
): Promise<CmsActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const payload = {
    id: 1,
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || "kviboystore",
    title: String(formData.get("title") ?? "").trim() || "Langganan digital",
    title_highlight:
      String(formData.get("titleHighlight") ?? "").trim() ||
      "yang rapi dan cepat",
    description:
      String(formData.get("description") ?? "").trim() ||
      "Marketplace lisensi dan langganan digital.",
    cta_primary_label:
      String(formData.get("ctaPrimaryLabel") ?? "").trim() || "Jelajahi katalog",
    cta_primary_href:
      String(formData.get("ctaPrimaryHref") ?? "").trim() || "#produk",
    cta_secondary_label:
      String(formData.get("ctaSecondaryLabel") ?? "").trim() || "Lihat promo",
    cta_secondary_href:
      String(formData.get("ctaSecondaryHref") ?? "").trim() || "/promo",
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("storefront_hero").upsert(payload);

  if (error) {
    return {
      ok: false,
      error:
        error.message +
        " — pastikan migration 0013_storefront_cms.sql sudah dijalankan di Supabase.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  return { ok: true };
}

export async function updateFloatBanner(
  _prev: CmsActionState,
  formData: FormData
): Promise<CmsActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const slot = Number(formData.get("slot"));
  if (![1, 2, 3, 4].includes(slot)) {
    return { ok: false, error: "Slot banner harus 1–4." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Judul wajib diisi." };

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const clearImage = formData.get("clearImage") === "1";

  const payload: Record<string, unknown> = {
    slot,
    title,
    subtitle: String(formData.get("subtitle") ?? "").trim() || null,
    cta_label: String(formData.get("ctaLabel") ?? "").trim() || null,
    cta_href: String(formData.get("ctaHref") ?? "").trim() || null,
    is_active: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    updated_at: new Date().toISOString(),
  };

  if (clearImage) {
    payload.image_url = null;
  } else if (imageUrl) {
    payload.image_url = imageUrl;
  }

  const { error } = await admin.from("float_banners").upsert(payload);

  if (error) {
    return {
      ok: false,
      error:
        error.message +
        " — pastikan migration 0013_storefront_cms.sql sudah dijalankan di Supabase.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  return { ok: true };
}
