import Link from "next/link";
import {
  Handshake,
  TrendingUp,
  ShieldCheck,
  Zap,
  Mail,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/effects/TiltCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Partnership Program - Kviboystore",
  description:
    "Bergabunglah sebagai partner resmi Kviboystore untuk memperluas jangkauan distribusi aset digital Anda dengan sistem escrow yang aman dan terpercaya.",
};

const benefits = [
  {
    icon: TrendingUp,
    title: "Bagi Hasil Kompetitif",
    description:
      "Dapatkan margin keuntungan terbaik dengan biaya komisi platform yang sangat rendah, memaksimalkan pendapatan setiap penjualan produk Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Sistem Escrow Terjamin",
    description:
      "Dana pembeli ditahan dengan aman di rekening penampung (escrow) dan hanya akan dilepaskan setelah produk sukses terkirim dan diterima dengan baik.",
  },
  {
    icon: Zap,
    title: "Integrasi Instant Delivery",
    description:
      "Manfaatkan API dan sistem auto-fulfillment kami untuk pengiriman lisensi/kode aktivasi secara otomatis kepada pelanggan Anda dalam hitungan detik.",
  },
  {
    icon: Users,
    title: "Jangkauan Pasar Premium",
    description:
      "Produk Anda akan langsung dipromosikan ke ribuan pengguna aktif di ekosistem platform kreatif kami yang terus bertumbuh pesat.",
  },
];

const steps = [
  {
    number: "01",
    title: "Daftar Akun & Lengkapi Profil",
    description:
      "Buat akun di Kviboystore dan ajukan verifikasi sebagai akun Seller resmi melalui dashboard profil Anda.",
  },
  {
    number: "02",
    title: "Diskusi & Pemilihan Lisensi",
    description:
      "Tim kami akan menghubungi Anda untuk menyelaraskan katalog produk, hak lisensi, dan metode distribusi terbaik.",
  },
  {
    number: "03",
    title: "Unggah Produk & Hubungkan API",
    description:
      "List produk digital Anda dan hubungkan ke sistem delivery kami, baik secara instan maupun manual sesuai kebutuhan.",
  },
  {
    number: "04",
    title: "Mulai Dapatkan Penghasilan",
    description:
      "Terima pembayaran instan dari pelanggan melalui berbagai opsi e-wallet dan transfer bank lokal secara otomatis.",
  },
];

export default function PartnersPage() {
  return (
    <main className="mx-auto max-w-5xl w-full px-4 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        {/* Glow decorative orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

        <span className="section-pill mb-4 inline-flex items-center gap-1.5">
          <Sparkles className="size-3 text-primary animate-pulse" />
          Kviboystore Partnership
        </span>

        <h1 className="heading-display text-3xl sm:text-5xl tracking-tight mb-6">
          Tumbuh Bersama Sebagai <br className="hidden sm:inline" />
          <span className="text-premium">Partner Resmi Kviboystore</span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Hubungkan produk digital Anda dengan ribuan kreator, profesional, dan tech-enthusiast.
          Nikmati infrastruktur distribusi lisensi otomatis dan gerbang pembayaran lokal terlengkap.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sell"
            className="flex items-center justify-center gap-2 rounded-2xl px-6 h-12 font-semibold w-full sm:w-auto shadow-md btn-gradient text-primary-foreground shadow-[0_8px_20px_-6px_color-mix(in_oklch,var(--primary)_60%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_color-mix(in_oklch,var(--primary)_65%,transparent)] transition-all select-none duration-200 text-sm"
          >
            Mulai Jadi Seller <ArrowRight className="size-4" />
          </Link>
          <a
            href="mailto:partner@kviboystore.com?subject=Pengajuan Partnership Kviboystore"
            className="flex items-center justify-center gap-2 rounded-2xl px-6 h-12 font-semibold w-full sm:w-auto border border-border bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 transition-all select-none duration-200 text-sm backdrop-blur-md"
          >
            <Mail className="size-4 text-primary" /> Hubungi Tim Partnership
          </a>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="heading-display text-2xl sm:text-3xl">Mengapa Menjadi Partner Kami?</h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">Berbagai keunggulan infrastruktur platform yang siap menyokong bisnis digital Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <TiltCard key={i} className="rounded-3xl" glowColor="var(--gold)">
                <Card className="glass-card rounded-[inherit] h-full shadow-[var(--shadow-premium)] border-[var(--glass-border)]">
                  <CardHeader className="flex flex-row items-center gap-4 pb-3">
                    <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* How it works Section */}
      <section className="mb-20 relative">
        <div className="text-center mb-12">
          <h2 className="heading-display text-2xl sm:text-3xl">Langkah Kemitraan</h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">Proses integrasi yang mudah dan terstruktur untuk memulai kerja sama.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative p-5 sm:p-6 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-xl shadow-sm flex flex-col h-full"
            >
              <div className="text-3xl font-black text-primary/20 mb-4">{step.number}</div>
              <h3 className="font-bold text-sm sm:text-base mb-2 text-foreground">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-grow">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-xl p-8 sm:p-12 text-center relative overflow-hidden shadow-lg">
        {/* Glow decorative orbs */}
        <div className="absolute -bottom-10 -right-10 size-48 rounded-full bg-primary/15 blur-[60px] pointer-events-none" />
        <div className="absolute -top-10 -left-10 size-48 rounded-full bg-gold/15 blur-[60px] pointer-events-none" />

        <div className="max-w-xl mx-auto flex flex-col items-center gap-6 relative z-10">
          <div className="size-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <Handshake className="size-7 text-primary" />
          </div>

          <h2 className="heading-display text-2xl sm:text-3xl font-bold tracking-tight">
            Siap Mengakselerasi Distribusi Produk Anda?
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Bergabunglah sekarang dan jadilah bagian dari ekosistem digital creator hub di Kviboystore.
            Tim kemitraan kami siap membantu proses on-boarding katalog Anda.
          </p>

          <a
            href="mailto:partner@kviboystore.com?subject=Pengajuan Partnership Kviboystore"
            className="flex items-center justify-center gap-2 rounded-2xl px-6 h-12 font-semibold shadow-md mt-2 btn-gradient text-primary-foreground shadow-[0_8px_20px_-6px_color-mix(in_oklch,var(--primary)_60%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_color-mix(in_oklch,var(--primary)_65%,transparent)] transition-all select-none duration-200 text-sm"
          >
            <Mail className="size-4" /> Hubungi Tim Partnership
          </a>
        </div>
      </section>
    </main>
  );
}
