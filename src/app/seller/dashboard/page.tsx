import { requireSeller } from "@/lib/auth/requireSeller";
import { createClient } from "@/lib/supabase/server";
import { deliverOrder, updatePayoutAccount } from "./actions";
import { SellerListingCard } from "@/components/storefront/SellerListingCard";
import { CreateListingForm } from "@/components/storefront/CreateListingForm";
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

  const [{ data: productTypes }, { data: products }, { data: pendingOrders }, { data: sellerProfile }] =
    await Promise.all([
      supabase.from("product_types").select("id, name").order("name"),
      supabase
        .from("products")
        .select("id, title, description, image_url, product_type_id, status, listings ( id, price, currency, stock_count, is_active )")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id, amount, currency, created_at")
        .eq("seller_id", user.id)
        .eq("state", "awaiting_delivery")
        .order("created_at", { ascending: true }),
      supabase
        .from("seller_profiles")
        .select("payout_channel_code, payout_account_number, payout_account_holder_name")
        .eq("user_id", user.id)
        .single(),
    ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Dashboard Penjual</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Rekening Pencairan Dana</CardTitle>
          <CardDescription>
            Dana pesanan dilepas ke sini otomatis setelah pembeli konfirmasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePayoutAccount} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="payoutChannelCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank</Label>
              <select
                id="payoutChannelCode"
                name="payoutChannelCode"
                required
                defaultValue={sellerProfile?.payout_channel_code ?? ""}
                className="form-select-glass h-10 rounded-xl px-3 text-sm cursor-pointer border-border bg-background/30"
              >
                <option value="" disabled className="bg-popover text-foreground">
                  Pilih bank
                </option>
                <option value="ID_BCA" className="bg-popover text-foreground">BCA</option>
                <option value="ID_MANDIRI" className="bg-popover text-foreground">Mandiri</option>
                <option value="ID_BNI" className="bg-popover text-foreground">BNI</option>
                <option value="ID_BRI" className="bg-popover text-foreground">BRI</option>
                <option value="ID_PERMATA" className="bg-popover text-foreground">Permata</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="payoutAccountNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nomor Rekening</Label>
              <Input
                id="payoutAccountNumber"
                name="payoutAccountNumber"
                required
                placeholder="1234567890"
                defaultValue={sellerProfile?.payout_account_number ?? ""}
                className="h-10 rounded-xl px-4 border-border bg-background/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="payoutAccountHolderName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Pemilik Rekening</Label>
              <Input
                id="payoutAccountHolderName"
                name="payoutAccountHolderName"
                required
                placeholder="JANE DOE"
                defaultValue={sellerProfile?.payout_account_holder_name ?? ""}
                className="h-10 rounded-xl px-4 border-border bg-background/30"
              />
            </div>
            <Button type="submit" className="h-10 rounded-xl font-semibold mt-2">Simpan Rekening</Button>
          </form>
        </CardContent>
      </Card>

      <CreateListingForm productTypes={productTypes ?? []} />

      <h2 className="mb-4 text-lg font-semibold">Pesanan Menunggu Pengiriman</h2>
      {!pendingOrders || pendingOrders.length === 0 ? (
        <p className="mb-8 text-muted-foreground">Tidak ada pesanan yang perlu dikirim.</p>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {pendingOrders.map((order) => {
            const deliverWithId = deliverOrder.bind(null, order.id);
            return (
              <Card key={order.id}>
                <CardContent>
                  <p className="mb-1 font-medium">Pesanan #{order.id.slice(0, 8)}</p>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {formatPrice(order.amount, order.currency)}
                  </p>
                  <form action={deliverWithId} className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      name="payload"
                      placeholder="Kredensial / kode akun untuk pembeli"
                      required
                      className="flex-1"
                    />
                    <Button type="submit">Kirim</Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold">Listing Saya</h2>
      {!products || products.length === 0 ? (
        <p className="text-muted-foreground">Belum ada listing.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <SellerListingCard
              key={product.id}
              product={product}
              productTypes={productTypes ?? []}
            />
          ))}
        </div>
      )}
    </main>
  );
}
