"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
import { MockupSlide } from "./MockupSlide";

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
  const [slide, setSlide] = useState(0);
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

        {/* 3D Carousel Slider Wrapper (Only wraps copy and CTA area) */}
        <div
          className="relative w-full overflow-visible"
          style={{
            perspective: "1500px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Slide 1: Copy, Floating Banners, and CTA Buttons */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: slide === 0 ? 1 : 0,
              transform: slide === 0
                ? "rotateY(0deg) translateZ(0) scale(1) translateX(0)"
                : "rotateY(12deg) translateZ(-120px) scale(0.96) translateX(-100%)",
              transformStyle: "preserve-3d",
              pointerEvents: slide === 0 ? "auto" : "none",
              position: slide === 0 ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: slide === 0 ? 10 : 0,
            }}
          >
            <div className="relative z-[1] max-w-2xl">
              <p className="eyebrow mb-2 text-[9px] sm:text-[10px]">{content.eyebrow}</p>
              <h1 className="heading-display text-[1.25rem] leading-tight sm:text-2xl lg:text-[1.9rem]">
                {content.title}
                <br />
                <span className="text-premium">{content.titleHighlight}</span>
              </h1>
              <p className="mt-2 max-w-lg text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
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

          {/* Slide 2: Sleek UX Mockup Desktop (Glassmorphic) */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: slide === 1 ? 1 : 0,
              transform: slide === 1
                ? "rotateY(0deg) translateZ(0) scale(1) translateX(0)"
                : "rotateY(-12deg) translateZ(-120px) scale(0.96) translateX(100%)",
              transformStyle: "preserve-3d",
              pointerEvents: slide === 1 ? "auto" : "none",
              position: slide === 1 ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: slide === 1 ? 10 : 0,
            }}
          >
            <MockupSlide floatBanners={floatBanners} />
          </div>

          {/* Manual Slide Navigation Dots */}
          <div className="absolute bottom-1 right-2 z-20 flex gap-2 sm:right-3">
            <button
              type="button"
              onClick={() => handleNav(0)}
              aria-label="Slide 1"
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 touch-manipulation cursor-pointer",
                slide === 0 ? "w-5.5 bg-[var(--gold)]" : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
            />
            <button
              type="button"
              onClick={() => handleNav(1)}
              aria-label="Slide 2"
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 touch-manipulation cursor-pointer",
                slide === 1 ? "w-5.5 bg-[var(--gold)]" : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
            />
          </div>
        </div>

        {/* Divider line separating the slider from static bottom block */}
        <div className="gold-line my-4.5 opacity-30" />

        {/* Static Bottom Area (Always visible on all slides) */}
        <div className="relative z-[1] max-w-xl">
          <SearchBar defaultValue={searchQuery} embedded />
        </div>

        <ul className="relative z-[1] mt-4 grid gap-2.5 sm:grid-cols-3">
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
