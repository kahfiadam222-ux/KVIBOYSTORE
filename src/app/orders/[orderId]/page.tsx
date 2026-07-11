import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderStateLabels } from "@/lib/orders/stateLabels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const status = orderStateLabels[order.state] ?? {
    label: order.state,
    description: "",
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pesanan #{order.id.slice(0, 8)}</CardTitle>
            <Badge>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-2xl font-semibold">
            {formatPrice(order.amount, order.currency)}
          </p>
          <p className="text-sm text-muted-foreground">{status.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
