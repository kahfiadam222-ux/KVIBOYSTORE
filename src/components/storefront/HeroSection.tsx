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
    desc: "Kirim otomatis pasca bayar",
  },
  {
    icon: ShieldCheck,
    title: "Escrow aman",
    desc: "Dana dilindungi sampai selesai",
  },
  {
    icon: BadgeCheck,
    title: "Produk resmi",
    desc: "Terverifikasi & transparan",
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
    <section className="relative mb-6 overflow-hidden">
      <div
        aria-hidden
        className="hero-depth-plane pointer-events-none absolute -right-8 top-0 hidden h-full w-[48%] md:block"
      />

      <div className="relative glass-hero rounded-2xl sm:rounded-[1.5rem] border border-[var(--glass-border)] px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-8.5">
        <div className="relative z-[1] max-w-2xl">
          <p className="eyebrow mb-2.5 text-[9px] sm:text-[10px]">{content.eyebrow}</p>
          <h1 className="heading-display text-[1.4rem] leading-tight sm:text-3xl lg:text-[2.2rem]">
            {content.title}
            <br />
            <span className="text-premium">{content.titleHighlight}</span>
          </h1>
          <p className="mt-2.5 max-w-lg text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* 3D banners sit above primary CTA ("Jelajahi katalog") */}
        {floatBanners.length > 0 && (
          <div className="relative z-[1] mt-4 -mx-1">
            <FloatingBanners3D banners={floatBanners} />
          </div>
        )}

        <div className="relative z-[1] mt-4.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
          <Link
            href={content.ctaPrimaryHref || "#produk"}
            className={cn(
              buttonVariants({ size: "lg" }),
              "group/cta h-9 sm:h-10 w-full sm:w-auto rounded-2xl px-5 sm:px-6 text-xs sm:text-sm font-bold gap-2 justify-center",
              "shadow-[0_8px_16px_-6px_color-mix(in_oklch,var(--primary)_45%,transparent)] hover:shadow-[0_12px_24px_-8px_color-mix(in_oklch,var(--primary)_50%,transparent)]",
              "border border-white/10"
            )}
          >
            {content.ctaPrimaryLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-1" />
          </Link>
          <Link
            href={content.ctaSecondaryHref || "/promo"}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-9 sm:h-10 w-full sm:w-auto rounded-2xl px-5 sm:px-6 text-xs sm:text-sm font-semibold border-[var(--glass-border)] bg-[var(--glass-fill)]/80 backdrop-blur justify-center"
            )}
          >
            {content.ctaSecondaryLabel}
          </Link>
          {typeof productCount === "number" && productCount > 0 && (
            <span className="text-[11px] text-muted-foreground sm:pl-1 tracking-wide text-center sm:text-left">
              {productCount} produk aktif
            </span>
          )}
        </div>

        <div className="relative z-[1] mt-5 max-w-xl">
          <SearchBar defaultValue={searchQuery} embedded />
        </div>

        <ul className="relative z-[1] mt-5 grid gap-2.5 sm:grid-cols-3">
          {trustPoints.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex items-start gap-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-fill)]/50 px-3 py-2.5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span>
                <span className="block text-xs font-bold text-foreground tracking-tight">
                  {title}
                </span>
                <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
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
