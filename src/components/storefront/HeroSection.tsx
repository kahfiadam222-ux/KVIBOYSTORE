import Link from "next/link";
import { SearchBar } from "@/components/storefront/SearchBar";
import { FloatingBanners3D } from "@/components/storefront/FloatingBanners3D";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck, Zap, BadgeCheck, ArrowRight } from "lucide-react";
import type {
  FloatBanner,
  StorefrontHeroContent,
} from "@/lib/storefront/defaults";

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
  content,
  floatBanners = [],
}: {
  searchQuery?: string;
  productCount?: number;
  content: StorefrontHeroContent;
  floatBanners?: FloatBanner[];
}) {
  return (
    <section className="relative mb-10 overflow-hidden">
      <div
        aria-hidden
        className="hero-depth-plane pointer-events-none absolute -right-8 top-0 hidden h-full w-[52%] md:block"
      />

      <div className="relative glass-hero rounded-2xl sm:rounded-[1.75rem] border border-[var(--glass-border)] px-4 py-6 sm:px-10 sm:py-11 lg:px-14 lg:py-12">
        <div className="relative z-[1] max-w-2xl">
          <p className="eyebrow mb-4">{content.eyebrow}</p>
          <h1 className="heading-display text-[1.65rem] leading-tight sm:text-4xl lg:text-[2.75rem]">
            {content.title}
            <br />
            <span className="text-premium">{content.titleHighlight}</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* 3D banners sit above primary CTA ("Jelajahi katalog") */}
        {floatBanners.length > 0 && (
          <div className="relative z-[1] mt-6 -mx-1">
            <FloatingBanners3D banners={floatBanners} />
          </div>
        )}

        <div className="relative z-[1] mt-2 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link
            href={content.ctaPrimaryHref || "#produk"}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 sm:h-11 w-full sm:w-auto rounded-full px-5 sm:px-6 text-sm font-semibold gap-2 justify-center"
            )}
          >
            {content.ctaPrimaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={content.ctaSecondaryHref || "/promo"}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 sm:h-11 w-full sm:w-auto rounded-full px-5 sm:px-6 text-sm font-semibold border-[var(--glass-border)] bg-[var(--glass-fill)]/80 backdrop-blur justify-center"
            )}
          >
            {content.ctaSecondaryLabel}
          </Link>
          {typeof productCount === "number" && productCount > 0 && (
            <span className="text-xs text-muted-foreground sm:pl-1 tracking-wide text-center sm:text-left">
              {productCount} produk aktif
            </span>
          )}
        </div>

        <div className="relative z-[1] mt-8 max-w-xl">
          <SearchBar defaultValue={searchQuery} embedded />
        </div>

        <ul className="relative z-[1] mt-8 grid gap-3 sm:grid-cols-3">
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
