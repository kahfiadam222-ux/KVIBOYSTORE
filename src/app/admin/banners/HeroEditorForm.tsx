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
    <form action={action} className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-2 sm:col-span-1">
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
          rows={3}
          className="form-select-glass min-h-[88px] w-full rounded-xl px-3 py-2 text-sm"
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

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.ok && !state.error && (
        <p className="text-sm text-primary">Hero berhasil disimpan.</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl font-semibold w-fit"
      >
        {pending ? "Menyimpan..." : "Simpan teks hero"}
      </Button>
    </form>
  );
}
