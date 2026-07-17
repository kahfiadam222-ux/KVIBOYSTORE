import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Silakan masuk untuk melihat keranjang."));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Keranjang Belanja
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Keranjang Kosong</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Belum ada produk di keranjang. Saat ini pembelian dilakukan langsung dari beranda
            lewat tombol Beli Sekarang.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
          >
            Mulai Belanja
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
