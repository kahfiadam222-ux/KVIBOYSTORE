import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleBanner, deleteBanner } from "./actions";
import { AdminBannerForm } from "./AdminBannerForm";
import { HeroEditorForm } from "./HeroEditorForm";
import { FloatBannerEditorForm } from "./FloatBannerEditorForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEFAULT_FLOAT_BANNERS,
  DEFAULT_HERO,
  type FloatBanner,
  type StorefrontHeroContent,
} from "@/lib/storefront/defaults";

export default async function AdminBannersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  // Safely fetch storefront_hero with Slide 2 columns fallback
  let heroRow = null;
  try {
    const { data: heroWithSlide2 } = await admin
      .from("storefront_hero")
      .select(
        "eyebrow, title, title_highlight, description, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, slide2_title, slide2_description, slide2_cta_label, slide2_cta_href, slide2_promo_text"
      )
      .eq("id", 1)
      .maybeSingle();

    if (heroWithSlide2) {
      heroRow = heroWithSlide2;
    } else {
      const { data: fallbackHero } = await admin
        .from("storefront_hero")
        .select(
          "eyebrow, title, title_highlight, description, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href"
        )
        .eq("id", 1)
        .maybeSingle();
      heroRow = fallbackHero;
    }
  } catch {
    // Ignore error
  }

  const [{ data: banners }, { data: floatRows, error: floatErr }] =
    await Promise.all([
      admin
        .from("homepage_banners")
        .select(
          "id, title, subtitle, image_url, cta_label, cta_href, is_active, sort_order, layout"
        )
        .order("sort_order", { ascending: true }),
      admin
        .from("float_banners")
        .select("slot, title, subtitle, image_url, cta_label, cta_href, is_active")
        .order("slot", { ascending: true }),
    ]);

  const cmsReady = !floatErr;

  const hero: StorefrontHeroContent = heroRow
    ? {
        eyebrow: heroRow.eyebrow ?? DEFAULT_HERO.eyebrow,
        title: heroRow.title ?? DEFAULT_HERO.title,
        titleHighlight: heroRow.title_highlight ?? DEFAULT_HERO.titleHighlight,
        description: heroRow.description ?? DEFAULT_HERO.description,
        ctaPrimaryLabel:
          heroRow.cta_primary_label ?? DEFAULT_HERO.ctaPrimaryLabel,
        ctaPrimaryHref:
          heroRow.cta_primary_href ?? DEFAULT_HERO.ctaPrimaryHref,
        ctaSecondaryLabel:
          heroRow.cta_secondary_label ?? DEFAULT_HERO.ctaSecondaryLabel,
        ctaSecondaryHref:
          heroRow.cta_secondary_href ?? DEFAULT_HERO.ctaSecondaryHref,
        slide2Title: heroRow.slide2_title ?? DEFAULT_HERO.slide2Title,
        slide2Description:
          heroRow.slide2_description ?? DEFAULT_HERO.slide2Description,
        slide2CtaLabel:
          heroRow.slide2_cta_label ?? DEFAULT_HERO.slide2CtaLabel,
        slide2CtaHref:
          heroRow.slide2_cta_href ?? DEFAULT_HERO.slide2CtaHref,
        slide2PromoText:
          heroRow.slide2_promo_text ?? DEFAULT_HERO.slide2PromoText,
      }
    : DEFAULT_HERO;

  const floatBySlot = new Map(
    (floatRows ?? []).map((row) => [
      row.slot as number,
      {
        slot: row.slot as 1 | 2 | 3 | 4,
        title: row.title,
        subtitle: row.subtitle,
        imageUrl: row.image_url,
        ctaLabel: row.cta_label,
        ctaHref: row.cta_href,
        isActive: row.is_active,
      } satisfies FloatBanner,
    ])
  );

  const floatBanners: FloatBanner[] = ([1, 2, 3, 4] as const).map(
    (slot) => floatBySlot.get(slot) ?? DEFAULT_FLOAT_BANNERS.find((b) => b.slot === slot)!
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Konten beranda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit teks hero dan 4 kolom banner 3D. Hanya admin.
        </p>
      </div>

      {!cmsReady && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            Tabel CMS belum ada di Supabase. Jalankan migration{" "}
            <code className="font-mono text-xs">0013_storefront_cms.sql</code>{" "}
            di SQL Editor Supabase, lalu refresh halaman ini.
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Teks hero (bagian atas)</CardTitle>
          <CardDescription>
            Judul, deskripsi, dan tombol di tampilan depan storefront.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroEditorForm hero={hero} />
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-1 text-lg font-semibold">4 kolom banner 3D</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Glassmorphism + neumorphism, mengambang, bisa diputar 360° di beranda.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {floatBanners.map((banner) => (
            <Card
              key={banner.slot}
              className="border-border bg-card/40 backdrop-blur-xl"
            >
              <CardContent className="pt-5">
                <FloatBannerEditorForm banner={banner} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="gold-line opacity-40" />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Banner carousel klasik</h2>
        <Card className="mb-8 border-border bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Tambah banner</CardTitle>
            <CardDescription>
              Banner horizontal/vertikal (carousel lama).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminBannerForm />
          </CardContent>
        </Card>

        <h3 className="mb-3 text-base font-medium">Semua banner carousel</h3>
        {!banners || banners.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada banner carousel.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {banners.map((banner) => {
              const toggleWithId = toggleBanner.bind(
                null,
                banner.id,
                banner.is_active
              );
              const deleteWithId = deleteBanner.bind(null, banner.id);
              return (
                <Card key={banner.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{banner.title}</p>
                        <Badge
                          variant={banner.is_active ? "default" : "secondary"}
                        >
                          {banner.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                        <Badge variant="outline">
                          {banner.layout === "vertical"
                            ? "Vertikal"
                            : "Horizontal"}
                        </Badge>
                      </div>
                      {banner.subtitle && (
                        <p className="text-sm text-muted-foreground">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
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
      </section>
    </main>
  );
}
