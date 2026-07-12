import { requireSeller } from "@/lib/auth/requireSeller";
import { createClient } from "@/lib/supabase/server";
import { createListing } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function SellerDashboardPage() {
  const user = await requireSeller();
  const supabase = await createClient();

  const [{ data: productTypes }, { data: products }] = await Promise.all([
    supabase.from("product_types").select("id, name").order("name"),
    supabase
      .from("products")
      .select("id, title, status, listings ( id, price, currency, stock_count, is_active )")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Dashboard Penjual</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Buat Listing Baru</CardTitle>
          <CardDescription>Listing baru langsung aktif setelah dibuat.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createListing} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="productTypeId">Jenis Produk</Label>
              <select
                id="productTypeId"
                name="productTypeId"
                required
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
              >
                {(productTypes ?? []).map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Judul Listing</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input id="description" name="description" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Harga (IDR)</Label>
              <Input id="price" name="price" type="number" min={0} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stockCount">Stok</Label>
              <Input id="stockCount" name="stockCount" type="number" min={0} defaultValue={1} required />
            </div>
            <Button type="submit">Buat Listing</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Listing Saya</h2>
      {!products || products.length === 0 ? (
        <p className="text-muted-foreground">Belum ada listing.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => {
            const listing = (
              product.listings as unknown as Array<{
                price: number;
                currency: string;
                stock_count: number;
                is_active: boolean;
              }>
            )[0];
            return (
              <Card key={product.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Stok: {listing?.stock_count ?? 0}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {listing ? formatPrice(listing.price, listing.currency) : "-"}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
