"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const MIGRATION_HINT =
  " — pastikan migration 0017_sidebar_categories.sql sudah dijalankan di Supabase.";

export type CategoryActionState = { ok: boolean; error?: string };

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { ok: false, error: "Nama kategori wajib diisi." };

  const href = String(formData.get("href") ?? "").trim() || "/";
  const iconUrl = String(formData.get("iconUrl") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder")) || 0;

  const { error } = await admin.from("sidebar_categories").insert({
    label,
    href,
    icon: "Tag",
    icon_url: iconUrl,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) return { ok: false, error: error.message + MIGRATION_HINT };

  revalidate();
  return { ok: true };
}

export async function updateCategory(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "ID kategori tidak valid." };

  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { ok: false, error: "Nama kategori wajib diisi." };

  const href = String(formData.get("href") ?? "").trim() || "/";
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const iconUrl = String(formData.get("iconUrl") ?? "").trim();
  const clearIcon = formData.get("clearIcon") === "1";

  const payload: Record<string, unknown> = {
    label,
    href,
    sort_order: sortOrder,
    is_active: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    updated_at: new Date().toISOString(),
  };

  if (clearIcon) {
    payload.icon_url = null;
  } else if (iconUrl) {
    payload.icon_url = iconUrl;
  }

  const { error } = await admin
    .from("sidebar_categories")
    .update(payload)
    .eq("id", id);

  if (error) return { ok: false, error: error.message + MIGRATION_HINT };

  revalidate();
  return { ok: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("sidebar_categories").delete().eq("id", id);
  revalidate();
}

export async function toggleCategory(id: string, isActive: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("sidebar_categories")
    .update({ is_active: !isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidate();
}
