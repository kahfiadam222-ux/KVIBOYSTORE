import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { CategoryManager } from "./CategoryManager";
import { DEFAULT_CATEGORIES, type SidebarCategory } from "@/lib/categories/defaults";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("sidebar_categories")
    .select("id, label, href, icon, icon_url, sort_order, is_active")
    .order("sort_order", { ascending: true });

  const cmsReady = !error;

  const categories: SidebarCategory[] = cmsReady
    ? (data ?? []).map((row) => ({
        id: row.id as string,
        label: row.label as string,
        href: row.href as string,
        iconName: (row.icon as string) ?? "Tag",
        iconUrl: (row.icon_url as string) ?? null,
        sortOrder: (row.sort_order as number) ?? 0,
        isActive: row.is_active as boolean,
      }))
    : DEFAULT_CATEGORIES;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kategori sidebar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur kategori yang tampil di sidebar — ubah nama, logo, urutan, dan
          tambah kategori baru. Hanya admin.
        </p>
      </div>

      {!cmsReady && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            Tabel kategori belum ada di Supabase. Jalankan migration{" "}
            <code className="font-mono text-xs">0017_sidebar_categories.sql</code>{" "}
            di SQL Editor Supabase, lalu refresh halaman ini. Sementara ini
            sidebar memakai kategori bawaan.
          </CardContent>
        </Card>
      )}

      <CategoryManager categories={categories} />
    </main>
  );
}
