"use client";

import { useState, useRef } from "react";
import { createListing } from "@/app/seller/dashboard/actions";
import { compressImageDetailed } from "@/lib/image";
import { IMAGE_PRESETS } from "@/lib/image-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Upload, Tag, FileText, Package, DollarSign, UserCheck } from "lucide-react";

export function CreateListingForm({
  productTypes,
  sellers,
  isAdmin = false,
}: {
  productTypes: { id: string; name: string }[];
  sellers?: { user_id: string; legal_name: string }[];
  isAdmin?: boolean;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const { dataUrl } = await compressImageDetailed(file, IMAGE_PRESETS.product);
      setImagePreview(dataUrl);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal mengompresi foto produk.");
    } finally {
      setCompressing(false);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden mb-8">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <PlusCircle className="h-4.5 w-4.5 text-primary" />
          {isAdmin ? "Tambah Produk Baru (Admin)" : "Buat Listing Baru"}
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Tambahkan produk baru ke platform atas nama salah satu penjual terdaftar." 
            : "Listing baru langsung aktif setelah dibuat."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={async (formData) => {
            setSubmitting(true);
            try {
              if (imagePreview) {
                formData.set("imageUrl", imagePreview);
              }
              await createListing(formData);
              formRef.current?.reset();
              setImagePreview(null);
              alert("Produk baru berhasil ditambahkan!");
            } catch (err: any) {
              alert(err.message || "Gagal membuat produk.");
            } finally {
              setSubmitting(false);
            }
          }}
          className="flex flex-col gap-4.5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Basic Details */}
            <div className="flex flex-col gap-4">
              {isAdmin && sellers && sellers.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sellerId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5" /> Pilih Penjual (Owner)
                  </Label>
                  <select
                    id="sellerId"
                    name="sellerId"
                    required
                    className="form-select-glass h-10 rounded-xl px-3 text-sm cursor-pointer border-border bg-background/30"
                  >
                    {sellers.map((s) => (
                      <option key={s.user_id} value={s.user_id} className="bg-popover text-foreground">
                        {s.legal_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="productTypeId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> Jenis Produk
                </Label>
                <select
                  id="productTypeId"
                  name="productTypeId"
                  required
                  className="form-select-glass h-10 rounded-xl px-3 text-sm cursor-pointer border-border bg-background/30"
                >
                  {productTypes.map((pt) => (
                    <option key={pt.id} value={pt.id} className="bg-popover text-foreground">
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Judul Listing
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="misal: Netflix Premium 1 Bulan"
                  className="h-10 rounded-xl px-4 border-border bg-background/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Deskripsi
                </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="misal: Garansi penuh, 1 screen UHD"
                  className="h-10 rounded-xl px-4 border-border bg-background/30"
                />
              </div>
            </div>

            {/* Right Column: Pricing, Stock, and Image Upload */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  Foto Produk (Galeri)
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-10 rounded-xl font-bold flex items-center gap-1.5 px-4 cursor-pointer text-xs"
                  >
                    <Upload className="h-4 w-4" /> Pilih Foto
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      onClick={handleClearImage}
                      variant="outline"
                      className="h-10 rounded-xl font-bold border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer px-4 text-xs"
                    >
                      Hapus
                    </Button>
                  )}
                  {imagePreview && (
                    <div className="h-10 w-10 rounded-lg bg-cover bg-center border border-border/60 ml-auto"
                      style={{ backgroundImage: `url(${imagePreview})` }}
                    />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" /> Harga (IDR)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    required
                    placeholder="50000"
                    className="h-10 rounded-xl px-4 border-border bg-background/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="stockCount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" /> Jumlah Stok
                  </Label>
                  <Input
                    id="stockCount"
                    name="stockCount"
                    type="number"
                    min={0}
                    defaultValue={1}
                    required
                    className="h-10 rounded-xl px-4 border-border bg-background/30"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="touch"
            disabled={compressing || submitting}
            className="rounded-xl font-bold mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 cursor-pointer w-full sm:w-auto"
          >
            {compressing ? "Mengompresi..." : submitting ? "Membuat..." : "Buat Listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
