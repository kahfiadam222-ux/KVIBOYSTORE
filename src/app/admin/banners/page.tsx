import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBanner, toggleBanner, deleteBanner } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminBannersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: banners } = await admin
    .from("homepage_banners")
    .select("id, title, subtitle, image_url, cta_label, cta_href, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Banner Homepage</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tambah Banner</CardTitle>
          <CardDescription>Banner aktif tampil bergiliran di beranda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createBanner} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Judul</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subtitle">Subjudul</Label>
              <Input id="subtitle" name="subtitle" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="imageUrl">URL Gambar Latar</Label>
              <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ctaLabel">Label Tombol</Label>
              <Input id="ctaLabel" name="ctaLabel" placeholder="Lihat Produk" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ctaHref">Tautan Tombol</Label>
              <Input id="ctaHref" name="ctaHref" placeholder="/" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sortOrder">Urutan</Label>
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue={0} />
            </div>
            <Button type="submit">Tambah Banner</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Semua Banner</h2>
      {!banners || banners.length === 0 ? (
        <p className="text-muted-foreground">Belum ada banner.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map((banner) => {
            const toggleWithId = toggleBanner.bind(null, banner.id, banner.is_active);
            const deleteWithId = deleteBanner.bind(null, banner.id);
            return (
              <Card key={banner.id}>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{banner.title}</p>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form action={toggleWithId}>
                      <Button type="submit" size="sm" variant="secondary">
                        {banner.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    </form>
                    <form action={deleteWithId}>
                      <Button type="submit" size="sm" variant="destructive">
                        Hapus
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
