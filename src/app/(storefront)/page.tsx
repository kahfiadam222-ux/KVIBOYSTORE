import { getActiveListings } from "@/lib/catalog/queries";
import { getDeliveryLabel } from "@/lib/catalog/tierLabels";
import { getActiveBanners } from "@/lib/banners/queries";
import Link from "next/link";
import { Handshake } from "lucide-react";
import {
  getFloatBanners,
  getStorefrontHero,
} from "@/lib/storefront/queries";
import { createCheckout } from "./checkout/actions";
import { BannerCarousel } from "@/components/storefront/BannerCarousel";
import { VerticalBannerCarousel } from "@/components/storefront/VerticalBannerCarousel";
import { HeroSection } from "@/components/storefront/HeroSection";
import { SearchBar } from "@/components/storefront/SearchBar";
import { TiltCard } from "@/components/effects/TiltCard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorefrontImage } from "@/components/ui/StorefrontImage";

// Always fetch fresh catalog so newly uploaded stock & photos appear immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const { error, q } = await searchParams;
  const [listings, banners, hero, floatBanners] = await Promise.all([
    getActiveListings(q),
    getActiveBanners(),
    getStorefrontHero(),
    getFloatBanners(),
  ]);
  const horizontalBanners = banners.filter((b) => b.layout === "horizontal");
  const verticalBanners = banners.filter((b) => b.layout === "vertical");

  return (
    <main className="mx-auto max-w-7xl w-full px-2.5 py-5 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-5 sm:mb-6 max-w-2xl mx-auto flex items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <SearchBar defaultValue={q} />
        </div>
        <Link
          href="/partners"
          className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 h-12 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-xl hover:border-primary/50 text-foreground text-xs sm:text-sm font-semibold transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),var(--shadow-card)] hover:text-primary active:scale-95"
        >
          <Handshake className="size-4 text-primary" />
          <span className="hidden xs:inline">Partners</span>
          <span className="xs:hidden">Partner</span>
        </Link>
      </div>

      {!q && (
        <HeroSection
          productCount={listings.length}
          content={hero}
          floatBanners={floatBanners}
        />
      )}

      {!q && (horizontalBanners.length > 0 || verticalBanners.length > 0) && (
        <>
          {verticalBanners.length > 0 ? (
            <div className="mb-10 flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="min-w-0 w-full md:flex-[2.2]">
                <BannerCarousel banners={horizontalBanners} />
              </div>
              <div className="min-w-0 w-full md:flex-1">
                <VerticalBannerCarousel banners={verticalBanners} />
              </div>
            </div>
          ) : (
            <div className="mb-10">
              <BannerCarousel banners={horizontalBanners} />
            </div>
          )}
        </>
      )}

      <div className="gold-line mb-8 opacity-50" />

      <header id="produk" className="mb-7 scroll-mt-24">
        <span className="section-pill mb-3">Katalog</span>
        <h2 className="heading-display text-2xl sm:text-3xl mt-2">
          {q ? (
            <>
              Hasil untuk{" "}
              <span className="text-premium">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            <>
              Produk <span className="text-premium">pilihan</span>
            </>
          )}
        </h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl">
          Lisensi & langganan digital premium — terverifikasi, siap pakai.
        </p>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </header>

      {listings.length === 0 ? (
        <div className="text-center py-16 px-6 border border-[var(--glass-border)] max-w-md mx-auto rounded-lg">
          <h3 className="text-lg font-semibold text-foreground">
            Produk tidak ditemukan
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Coba kata kunci lain untuk menemukan produk yang kamu cari.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
          {listings.map((listing, listingIndex) => {
            const tier = getDeliveryLabel(listing);
            const lowStock = listing.stockCount > 0 && listing.stockCount <= 3;
            return (
              <div
                key={listing.listingId}
                className="group/card relative z-0 hover:z-30 rounded-xl product-card-shell h-full transition-transform duration-300 ease-out hover:translate-y-[-4px]"
              >
                <Card className="h-full flex flex-col glass-card rounded-[inherit] border-0 shadow-none transition-shadow duration-300 hover:shadow-[var(--shadow-glow)] overflow-hidden">
                  {/* Card image with 4/3 ratio and hover scale */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
                    <StorefrontImage
                      src={listing.imageUrl}
                      alt={listing.title || listing.productTypeName}
                      priority={listingIndex < 6}
                      overlay="product"
                      className="absolute inset-0 group-hover/card:scale-[1.045] transition-transform duration-[450ms] ease-out"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start max-w-[70%]">
                      {listing.isPlatformOwned && (
                        <Badge className="text-white border-0 text-[10px] sm:text-[11px] font-bold py-1 px-2 shadow-sm rounded-md flex items-center gap-1" style={{ background: "#ff6b4d" }}>
                          <svg
                            className="h-2.5 w-2.5 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 12 2 2 4-4" />
                            <path d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 11.91 4.59-2.15 8-6.86 8-11.91V5l-8-3z" />
                          </svg>
                          Resmi
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <Badge className="bg-[var(--glass-fill)] backdrop-blur-lg text-foreground border-[var(--glass-border)] text-[10px] sm:text-[11px] font-semibold py-1 px-2 shadow-sm rounded-md">
                        {tier.label.replace(" Delivery", "")}
                      </Badge>
                      <Badge
                        className={`backdrop-blur-lg border-[var(--glass-border)] text-[10px] sm:text-[11px] font-semibold py-1 px-2 shadow-sm rounded-md ${
                          lowStock
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-[var(--glass-fill)] text-foreground"
                        }`}
                      >
                        Stok {listing.stockCount}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-3 sm:p-3.5 pb-0 space-y-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base font-bold line-clamp-2 leading-snug break-words">
                      {listing.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-xs text-muted-foreground line-clamp-1">
                      {listing.productTypeName}
                      {listing.description ? ` · ${listing.description}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-3.5 pt-2 pb-2 flex-grow min-w-0">
                    <p className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    {!listing.isPlatformOwned &&
                      listing.sellerReputation !== null && (
                        <p className="mt-0.5 text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                          <span className="font-medium text-primary/90">
                            {listing.sellerReputation.toFixed(1)}
                          </span>
                          <span>rating</span>
                        </p>
                      )}
                  </CardContent>
                  <CardFooter className="p-3 sm:p-3.5 pt-2 border-t-0 bg-transparent mt-auto">
                    <form action={createCheckout} className="w-full">
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.listingId}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full h-9 sm:h-10 rounded-xl text-sm font-semibold shadow-md"
                      >
                        Beli Sekarang
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <footer className="mt-16 mb-4">
        <div className="gold-line mb-8 opacity-40" />
        <div className="glass-panel rounded-2xl px-5 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="brand-wordmark text-lg text-premium">kviboystore</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              Marketplace langganan digital. Aman, cepat, dan terverifikasi.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} kviboystore
          </p>
        </div>
      </footer>
    </main>
  );
}
