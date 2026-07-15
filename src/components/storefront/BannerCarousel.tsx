"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/banners/queries";
import { Button } from "@/components/ui/button";
import { StorefrontImage } from "@/components/ui/StorefrontImage";

const AUTO_SLIDE_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

export function BannerCarousel({ banners }: { banners: HomepageBanner[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % banners.length) + banners.length) % banners.length);
    },
    [banners.length],
  );

  const resetAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, AUTO_SLIDE_MS);
  }, [banners.length]);

  useEffect(() => {
    resetAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetAutoSlide]);

  const handleManualNav = (next: number) => {
    goTo(next);
    resetAutoSlide();
  };

  const pauseAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  if (banners.length === 0) return null;

  return (
    <div
      className="group relative h-44 xs:h-52 sm:h-60 md:h-72 touch-pan-y overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--glass-border)] shadow-[var(--shadow-premium)] product-card-shell"
      style={{ perspective: "1400px" }}
      onMouseEnter={pauseAutoSlide}
      onMouseLeave={() => {
        resetAutoSlide();
        setGlowStyle({ opacity: 0, transition: "opacity 0.4s ease-out" });
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        setGlowStyle({
          opacity: 1,
          background: `radial-gradient(360px circle at ${px}% ${py}%, color-mix(in oklch, var(--primary) 26%, transparent), transparent 70%)`,
        });
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
          handleManualNav(index + (delta < 0 ? 1 : -1));
        }
        touchStartX.current = null;
      }}
    >
      {banners.map((banner, i) => {
        const offset = i - index;
        const isActive = offset === 0;
        return (
          <div
            key={banner.id}
            className="absolute inset-0 transition-all duration-700 ease-out"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive
                ? "rotateY(0deg) translateZ(0) scale(1)"
                : `rotateY(${offset > 0 ? -10 : 10}deg) translateX(${offset > 0 ? 28 : -28}px) scale(0.96)`,
              transformStyle: "preserve-3d",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <StorefrontImage
              src={banner.imageUrl}
              alt={banner.title}
              priority={i === 0}
              overlay="banner"
              className="absolute inset-0"
            />
            <div className="relative z-10 flex h-full w-full flex-col justify-center gap-2 px-4 sm:gap-3 sm:px-8 lg:px-12">
              <h2 className="max-w-md heading-display text-xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-2xl lg:text-3xl">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="max-w-md text-xs text-white/90 sm:text-sm lg:text-base">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <Link href={banner.ctaHref} className="w-fit">
                  <Button
                    size="touch"
                    className="mt-1 sm:mt-2 rounded-xl font-semibold shadow-lg"
                  >
                    {banner.ctaLabel}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 z-10" style={glowStyle} />

      {banners.length > 1 && (
        <>
          <button
            aria-label="Sebelumnya"
            onClick={() => handleManualNav(index - 1)}
            className="carousel-nav-btn absolute top-1/2 left-2 sm:left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Berikutnya"
            onClick={() => handleManualNav(index + 1)}
            className="carousel-nav-btn absolute top-1/2 right-2 sm:right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                aria-label={`Slide ${i + 1}`}
                onClick={() => handleManualNav(i)}
                className={`min-h-[10px] min-w-[10px] rounded-full transition-all touch-manipulation ${
                  i === index ? "h-2.5 w-7 bg-[var(--gold)]" : "h-2.5 w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}