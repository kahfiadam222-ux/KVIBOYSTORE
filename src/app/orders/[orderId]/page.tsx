import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderStateLabels } from "@/lib/orders/stateLabels";
import { confirmDelivery } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, amount, currency, state, created_at")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("payload_encrypted")
    .eq("order_id", orderId)
    .maybeSingle();

  const status = orderStateLabels[order.state] ?? {
    label: order.state,
    description: "",
  };

  const confirmDeliveryWithId = confirmDelivery.bind(null, order.id);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pesanan #{order.id.slice(0, 8)}</CardTitle>
            <Badge>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-2xl font-semibold">
            {formatPrice(order.amount, order.currency)}
          </p>
          <p className="text-sm text-muted-foreground">{status.description}</p>

          {delivery && (
            <div className="rounded-md border bg-muted p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Kode Aktivasi
              </p>
              <code className="text-sm font-semibold">
                {delivery.payload_encrypted}
              </code>
            </div>
          )}

          {order.state === "delivered" && (
            <form action={confirmDeliveryWithId}>
              <Button type="submit" className="w-full">
                Konfirmasi — Semua Berjalan Baik
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
