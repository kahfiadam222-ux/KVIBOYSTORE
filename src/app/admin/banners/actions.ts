"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createBanner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const layout = formData.get("layout") as string;

  await admin.from("homepage_banners").insert({
    title: formData.get("title") as string,
    subtitle: (formData.get("subtitle") as string) || null,
    image_url: (formData.get("imageUrl") as string) || null,
    cta_label: (formData.get("ctaLabel") as string) || null,
    cta_href: (formData.get("ctaHref") as string) || null,
    sort_order: Number(formData.get("sortOrder")) || 0,
    layout: layout === "vertical" ? "vertical" : "horizontal",
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBanner(bannerId: string, isActive: boolean) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin.from("homepage_banners").update({ is_active: !isActive }).eq("id", bannerId);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBanner(bannerId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin.from("homepage_banners").delete().eq("id", bannerId);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function createPartnerLogo(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const partnerUrl = String(formData.get("partnerUrl") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder")) || 0;

  if (!name || !logoUrl || !partnerUrl) {
    throw new Error("Nama, URL logo, dan Link Partner wajib diisi.");
  }

  // Block javascript: / data: URLs in partner links.
  try {
    const parsed = new URL(partnerUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("invalid");
    }
  } catch {
    throw new Error("Link partner harus URL http/https yang valid.");
  }

  const { error } = await admin.from("partner_logos").insert({
    name,
    logo_url: logoUrl,
    partner_url: partnerUrl,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) {
    throw new Error(error.message + " — pastikan migration 0019_partner_logos.sql sudah dijalankan.");
  }

  revalidatePath("/admin/banners");
  revalidatePath("/partners");
}

export async function togglePartnerLogo(partnerId: string, isActive: boolean) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin.from("partner_logos").update({ is_active: !isActive }).eq("id", partnerId);

  revalidatePath("/admin/banners");
  revalidatePath("/partners");
}

export async function deletePartnerLogo(partnerId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin.from("partner_logos").delete().eq("id", partnerId);

  revalidatePath("/admin/banners");
  revalidatePath("/partners");
}
