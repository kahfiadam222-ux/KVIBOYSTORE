"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createBanner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin.from("homepage_banners").insert({
    title: formData.get("title") as string,
    subtitle: (formData.get("subtitle") as string) || null,
    image_url: (formData.get("imageUrl") as string) || null,
    cta_label: (formData.get("ctaLabel") as string) || null,
    cta_href: (formData.get("ctaHref") as string) || null,
    sort_order: Number(formData.get("sortOrder")) || 0,
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
