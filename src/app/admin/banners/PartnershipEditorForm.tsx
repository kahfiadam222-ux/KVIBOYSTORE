"use client";

import { useActionState } from "react";
import { updatePartnershipSettings, type CmsActionState } from "./cms-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PartnershipSettingsContent } from "@/lib/storefront/defaults";

const initial: CmsActionState = { ok: false };

export function PartnershipEditorForm({ settings }: { settings: PartnershipSettingsContent }) {
  const [state, action, pending] = useActionState(updatePartnershipSettings, initial);

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary border-b border-border pb-1">
          Konten Landing Page Partnership
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="eyebrow">Eyebrow (kecil di atas)</Label>
            <Input
              id="eyebrow"
              name="eyebrow"
              defaultValue={settings.eyebrow}
              required
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email Hubungan Kemitraan</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={settings.email}
              required
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Judul utama</Label>
            <Input
              id="title"
              name="title"
              defaultValue={settings.title}
              required
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="titleHighlight">Judul highlight (warna premium)</Label>
            <Input
              id="titleHighlight"
              name="titleHighlight"
              defaultValue={settings.titleHighlight}
              required
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={settings.description}
            rows={3}
            required
            className="form-select-glass min-h-[96px] w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ctaPrimaryLabel">Tombol utama — label</Label>
            <Input
              id="ctaPrimaryLabel"
              name="ctaPrimaryLabel"
              defaultValue={settings.ctaPrimaryLabel}
              required
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ctaPrimaryHref">Tombol utama — link</Label>
            <Input
              id="ctaPrimaryHref"
              name="ctaPrimaryHref"
              defaultValue={settings.ctaPrimaryHref}
              required
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ctaSecondaryLabel">Tombol kedua — label</Label>
            <Input
              id="ctaSecondaryLabel"
              name="ctaSecondaryLabel"
              defaultValue={settings.ctaSecondaryLabel}
              required
              className="h-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-destructive font-medium">{state.error}</p>
      )}

      {state.ok && (
        <p className="text-sm text-emerald-400 font-medium">
          Konten kemitraan berhasil diperbarui!
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto self-end rounded-xl font-semibold shadow-md px-6"
      >
        {pending ? "Menyimpan..." : "Simpan Perubahan Kemitraan"}
      </Button>
    </form>
  );
}
