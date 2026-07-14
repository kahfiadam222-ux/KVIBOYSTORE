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
    desc: "Listing terverifikasi dan transparan",
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
      <div
        aria-hidden
        className="hero-depth-plane pointer-events-none absolute -right-8 top-0 hidden h-full w-[52%] md:block"
      />

      <div className="relative glass-hero rounded-[1.75rem] border border-[var(--glass-border)] px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div className="relative z-[1] max-w-2xl">
          <p className="eyebrow mb-4">kviboystore</p>
          <h1 className="heading-display text-[2rem] sm:text-4xl lg:text-[2.75rem]">
            Langganan digital
            <br />
            <span className="text-premium">yang rapi dan cepat</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
            Marketplace lisensi dan langganan digital — checkout cepat,
            pengiriman instan, dan pengalaman belanja yang modern.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#produk"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full px-6 text-sm font-semibold gap-2"
              )}
            >
              Jelajahi katalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/promo"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-full px-6 text-sm font-semibold border-[var(--glass-border)] bg-[var(--glass-fill)]/80 backdrop-blur"
              )}
            >
              Lihat promo
            </Link>
            {typeof productCount === "number" && productCount > 0 && (
              <span className="text-xs text-muted-foreground pl-1 tracking-wide">
                {productCount} produk aktif
              </span>
            )}
          </div>
        </div>

        <div className="relative z-[1] mt-9 max-w-xl">
          <SearchBar defaultValue={searchQuery} embedded />
        </div>

        <ul className="relative z-[1] mt-9 grid gap-3 sm:grid-cols-3">
          {trustPoints.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)]/50 px-3.5 py-3.5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground tracking-tight">
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
