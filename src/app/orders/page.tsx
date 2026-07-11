import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { orderStateLabels } from "@/lib/orders/stateLabels";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OrdersListPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, amount, currency, state, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Pesanan Saya</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-muted-foreground">Belum ada pesanan.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const status = orderStateLabels[order.state] ?? {
              label: order.state,
            };
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pesanan #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {formatPrice(order.amount, order.currency)}
                      </span>
                      <Badge>{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
