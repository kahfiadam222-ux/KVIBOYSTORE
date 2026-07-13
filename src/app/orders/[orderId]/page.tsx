import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderStateLabels } from "@/lib/orders/stateLabels";
import { confirmDelivery, openDispute, submitReview } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryReveal } from "@/components/effects/DeliveryReveal";
import { StatusBadge } from "@/components/orders/StatusBadge";
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
    .select("id, amount, currency, state, created_at, is_platform_owned")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("payload_encrypted")
    .eq("order_id", orderId)
    .maybeSingle();

  const { data: review } = await supabase
    .from("reviews")
    .select("rating, comment")
    .eq("order_id", orderId)
    .maybeSingle();

  const status = orderStateLabels[order.state] ?? {
    label: order.state,
    description: "",
    tone: "neutral" as const,
  };

  const confirmDeliveryWithId = confirmDelivery.bind(null, order.id);
  const openDisputeWithId = openDispute.bind(null, order.id);
  const submitReviewWithId = submitReview.bind(null, order.id);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Pesanan #{order.id.slice(0, 8)}</CardTitle>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-2xl font-semibold">
            {formatPrice(order.amount, order.currency)}
          </p>
          <p className="text-sm text-muted-foreground">{status.description}</p>

          {delivery && (
            <DeliveryReveal orderId={order.id} code={delivery.payload_encrypted} />
          )}

          {order.state === "delivered" && (
            <>
              <form action={confirmDeliveryWithId}>
                <Button type="submit" className="w-full">
                  Konfirmasi — Semua Berjalan Baik
                </Button>
              </form>

              <form action={openDisputeWithId} className="flex flex-col gap-2">
                <select
                  name="reason"
                  required
                  defaultValue=""
                  className="form-select-glass h-10 rounded-xl px-3 text-sm cursor-pointer border-border bg-background/30"
                >
                  <option value="" disabled className="bg-popover text-foreground">
                    Ada masalah? Pilih alasan
                  </option>
                  <option value="not_received" className="bg-popover text-foreground">Tidak menerima produk</option>
                  <option value="credentials_invalid" className="bg-popover text-foreground">Kredensial/kode tidak berfungsi</option>
                  <option value="not_as_described" className="bg-popover text-foreground">Tidak sesuai deskripsi</option>
                  <option value="other" className="bg-popover text-foreground">Lainnya</option>
                </select>
                <Button type="submit" variant="destructive" className="w-full h-10 rounded-xl font-semibold">
                  Laporkan Masalah
                </Button>
              </form>
            </>
          )}

          {order.state === "completed" && !order.is_platform_owned && (
            <>
              {review ? (
                <div className="rounded-md border bg-muted p-3">
                  <p className="text-sm font-medium">Ulasan Anda: {review.rating}/5</p>
                  {review.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ) : (
                <form action={submitReviewWithId} className="flex flex-col gap-3">
                  <select
                    name="rating"
                    required
                    defaultValue=""
                    className="form-select-glass h-10 rounded-xl px-3 text-sm cursor-pointer border-border bg-background/30"
                  >
                    <option value="" disabled className="bg-popover text-foreground">
                      Beri rating penjual
                    </option>
                    <option value="5" className="bg-popover text-foreground">5 - Sangat baik</option>
                    <option value="4" className="bg-popover text-foreground">4 - Baik</option>
                    <option value="3" className="bg-popover text-foreground">3 - Cukup</option>
                    <option value="2" className="bg-popover text-foreground">2 - Kurang</option>
                    <option value="1" className="bg-popover text-foreground">1 - Buruk</option>
                  </select>
                  <textarea
                    name="comment"
                    placeholder="Komentar (opsional)"
                    className="min-h-[80px] rounded-xl border border-border bg-background/20 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none transition-all duration-200 dark:bg-input/20"
                  />
                  <Button type="submit" className="w-full h-10 rounded-xl font-semibold">
                    Kirim Ulasan
                  </Button>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
