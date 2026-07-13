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

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {q ? `Hasil untuk "${q}"` : "Produk Pilihan"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Marketplace langganan digital premium — terpercaya, terverifikasi.
        </p>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </header>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">Belum ada produk tersedia.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => {
            const tier = getDeliveryLabel(listing);
            return (
              <TiltCard key={listing.listingId} className="relative rounded-2xl">
                <Card>
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{
                      backgroundImage: listing.imageUrl
                        ? `url(${listing.imageUrl})`
                        : "var(--primary-gradient)",
                    }}
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{listing.productTypeName}</CardTitle>
                      <Badge>{tier.label}</Badge>
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    {!listing.isPlatformOwned && listing.sellerReputation !== null && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        ⭐ {listing.sellerReputation.toFixed(1)} rating penjual
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <form action={createCheckout} className="w-full">
                      <input type="hidden" name="listingId" value={listing.listingId} />
                      <Button type="submit" className="w-full">
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
