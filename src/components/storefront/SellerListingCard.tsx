"use client";

import { useState, useRef } from "react";
import { updateListing } from "@/app/seller/dashboard/actions";
import { compressImageDetailed } from "@/lib/image";
import { IMAGE_PRESETS } from "@/lib/image-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, X, Check, Package, FileText, Tag, DollarSign, Upload } from "lucide-react";

interface ProductType {
  id: string;
  name: string;
}

interface ProductListing {
  id: string;
  price: number;
  currency: string;
  stock_count: number;
  is_active: boolean;
}

interface Product {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  product_type_id: string;
  listings: ProductListing[] | any;
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SellerListingCard({
  product,
  productTypes,
}: {
  product: any;
  productTypes: any[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(product.image_url ?? null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProductImage(true);
    try {
      const { dataUrl } = await compressImageDetailed(file, IMAGE_PRESETS.product);
      setProductImagePreview(dataUrl);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal mengompresi foto produk.");
    } finally {
      setUploadingProductImage(false);
    }
  };

  const listingsList = product.listings as unknown as ProductListing[];
  const listing = listingsList?.[0];

  if (!listing) return null;

  return (
    <Card className="border-border bg-card/40 backdrop-blur-xl transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        {!isEditing ? (
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div 
                className="h-16 w-16 rounded-xl bg-cover bg-center border border-border/40 shrink-0 shadow-sm overflow-hidden flex items-center justify-center bg-background/20"
                style={{
                  backgroundImage: productImagePreview ? `url(${productImagePreview})` : "none",
                }}
              >
                {!productImagePreview && <Package className="h-6 w-6 text-muted-foreground/60" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-base text-foreground">{product.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {product.description || "Tidak ada deskripsi."}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {productTypes.find((t) => t.id === product.product_type_id)?.name || "Jenis Lain"}
                  </span>
                  {product.seller_profiles?.legal_name && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                      Penjual: {product.seller_profiles.legal_name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <span>💵</span> {formatPrice(listing.price, listing.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <span>📦</span> Stok: {listing.stock_count}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="touch"
              className="rounded-xl font-semibold gap-1.5 px-3 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer w-full sm:w-auto"
              type="button"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Produk
            </Button>
          </div>
        ) : (
          <form
            action={async (formData) => {
              setSubmitting(true);
              try {
                await updateListing(listing.id, formData);
                setIsEditing(false);
              } catch (err: any) {
                alert(err.message || "Gagal memperbarui produk. Coba lagi.");
              } finally {
                setSubmitting(false);
              }
            }}
            className="p-5 flex flex-col gap-4.5 border-t border-primary/10 bg-primary/5 rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Edit2 className="h-4 w-4 text-primary" />
                Edit Detail Produk & Stok
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-background/40 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Basic Info */}
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`title-${listing.id}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Nama Produk
                  </Label>
                  <Input
                    id={`title-${listing.id}`}
                    name="title"
                    defaultValue={product.title}
                    required
                    className="h-10 rounded-xl px-4 border-border bg-background/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`desc-${listing.id}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Deskripsi
                  </Label>
                  <Input
                    id={`desc-${listing.id}`}
                    name="description"
                    defaultValue={product.description ?? ""}
                    placeholder="Masukkan deskripsi produk..."
                    className="h-10 rounded-xl px-4 border-border bg-background/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`type-${listing.id}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Package className="h-3 w-3" /> Jenis Stok (Tipe Produk)
                  </Label>
                  <select
                    id={`type-${listing.id}`}
                    name="productTypeId"
                    defaultValue={product.product_type_id}
                    required
                    className="form-select-glass h-10 rounded-xl px-3 text-sm cursor-pointer border-border bg-background/50"
                  >
                    {productTypes.map((pt) => (
                      <option key={pt.id} value={pt.id} className="bg-popover text-foreground">
                        {pt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column: Pricing, Inventory & Image */}
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    Foto Jualan (Galeri)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => productImageInputRef.current?.click()}
                      variant="outline"
                      className="h-10 rounded-xl font-bold flex items-center gap-1.5 px-3.5 cursor-pointer text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" /> {uploadingProductImage ? "Mengompresi..." : "Pilih Foto"}
                    </Button>
                    {productImagePreview && (
                      <div className="h-10 w-10 rounded-lg bg-cover bg-center border border-border/60"
                        style={{ backgroundImage: `url(${productImagePreview})` }}
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={productImageInputRef}
                    onChange={handleProductImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <input type="hidden" name="imageUrl" value={productImagePreview ?? ""} />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`price-${listing.id}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Harga (IDR)
                    </Label>
                    <Input
                      id={`price-${listing.id}`}
                      name="price"
                      type="number"
                      min={0}
                      defaultValue={listing.price}
                      required
                      className="h-10 rounded-xl px-4 border-border bg-background/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`stock-${listing.id}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" /> Jumlah Stok
                    </Label>
                    <Input
                      id={`stock-${listing.id}`}
                      name="stockCount"
                      type="number"
                      min={0}
                      defaultValue={listing.stock_count}
                      required
                      className="h-10 rounded-xl px-4 border-border bg-background/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3.5 mt-2">
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={submitting}
                variant="outline"
                size="touch"
                className="rounded-xl font-semibold px-4 cursor-pointer flex-1 sm:flex-none"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="touch"
                disabled={submitting || uploadingProductImage}
                className="rounded-xl font-semibold px-4 shadow-lg shadow-primary/20 hover:shadow-primary/35 gap-1 cursor-pointer flex-1 sm:flex-none"
              >
                {submitting ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
