import { getActiveListings } from "@/lib/catalog/queries";
import { getDeliveryLabel } from "@/lib/catalog/tierLabels";
import { getActiveBanners } from "@/lib/banners/queries";
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
      {!q ? (
        <HeroSection
          searchQuery={q}
          productCount={listings.length}
          content={hero}
          floatBanners={floatBanners}
        />
      ) : (
        <div className="mb-8 max-w-2xl mx-auto">
          <SearchBar defaultValue={q} />
        </div>
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
        <div className="glass-panel text-center py-16 px-6 rounded-3xl max-w-md mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-5 shadow-[0_0_15px_rgba(139,108,245,0.25)]">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Produk tidak ditemukan
          </h3>
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
            Kami tidak menemukan produk yang cocok. Coba kata kunci lain atau
            jelajahi kategori di sidebar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {listings.map((listing, listingIndex) => {
            const tier = getDeliveryLabel(listing);
            return (
              <TiltCard
                key={listing.listingId}
                className="group/card relative rounded-xl product-card-shell"
              >
                <Card className="h-full glass-card rounded-[inherit] border-0 shadow-none transition-shadow duration-300 hover:shadow-[var(--shadow-glow)]">
                  <div className="h-28 sm:h-36 w-full overflow-hidden relative rounded-t-[inherit]">
                    <StorefrontImage
                      src={listing.imageUrl}
                      alt={listing.productTypeName}
                      priority={listingIndex < 6}
                      overlay="product"
                      className="absolute inset-0"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      {listing.isPlatformOwned && (
                        <Badge className="bg-[var(--glass-fill)] backdrop-blur-lg text-[var(--gold)] border-[var(--glass-border)] text-[8px] sm:text-[9px] font-bold py-0.5 px-1.5 shadow-sm rounded-md flex items-center gap-0.5">
                          <svg
                            className="h-2 w-2 shrink-0"
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
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-[var(--glass-fill)] backdrop-blur-lg text-foreground border-[var(--glass-border)] text-[8px] sm:text-[9px] font-semibold py-0.5 px-1.5 shadow-sm rounded-md">
                        {tier.label.replace(" Delivery", "")}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-2.5 sm:p-3.5 pb-0 space-y-0.5">
                    <CardTitle className="text-xs sm:text-sm font-bold truncate">
                      {listing.productTypeName}
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2.5 sm:p-3.5 pt-2 pb-2 flex-grow">
                    <p className="text-sm sm:text-base font-extrabold text-primary drop-shadow-[0_0_10px_color-mix(in_oklch,var(--gold)_35%,transparent)]">
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
                  <CardFooter className="p-2.5 sm:p-3.5 pt-0 border-t-0 bg-transparent">
                    <form action={createCheckout} className="w-full">
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.listingId}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full h-9 sm:h-10 rounded-xl text-xs font-semibold shadow-md"
                      >
                        Beli Sekarang
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </TiltCard>
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
