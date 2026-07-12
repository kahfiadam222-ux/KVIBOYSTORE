"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/banners/queries";
import { Button } from "@/components/ui/button";

export function BannerCarousel({ banners }: { banners: HomepageBanner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div
      className="relative mb-10 h-64 overflow-hidden rounded-3xl border border-border sm:h-72"
      style={{ perspective: "1200px" }}
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
              className="flex h-full w-full flex-col justify-center gap-3 px-8 sm:px-12"
              style={{
                backgroundImage: banner.imageUrl
                  ? `linear-gradient(120deg, color-mix(in oklch, var(--background) 55%, transparent), color-mix(in oklch, var(--background) 15%, transparent)), url(${banner.imageUrl})`
                  : "var(--primary-gradient)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h2 className="max-w-md text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="max-w-md text-sm text-white/85 sm:text-base">{banner.subtitle}</p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <Link href={banner.ctaHref} className="w-fit">
                  <Button size="lg" className="mt-2">
                    {banner.ctaLabel}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
