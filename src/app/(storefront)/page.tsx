import { getActiveListings } from "@/lib/catalog/queries";
import { getDeliveryLabel } from "@/lib/catalog/tierLabels";
import { createCheckout } from "./checkout/actions";
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
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const listings = await getActiveListings();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">KVIBOYSTORE</h1>
        <p className="mt-2 text-muted-foreground">
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
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{listing.productTypeName}</CardTitle>
                    <Badge variant="secondary">{tier.label}</Badge>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {formatPrice(listing.price, listing.currency)}
                  </p>
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
