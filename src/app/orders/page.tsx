import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderStateLabels } from "@/lib/orders/stateLabels";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/orders/StatusBadge";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OrdersListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Silakan masuk untuk melihat pesanan."));
  }

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
              tone: "neutral" as const,
            };
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium">Pesanan #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold">
                        {formatPrice(order.amount, order.currency)}
                      </span>
                      <StatusBadge label={status.label} tone={status.tone} />
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
