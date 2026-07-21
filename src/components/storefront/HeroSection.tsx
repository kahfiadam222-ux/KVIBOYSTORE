"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { FloatingBanners3D } from "@/components/storefront/FloatingBanners3D";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck, Zap, BadgeCheck, ArrowRight, ShoppingBag, Monitor } from "lucide-react";
import type {
  FloatBanner,
  StorefrontHeroContent,
} from "@/lib/storefront/defaults";
import { MockupSlide } from "./MockupSlide";

function emptySubscribe() {
  return () => {};
}

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
  productCount,
  content,
  floatBanners = [],
}: {
  productCount?: number;
  content: StorefrontHeroContent;
  floatBanners?: FloatBanner[];
}) {
  const [slide, setSlide] = useState(0);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide((s) => (s === 0 ? 1 : 0));
    }, 15000); // Shift every 15 seconds
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleNav = (target: number) => {
    setSlide(target);
    resetTimer();
  };

  return (
    <section className="relative mb-6 select-none">
      {/* Unified Outer Glass-hero Card */}
      <div className="relative glass-hero rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--glass-border)] px-4 py-5 sm:px-8 sm:py-7 lg:px-9 lg:py-7.5">
        <div
          aria-hidden
          className="hero-depth-plane pointer-events-none absolute -right-8 top-0 hidden h-full w-[48%] md:block"
        />

        {/* 3D Carousel Slider Wrapper (Fixed Height to prevent vertical stacking and jumps - Manual swipe/drag disabled) */}
        <div
          className="relative w-full h-[440px] sm:h-[380px] md:h-[350px] overflow-visible"
          style={{
            perspective: "1500px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Slide 1: Copy, Floating Banners, and CTA Buttons */}
          <div
            className="absolute inset-0 w-full h-full transition-all duration-700 ease-out"
            style={{
              opacity: slide === 0 ? 1 : 0,
              transform: slide === 0
                ? "rotateY(0deg) translateZ(0) scale(1) translateX(0)"
                : "rotateY(12deg) translateZ(-120px) scale(0.96) translateX(-100%)",
              transformStyle: "preserve-3d",
              pointerEvents: slide === 0 ? "auto" : "none",
              width: "100%",
              height: "100%",
              zIndex: slide === 0 ? 10 : 0,
            }}
          >
            {/* Slide 1 copy with compact fonts for PC to prevent text collisions */}
            <div className="relative z-[1] max-w-xl md:max-w-2xl">
              <p className="eyebrow mb-1.5 text-[9px] sm:text-[10px]">{content.eyebrow}</p>
              <h1 className="heading-display text-[1.2rem] leading-tight sm:text-2xl lg:text-[1.55rem] tracking-tight">
                {content.title}
                <br />
                <span className="text-premium">{content.titleHighlight}</span>
              </h1>
              <p className="mt-1.5 max-w-lg text-[10.5px] sm:text-xs text-muted-foreground leading-relaxed">
                {content.description}
              </p>
            </div>

            {/* 3D banners sit above primary CTA ("Jelajahi katalog") */}
            {floatBanners.length > 0 && (
              <div className="relative z-[1] mt-3 -mx-1">
                <FloatingBanners3D banners={floatBanners} />
              </div>
            )}

            <div className="relative z-[1] mt-3.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
              <Link
                href={content.ctaPrimaryHref || "#produk"}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group/cta h-8.5 sm:h-9.5 w-full sm:w-auto rounded-xl px-5 sm:px-6 text-xs font-bold gap-2 justify-center",
                  "shadow-[0_6px_12px_-5px_color-mix(in_oklch,var(--primary)_40%,transparent)] hover:shadow-[0_10px_20px_-7px_color-mix(in_oklch,var(--primary)_45%,transparent)]",
                  "border border-white/10"
                )}
              >
                {content.ctaPrimaryLabel}
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/cta:translate-x-1" />
              </Link>
              <Link
                href={content.ctaSecondaryHref || "/promo"}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-8.5 sm:h-9.5 w-full sm:w-auto rounded-xl px-5 sm:px-6 text-xs font-semibold border-[var(--glass-border)] bg-[var(--glass-fill)]/80 backdrop-blur justify-center"
                )}
              >
                {content.ctaSecondaryLabel}
              </Link>
              {typeof productCount === "number" && productCount > 0 && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground sm:pl-1 tracking-wide text-center sm:text-left">
                  {productCount} produk aktif
                </span>
              )}
            </div>
          </div>

          {/* Slide 2: Sleek UX Mockup Desktop (Client-Only Render to resolve initial overlap bug) */}
          {mounted && (
            <div
              className="absolute inset-0 w-full h-full transition-all duration-700 ease-out"
              style={{
                opacity: slide === 1 ? 1 : 0,
                transform: slide === 1
                  ? "rotateY(0deg) translateZ(0) scale(1) translateX(0)"
                  : "rotateY(-12deg) translateZ(-120px) scale(0.96) translateX(100%)",
                transformStyle: "preserve-3d",
                pointerEvents: slide === 1 ? "auto" : "none",
                width: "100%",
                height: "100%",
                zIndex: slide === 1 ? 10 : 0,
              }}
            >
              <MockupSlide
                floatBanners={floatBanners}
                slide2Title={content.slide2Title}
                slide2Description={content.slide2Description}
                slide2CtaLabel={content.slide2CtaLabel}
                slide2CtaHref={content.slide2CtaHref}
                slide2PromoText={content.slide2PromoText}
              />
            </div>
          )}
        </div>

        {/* Circular Icon Manual Slide Navigation Buttons (Centered and Intuitive) */}
        <div className="flex justify-center gap-3 mt-4 z-20">
          <button
            type="button"
            onClick={() => handleNav(0)}
            aria-label="Tampilan Utama/Katalog"
            className={cn(
              "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-350 touch-manipulation cursor-pointer backdrop-blur-md",
              slide === 0
                ? "bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold)] scale-110 shadow-lg shadow-amber-500/10"
                : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleNav(1)}
            aria-label="Tampilan Mockup Dashboard"
            className={cn(
              "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-350 touch-manipulation cursor-pointer backdrop-blur-md",
              slide === 1
                ? "bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold)] scale-110 shadow-lg shadow-amber-500/10"
                : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        {/* Divider line separating the slider from static bottom block */}
        <div className="gold-line my-4 opacity-30" />

        {/* Static Bottom Area (Always visible on all slides) */}
        <ul className="relative z-[1] grid gap-2.5 sm:grid-cols-3">
          {trustPoints.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex items-start gap-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-fill)]/50 px-3 py-2 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span>
                <span className="block text-[11px] font-bold text-foreground tracking-tight">
                  {title}
                </span>
                <span className="mt-0.5 block text-[9px] leading-tight text-muted-foreground">
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
