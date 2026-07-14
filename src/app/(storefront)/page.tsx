import { getActiveListings } from "@/lib/catalog/queries";
import { getDeliveryLabel } from "@/lib/catalog/tierLabels";
import { getActiveBanners } from "@/lib/banners/queries";
import { createCheckout } from "./checkout/actions";
import { BannerCarousel } from "@/components/storefront/BannerCarousel";
import { VerticalBannerCarousel } from "@/components/storefront/VerticalBannerCarousel";
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
  const [listings, banners] = await Promise.all([
    getActiveListings(q),
    getActiveBanners(),
  ]);
  const horizontalBanners = banners.filter((b) => b.layout === "horizontal");
  const verticalBanners = banners.filter((b) => b.layout === "vertical");

  return (
    <main className="mx-auto max-w-7xl px-3 py-10 sm:px-6 lg:px-8">
      <SearchBar defaultValue={q} />

      {verticalBanners.length > 0 ? (
        <div className="mb-10 flex flex-row gap-3 sm:gap-4">
          <div className="min-w-0 flex-[2.2]">
            <BannerCarousel banners={horizontalBanners} />
          </div>
          <div className="min-w-0 flex-1">
            <VerticalBannerCarousel banners={verticalBanners} />
          </div>
        </div>
      ) : (
        <div className="mb-10">
          <BannerCarousel banners={horizontalBanners} />
        </div>
      )}

      {/* ── Gold line transition between banner and products ── */}
      <div className="gold-line mb-10 opacity-60" />

      <header className="mb-8">
        <p className="eyebrow mb-2">Koleksi Premium</p>
        <h1 className="heading-display text-3xl sm:text-4xl">
          {q ? (
            <>Hasil untuk &ldquo;{q}&rdquo;</>
          ) : (
            <>
              Produk{" "}
              <span className="text-premium">Pilihan</span>
            </>
          )}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Marketplace langganan digital premium — terpercaya, terverifikasi.
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
          <h3 className="text-xl font-bold text-foreground">Produk tidak ditemukan</h3>
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
            Kami tidak menemukan produk yang cocok dengan pencarian Anda. Coba masukkan kata kunci yang berbeda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {listings.map((listing) => {
            const tier = getDeliveryLabel(listing);
            return (
              <TiltCard key={listing.listingId} className="relative rounded-xl sm:rounded-2xl">
                <Card className="h-full glass-card rounded-[inherit] transition-shadow duration-300 hover:shadow-[var(--shadow-glow)]">
                  <div className="h-20 sm:h-28 w-full overflow-hidden relative rounded-t-[inherit]">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover/card:scale-110"
                      style={{
                        backgroundImage: listing.imageUrl
                          ? `url(${listing.imageUrl})`
                          : "var(--primary-gradient)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/30 to-transparent opacity-75" />
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                      <Badge className="bg-[var(--glass-fill)] backdrop-blur-lg text-foreground border-[var(--glass-border)] text-[9px] sm:text-[10px] font-semibold py-0.5 px-1.5 sm:px-2 shadow-sm rounded-full">
                        {tier.label}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-2 sm:p-3 pb-0 space-y-0.5">
                    <CardTitle className="text-xs sm:text-sm font-bold truncate">{listing.productTypeName}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3 pt-1.5 sm:pt-2 pb-1.5 sm:pb-2 flex-grow">
                    <p className="text-sm sm:text-base font-extrabold text-primary drop-shadow-[0_0_10px_color-mix(in_oklch,var(--gold)_35%,transparent)]">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    {!listing.isPlatformOwned && listing.sellerReputation !== null && (
                      <p className="mt-0.5 text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <span>⭐</span>
                        <span>{listing.sellerReputation.toFixed(1)}</span>
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-2 sm:p-3 pt-0 border-t-0 bg-transparent">
                    <form action={createCheckout} className="w-full">
                      <input type="hidden" name="listingId" value={listing.listingId} />
                      <Button type="submit" size="xs" className="w-full text-[10px] sm:text-xs font-semibold h-7 sm:h-8 rounded-lg sm:rounded-xl">
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
    </main>
  );
}
