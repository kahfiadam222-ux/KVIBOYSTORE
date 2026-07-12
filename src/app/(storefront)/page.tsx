import { getActiveListings } from "@/lib/catalog/queries";
import { getDeliveryLabel } from "@/lib/catalog/tierLabels";
import { getActiveBanners } from "@/lib/banners/queries";
import { createCheckout } from "./checkout/actions";
import { BannerCarousel } from "@/components/storefront/BannerCarousel";
import { SearchBar } from "@/components/storefront/SearchBar";
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <SearchBar defaultValue={q} />

      <BannerCarousel banners={banners} />

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const tier = getDeliveryLabel(listing);
            return (
              <Card key={listing.listingId}>
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
            );
          })}
        </div>
      )}
    </main>
  );
}
