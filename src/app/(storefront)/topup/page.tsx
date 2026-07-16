import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Sparkles } from "lucide-react";

const topupAmounts = [
  { amount: 50000, bonus: 0 },
  { amount: 100000, bonus: 5000 },
  { amount: 250000, bonus: 20000 },
  { amount: 500000, bonus: 50000 },
  { amount: 1000000, bonus: 150000 },
];

function formatPrice(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function TopupPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-xl">Top Up Saldo</CardTitle>
          <CardDescription>
            Isi saldo untuk pembelian lebih cepat tanpa repot bayar setiap transaksi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topupAmounts.map((item) => (
            <div
              key={item.amount}
              className="flex items-center justify-between rounded-xl border border-glass-border bg-glass-fill/50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <div>
                <p className="font-semibold">{formatPrice(item.amount)}</p>
                {item.bonus > 0 && (
                  <p className="flex items-center gap-1 text-xs text-[var(--gold-soft)]">
                    <Sparkles className="h-3 w-3" />
                    Bonus {formatPrice(item.bonus)}
                  </p>
                )}
              </div>
              <Button size="sm" className="rounded-lg">
                Pilih
              </Button>
            </div>
          ))}
          <div className="mt-6 rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Fitur top up saldo akan segera hadir. Hubungi customer service untuk informasi lebih lanjut.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
