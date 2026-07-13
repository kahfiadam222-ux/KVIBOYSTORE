"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/banners/queries";
import { Button } from "@/components/ui/button";

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

  // Restarts the 5s countdown from zero — a manual slide (dot, arrow, or
  // swipe) counts as the user "taking the wheel," so auto-advance shouldn't
  // fire a moment later on the old schedule.
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
      className="group relative h-40 xs:h-48 sm:h-56 md:h-64 touch-pan-y overflow-hidden rounded-2xl sm:rounded-3xl border border-border"
      style={{ perspective: "1200px" }}
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
                ? "rotateY(0deg) translateX(0)"
                : `rotateY(${offset > 0 ? -18 : 18}deg) translateX(${offset > 0 ? 40 : -40}px)`,
              transformStyle: "preserve-3d",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <div
              className="flex h-full w-full flex-col justify-center gap-2 px-4 sm:gap-3 sm:px-8 lg:px-12"
              style={{
                backgroundImage: banner.imageUrl
                  ? `linear-gradient(120deg, color-mix(in oklch, var(--background) 55%, transparent), color-mix(in oklch, var(--background) 15%, transparent)), url(${banner.imageUrl})`
                  : "var(--primary-gradient)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h2 className="max-w-md text-lg font-bold text-white drop-shadow-sm sm:text-2xl lg:text-3xl">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="max-w-md text-xs text-white/85 sm:text-sm lg:text-base">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <Link href={banner.ctaHref} className="w-fit">
                  <Button size="sm" className="mt-1 sm:hidden">
                    {banner.ctaLabel}
                  </Button>
                  <Button size="lg" className="mt-2 hidden sm:inline-flex">
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
            className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Berikutnya"
            onClick={() => handleManualNav(index + 1)}
            className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                aria-label={`Slide ${i + 1}`}
                onClick={() => handleManualNav(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
