import Link from "next/link";
import { SearchBar } from "@/components/storefront/SearchBar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck, Zap, BadgeCheck, ArrowRight } from "lucide-react";

const trustPoints = [
  {
    icon: Zap,
    title: "Instant delivery",
    desc: "Kode terkirim otomatis setelah bayar",
  },
  {
    icon: ShieldCheck,
    title: "Escrow aman",
    desc: "Dana dilindungi sampai order selesai",
  },
  {
    icon: BadgeCheck,
    title: "Produk resmi",
    desc: "Listing terverifikasi & transparan",
  },
];

export function HeroSection({
  searchQuery,
  productCount,
}: {
  searchQuery?: string;
  productCount?: number;
}) {
  return (
    <section className="relative mb-10 overflow-hidden">
      {/* Subtle 3D plane behind hero copy */}
      <div
        aria-hidden
        className="hero-depth-plane pointer-events-none absolute -right-8 top-0 hidden h-full w-[55%] md:block"
      />

      <div className="relative glass-hero rounded-3xl border border-[var(--glass-border)] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Digital marketplace · premium</p>
          <h1 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight">
            Langganan digital{" "}
            <span className="text-premium">premium</span>
            <br className="hidden sm:block" />{" "}
            yang terasa premium juga
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            KVIBOYSTORE menghadirkan lisensi & langganan resmi — checkout cepat,
            pengiriman instan, dan pengalaman belanja setara produk startup modern.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="#produk"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-10 rounded-xl px-5 text-sm font-semibold gap-2"
              )}
            >
              Jelajahi produk
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/promo"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 rounded-xl px-5 text-sm font-semibold border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur"
              )}
            >
              Lihat promo
            </Link>
            {typeof productCount === "number" && productCount > 0 && (
              <span className="text-xs text-muted-foreground pl-1">
                {productCount} produk aktif
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 max-w-2xl">
          <SearchBar defaultValue={searchQuery} embedded />
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {trustPoints.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="trust-chip group flex items-start gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)]/60 px-3.5 py-3 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-[var(--shadow-glow)]">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {title}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  {desc}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
