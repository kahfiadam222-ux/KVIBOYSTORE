import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderStateLabels } from "@/lib/orders/stateLabels";
import { confirmDelivery, openDispute, submitReview } from "./actions";
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
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
                >
                  <option value="" disabled>
                    Ada masalah? Pilih alasan
                  </option>
                  <option value="not_received">Tidak menerima produk</option>
                  <option value="credentials_invalid">Kredensial/kode tidak berfungsi</option>
                  <option value="not_as_described">Tidak sesuai deskripsi</option>
                  <option value="other">Lainnya</option>
                </select>
                <Button type="submit" variant="destructive" className="w-full">
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
                <form action={submitReviewWithId} className="flex flex-col gap-2">
                  <select
                    name="rating"
                    required
                    defaultValue=""
                    className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
                  >
                    <option value="" disabled>
                      Beri rating penjual
                    </option>
                    <option value="5">5 - Sangat baik</option>
                    <option value="4">4 - Baik</option>
                    <option value="3">3 - Cukup</option>
                    <option value="2">2 - Kurang</option>
                    <option value="1">1 - Buruk</option>
                  </select>
                  <textarea
                    name="comment"
                    placeholder="Komentar (opsional)"
                    className="min-h-16 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
                  />
                  <Button type="submit" className="w-full">
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
