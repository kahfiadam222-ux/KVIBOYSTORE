"use client";

import { useState, useRef } from "react";
import { createPartnerLogo, togglePartnerLogo, deletePartnerLogo } from "./actions";
import { compressImageDetailed } from "@/lib/image";
import { IMAGE_PRESETS } from "@/lib/image-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Eye, EyeOff, Globe } from "lucide-react";
import type { PartnerLogo } from "@/lib/storefront/defaults";

export function PartnerLogosManager({ partners }: { partners: PartnerLogo[] }) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const { dataUrl } = await compressImageDetailed(file, IMAGE_PRESETS.avatar);
      setLogoPreview(dataUrl);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal mengompresi gambar logo.");
    } finally {
      setCompressing(false);
    }
  };

  const handleClearLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      {/* Form Tambah Partner */}
      <form
        ref={formRef}
        action={async (formData) => {
          if (!logoPreview) {
            alert("Harap pilih foto/logo partner terlebih dahulu.");
            return;
          }
          setSubmitting(true);
          try {
            formData.set("logoUrl", logoPreview);
            await createPartnerLogo(formData);
            formRef.current?.reset();
            setLogoPreview(null);
          } catch (err: any) {
            alert(err.message || "Gagal menambahkan partner.");
          } finally {
            setSubmitting(false);
          }
        }}
        className="flex flex-col gap-4 border-b border-border/40 pb-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="partnerName">Nama Partner / Brand</Label>
            <Input
              id="partnerName"
              name="name"
              required
              placeholder="Contoh: Canva, Spotify, Microsoft..."
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="partnerUrl">Link Tautan Platform / Website</Label>
            <Input
              id="partnerUrl"
              name="partnerUrl"
              required
              placeholder="Contoh: https://canva.com"
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sortOrder">Urutan Tampilan (Sort Order)</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={0}
              placeholder="Makin kecil makin awal..."
              className="h-10 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Logo Partner (Upload)
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-10 rounded-xl font-bold flex items-center gap-1.5 px-4 cursor-pointer"
              >
                <Upload className="h-4 w-4" /> {compressing ? "Mengompresi..." : "Pilih Logo"}
              </Button>
              {logoPreview && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="h-10 w-10 rounded-lg object-contain border border-border bg-background"
                  />
                  <Button
                    type="button"
                    onClick={handleClearLogo}
                    variant="outline"
                    className="h-8 rounded-lg font-bold border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer text-xs px-2"
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/*"
              className="hidden"
            />
            <input type="hidden" name="logoUrl" value={logoPreview ?? ""} />
          </div>
        </div>

        <Button
          type="submit"
          disabled={compressing || submitting}
          className="w-full sm:w-auto self-end rounded-xl font-semibold shadow-md px-6 mt-2"
        >
          {submitting ? "Menambahkan..." : "Tambah Partner Baru"}
        </Button>
      </form>

      {/* List Partner Saat Ini */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> Daftar Partner Terdaftar
        </h3>

        {!partners || partners.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada brand partner yang terdaftar.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {partners.map((partner) => {
              const toggleWithData = togglePartnerLogo.bind(null, partner.id, partner.isActive);
              const deleteWithId = deletePartnerLogo.bind(null, partner.id);

              return (
                <div
                  key={partner.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card/20 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-12 w-12 rounded-xl object-contain border border-border/50 bg-background/50 p-1 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">{partner.name}</span>
                        {!partner.isActive && (
                          <Badge variant="destructive" className="text-[9px] py-0 px-1.5 font-semibold">
                            Tidak Aktif
                          </Badge>
                        )}
                        {partner.isActive && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] py-0 px-1.5 font-semibold">
                            Aktif
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">Urutan: {partner.sortOrder}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{partner.partnerUrl}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={toggleWithData}>
                      <Button
                        type="submit"
                        variant="outline"
                        size="xs"
                        className="h-8 rounded-lg font-semibold px-2 cursor-pointer flex items-center gap-1 text-xs"
                      >
                        {partner.isActive ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Sembunyikan
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Tampilkan
                          </>
                        )}
                      </Button>
                    </form>

                    <form
                      action={deleteWithId}
                      onSubmit={(e) => {
                        if (!confirm(`Hapus partner "${partner.name}"?`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        size="xs"
                        className="h-8 rounded-lg font-semibold border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
