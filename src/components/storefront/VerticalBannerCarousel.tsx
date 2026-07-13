"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/banners/queries";
import { Button } from "@/components/ui/button";

const AUTO_SLIDE_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

export function VerticalBannerCarousel({ banners }: { banners: HomepageBanner[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartY = useRef<number | null>(null);
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
      className="group relative h-64 touch-pan-x overflow-hidden rounded-3xl border border-border sm:h-72"
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
        touchStartY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (touchStartY.current === null) return;
        const delta = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
          handleManualNav(index + (delta < 0 ? 1 : -1));
        }
        touchStartY.current = null;
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
                ? "rotateX(0deg) translateY(0)"
                : `rotateX(${offset > 0 ? 18 : -18}deg) translateY(${offset > 0 ? 40 : -40}px)`,
              transformStyle: "preserve-3d",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <div
              className="flex h-full w-full flex-col justify-end gap-1.5 px-3 py-4 sm:gap-2 sm:px-6 sm:py-6"
              style={{
                backgroundImage: banner.imageUrl
                  ? `linear-gradient(0deg, color-mix(in oklch, var(--background) 65%, transparent), color-mix(in oklch, var(--background) 10%, transparent)), url(${banner.imageUrl})`
                  : "var(--primary-gradient)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h2 className="text-sm font-bold text-white drop-shadow-sm sm:text-lg lg:text-xl">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="hidden text-xs text-white/85 sm:block sm:text-sm">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <Link href={banner.ctaHref} className="hidden w-fit sm:block">
                  <Button size="sm" className="mt-1">
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
            className="absolute top-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button
            aria-label="Berikutnya"
            onClick={() => handleManualNav(index + 1)}
            className="absolute bottom-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col gap-1.5">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                aria-label={`Slide ${i + 1}`}
                onClick={() => handleManualNav(i)}
                className={`w-1.5 rounded-full transition-all ${
                  i === index ? "h-6 bg-white" : "h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
