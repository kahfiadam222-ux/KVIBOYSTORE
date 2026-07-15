"use client";

import { useActionState } from "react";
import { updateStorefrontHero, type CmsActionState } from "./cms-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StorefrontHeroContent } from "@/lib/storefront/defaults";

const initial: CmsActionState = { ok: false };

export function HeroEditorForm({ hero }: { hero: StorefrontHeroContent }) {
  const [state, action, pending] = useActionState(updateStorefrontHero, initial);

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Slide 1 CMS Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary border-b border-border pb-1">
          Slide 1 (Tampilan Utama)
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="eyebrow">Eyebrow (kecil di atas)</Label>
            <Input
              id="eyebrow"
              name="eyebrow"
              defaultValue={hero.eyebrow}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Judul baris 1</Label>
            <Input
              id="title"
              name="title"
              defaultValue={hero.title}
              required
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="titleHighlight">Judul highlight (warna premium)</Label>
          <Input
            id="titleHighlight"
            name="titleHighlight"
            defaultValue={hero.titleHighlight}
            className="h-10 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={hero.description}
            rows={2}
            className="form-select-glass min-h-[72px] w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ctaPrimaryLabel">CTA utama — label</Label>
            <Input
              id="ctaPrimaryLabel"
              name="ctaPrimaryLabel"
              defaultValue={hero.ctaPrimaryLabel}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ctaPrimaryHref">CTA utama — link</Label>
            <Input
              id="ctaPrimaryHref"
              name="ctaPrimaryHref"
              defaultValue={hero.ctaPrimaryHref}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ctaSecondaryLabel">CTA kedua — label</Label>
            <Input
              id="ctaSecondaryLabel"
              name="ctaSecondaryLabel"
              defaultValue={hero.ctaSecondaryLabel}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ctaSecondaryHref">CTA kedua — link</Label>
            <Input
              id="ctaSecondaryHref"
              name="ctaSecondaryHref"
              defaultValue={hero.ctaSecondaryHref}
              className="h-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Slide 2 CMS Fields */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-purple-400 border-b border-border pb-1">
          Slide 2 (Mockup UI Glassmorphic)
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="slide2Title">Judul Mockup (Kanan)</Label>
            <Input
              id="slide2Title"
              name="slide2Title"
              defaultValue={hero.slide2Title}
              required
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slide2PromoText">Teks Banner Promo (Bawah)</Label>
            <Input
              id="slide2PromoText"
              name="slide2PromoText"
              defaultValue={hero.slide2PromoText}
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="slide2Description">Deskripsi Mockup (Kanan)</Label>
          <textarea
            id="slide2Description"
            name="slide2Description"
            defaultValue={hero.slide2Description}
            rows={2}
            className="form-select-glass min-h-[72px] w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="slide2CtaLabel">CTA Discover — label</Label>
            <Input
              id="slide2CtaLabel"
              name="slide2CtaLabel"
              defaultValue={hero.slide2CtaLabel}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slide2CtaHref">CTA Discover — link</Label>
            <Input
              id="slide2CtaHref"
              name="slide2CtaHref"
              defaultValue={hero.slide2CtaHref}
              className="h-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        {state.error && (
          <p className="text-sm text-destructive mb-3">{state.error}</p>
        )}
        {state.ok && !state.error && (
          <p className="text-sm text-primary mb-3">Konten Hero & Slide 2 berhasil disimpan.</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-xl font-semibold w-full sm:w-auto px-6"
        >
          {pending ? "Menyimpan..." : "Simpan semua teks hero"}
        </Button>
      </div>
    </form>
  );
}
