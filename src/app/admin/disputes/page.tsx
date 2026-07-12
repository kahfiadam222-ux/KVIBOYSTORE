import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisputeRefund, resolveDisputeRelease } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const reasonLabels: Record<string, string> = {
  not_received: "Tidak menerima produk",
  credentials_invalid: "Kredensial/kode tidak berfungsi",
  not_as_described: "Tidak sesuai deskripsi",
  other: "Lainnya",
};

export default async function AdminDisputesPage() {
  await requireAdmin();

  const admin = createAdminClient();

  const { data: disputes } = await admin
    .from("disputes")
    .select(
      "id, reason, status, created_at, order_id, orders ( id, amount, currency, is_platform_owned )",
    )
    .in("status", ["open", "under_review"])
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Antrian Sengketa</h1>

      {!disputes || disputes.length === 0 ? (
        <p className="text-muted-foreground">Tidak ada sengketa yang menunggu.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {disputes.map((dispute) => {
            const order = dispute.orders as unknown as {
              id: string;
              amount: number;
              currency: string;
              is_platform_owned: boolean;
            } | null;
            const refundWithIds = resolveDisputeRefund.bind(null, dispute.id, dispute.order_id);
            const releaseWithIds = resolveDisputeRelease.bind(null, dispute.id, dispute.order_id);

            return (
              <Card key={dispute.id}>
                <CardContent>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">Pesanan #{dispute.order_id.slice(0, 8)}</p>
                    <Badge variant="secondary">
                      {order ? formatPrice(order.amount, order.currency) : "-"}
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {reasonLabels[dispute.reason] ?? dispute.reason}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <form action={refundWithIds}>
                      <Button type="submit" size="sm" variant="destructive">
                        Refund Buyer
                      </Button>
                    </form>
                    {!order?.is_platform_owned && (
                      <form action={releaseWithIds}>
                        <Button type="submit" size="sm">
                          Tolak, Lepas ke Seller
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
