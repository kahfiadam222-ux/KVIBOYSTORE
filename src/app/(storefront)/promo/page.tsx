import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Sparkles, Clock, Percent } from "lucide-react";

const promoItems = [
  {
    title: "Flash Sale Weekend",
    description: "Diskon hingga 30% untuk semua produk digital favorit!",
    code: "WEEKEND30",
    expires: "Berakhir dalam 2 hari",
    discount: "30%",
  },
  {
    title: "Member Baru",
    description: "Dapatkan diskon 20% untuk pembelian pertama Anda",
    code: "NEWBIE20",
    expires: "Tanpa batas waktu",
    discount: "20%",
  },
  {
    title: "Bundle Hemat",
    description: "Beli 3 produk sekaligus, hemat 15%",
    code: "BUNDLE15",
    expires: "Promo berlaku sampai akhir bulan",
    discount: "15%",
  },
];

export default async function PromoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gold)] to-primary">
          <Gift className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Promo & Diskon</h1>
        <p className="text-sm text-muted-foreground">
          Nikmati berbagai penawaran spesial untuk penghematan maksimal
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promoItems.map((promo, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-border bg-card/40 backdrop-blur-xl shadow-xl transition-all hover:shadow-[var(--shadow-gold)]"
          >
            <div className="absolute right-0 top-0 flex h-16 w-16 items-center justify-center rounded-bl-3xl bg-gradient-to-br from-[var(--gold)]/20 to-primary/20">
              <span className="text-lg font-bold text-[var(--gold-soft)]">{promo.discount}</span>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-[var(--gold-soft)]" />
                {promo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{promo.description}</p>
              <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
                <code className="text-sm font-mono font-semibold text-primary">{promo.code}</code>
                <button className="text-xs font-medium text-muted-foreground hover:text-primary">
                  Salin
                </button>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {promo.expires}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-muted/50 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Kode promo dapat digunakan saat checkout. Syarat dan ketentuan berlaku.
        </p>
      </div>
    </div>
  );
}
