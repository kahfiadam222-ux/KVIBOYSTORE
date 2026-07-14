"use client";

import { useActionState, useRef, useState } from "react";
import { updateFloatBanner, type CmsActionState } from "./cms-actions";
import { compressImage } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FloatBanner } from "@/lib/storefront/defaults";
import { Upload, X } from "lucide-react";

const initial: CmsActionState = { ok: false };

export function FloatBannerEditorForm({ banner }: { banner: FloatBanner }) {
  const [state, action, pending] = useActionState(updateFloatBanner, initial);
  const [imagePreview, setImagePreview] = useState<string | null>(
    banner.imageUrl
  );
  const [clearImage, setClearImage] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const base64 = await compressImage(file, 900, 1200, 0.78);
      setImagePreview(base64);
      setClearImage(false);
    } catch {
      alert("Gagal mengompresi gambar.");
    } finally {
      setCompressing(false);
    }
  };

  const newImageData =
    imagePreview && imagePreview.startsWith("data:") ? imagePreview : "";

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="slot" value={banner.slot} />
      <input type="hidden" name="imageUrl" value={newImageData} />
      <input type="hidden" name="clearImage" value={clearImage ? "1" : ""} />

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Kolom banner {banner.slot}</p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={banner.isActive}
            className="rounded border-border"
          />
          Aktif
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`title-${banner.slot}`}>Judul</Label>
        <Input
          id={`title-${banner.slot}`}
          name="title"
          defaultValue={banner.title}
          required
          className="h-9 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`subtitle-${banner.slot}`}>Subjudul</Label>
        <Input
          id={`subtitle-${banner.slot}`}
          name="subtitle"
          defaultValue={banner.subtitle ?? ""}
          className="h-9 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`ctaLabel-${banner.slot}`}>Label tombol</Label>
          <Input
            id={`ctaLabel-${banner.slot}`}
            name="ctaLabel"
            defaultValue={banner.ctaLabel ?? ""}
            className="h-9 rounded-xl"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`ctaHref-${banner.slot}`}>Link</Label>
          <Input
            id={`ctaHref-${banner.slot}`}
            name="ctaHref"
            defaultValue={banner.ctaHref ?? ""}
            className="h-9 rounded-xl"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">Gambar latar</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1" /> Unggah
          </Button>
          {imagePreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl text-destructive"
              onClick={() => {
                setImagePreview(null);
                setClearImage(true);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" /> Hapus gambar
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div
            className="h-24 w-full rounded-xl bg-cover bg-center border border-[var(--glass-border)]"
            style={{ backgroundImage: `url(${imagePreview})` }}
          />
        )}
      </div>

      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      {state.ok && !state.error && (
        <p className="text-xs text-primary">Banner {banner.slot} disimpan.</p>
      )}

      <Button
        type="submit"
        size="sm"
        disabled={pending || compressing}
        className="rounded-xl font-semibold w-fit"
      >
        {compressing
          ? "Mengompresi..."
          : pending
            ? "Menyimpan..."
            : `Simpan kolom ${banner.slot}`}
      </Button>
    </form>
  );
}
