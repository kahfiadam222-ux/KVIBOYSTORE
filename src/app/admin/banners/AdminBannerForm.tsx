"use client";

import { useState, useRef } from "react";
import { createBanner } from "./actions";
import { compressImageDetailed } from "@/lib/image";
import { IMAGE_PRESETS } from "@/lib/image-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export function AdminBannerForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const { dataUrl } = await compressImageDetailed(file, IMAGE_PRESETS.bannerHorizontal);
      setImagePreview(dataUrl);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal mengompresi gambar banner.");
    } finally {
      setCompressing(false);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (imagePreview) {
          formData.set("imageUrl", imagePreview);
        }
        await createBanner(formData);
        // Reset form and states
        formRef.current?.reset();
        setImagePreview(null);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Judul Banner</Label>
        <Input id="title" name="title" required placeholder="Judul utama banner..." className="h-10 rounded-xl" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subtitle">Subjudul Banner</Label>
        <Input id="subtitle" name="subtitle" placeholder="Subjudul atau deskripsi singkat..." className="h-10 rounded-xl" />
      </div>

      {/* Gallery File Selector for Banner Background Image */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Foto Latar Banner (Galeri)</Label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-10 rounded-xl font-bold flex items-center gap-1.5 px-4 cursor-pointer"
            >
              <Upload className="h-4 w-4" /> Unggah Foto Banner
            </Button>
            {imagePreview && (
              <Button
                type="button"
                onClick={handleClearImage}
                variant="outline"
                className="h-10 rounded-xl font-bold border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer px-4"
              >
                Hapus
              </Button>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          <input type="hidden" name="imageUrl" value={imagePreview ?? ""} />

          {/* Banner Preview Frame */}
          {imagePreview && (
            <div className="relative h-32 w-full rounded-2xl border border-border/60 bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: `url(${imagePreview})` }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center px-6">
                <p className="text-white text-sm font-bold truncate max-w-xs">[Preview Banner]</p>
              </div>
            </div>
          )}

          {!imagePreview && (
            <div className="h-20 w-full rounded-2xl border border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground text-xs bg-background/20 gap-1.5">
              <svg className="h-5 w-5 text-muted-foreground/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span>Belum ada foto banner yang diunggah</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ctaLabel">Label Tombol</Label>
          <Input id="ctaLabel" name="ctaLabel" placeholder="Lihat Produk" className="h-10 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ctaHref">Tautan Tombol</Label>
          <Input id="ctaHref" name="ctaHref" placeholder="/" className="h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sortOrder">Urutan Tampil</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={0} className="h-10 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="layout">Tipe Banner</Label>
          <select
            id="layout"
            name="layout"
            defaultValue="horizontal"
            className="form-select-glass h-10 rounded-xl px-3 text-sm cursor-pointer border-border bg-background/30"
          >
            <option value="horizontal" className="bg-popover text-foreground">Horizontal (slide samping)</option>
            <option value="vertical" className="bg-popover text-foreground">Vertikal (slide atas-bawah)</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        size="touch"
        disabled={compressing}
        className="rounded-xl font-bold mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 cursor-pointer w-full sm:w-auto"
      >
        {compressing ? "Mengompresi..." : "Tambah Banner"}
      </Button>
    </form>
  );
}
