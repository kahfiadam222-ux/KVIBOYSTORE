"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { FloatBanner } from "@/lib/storefront/defaults";
import { cn } from "@/lib/utils";

const SLOT_ANGLE = 90;

export function FloatingBanners3D({ banners }: { banners: FloatBanner[] }) {
  const items = banners.slice(0, 4);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, lastX: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Gentle auto-spin when idle
  useEffect(() => {
    if (reducedMotion.current || items.length < 2) return;
    let raf = 0;
    let last = performance.now();
    let paused = false;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused && !dragRef.current.active) {
        setRotation((r) => r + dt * 0.012);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const el = containerRef.current;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    el?.addEventListener("mouseenter", pause);
    el?.addEventListener("mouseleave", resume);
    el?.addEventListener("touchstart", pause, { passive: true });
    el?.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener("mouseenter", pause);
      el?.removeEventListener("mouseleave", resume);
      el?.removeEventListener("touchstart", pause);
      el?.removeEventListener("touchend", resume);
    };
  }, [items.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      setRotation((r) => r + e.deltaY * 0.18 + e.deltaX * 0.18);
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { active: true, lastX: e.clientX };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;
    setRotation((r) => r + dx * 0.35);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  if (items.length === 0) return null;

  const radius = items.length <= 2 ? 160 : 220;

  return (
    <section className="mb-12 select-none" aria-label="Banner unggulan">
      <div className="mb-4 flex items-end justify-between gap-3 px-1">
        <div>
          <span className="section-pill">Featured</span>
          <h2 className="heading-display mt-2 text-xl sm:text-2xl">
            Banner <span className="text-premium">mengambang</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Gulir atau seret untuk memutar 360°
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative mx-auto h-[280px] sm:h-[320px] w-full max-w-4xl",
          "touch-none cursor-grab active:cursor-grabbing"
        )}
        style={{ perspective: "1100px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Floor glow / neumorph base */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 bottom-4 h-10 w-[70%] -translate-x-1/2 rounded-[100%] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)",
            filter: "blur(8px)",
          }}
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.05s linear",
          }}
        >
          {items.map((banner, i) => {
            const angle = i * (360 / items.length);
            const href = banner.ctaHref || "#produk";
            const CardInner = (
              <article
                className={cn(
                  "float-banner-card group relative h-[200px] w-[150px] sm:h-[230px] sm:w-[180px]",
                  "rounded-3xl overflow-hidden"
                )}
              >
                {/* Background image or gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: banner.imageUrl
                      ? `linear-gradient(160deg, color-mix(in oklch, var(--background) 55%, transparent), transparent 50%), url(${banner.imageUrl})`
                      : "var(--primary-gradient)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/35 to-transparent" />

                <div className="relative z-[1] flex h-full flex-col justify-end p-4">
                  <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90">
                    Slot {banner.slot}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold leading-snug text-foreground">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaLabel && (
                    <span className="mt-3 inline-flex w-fit rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] px-2.5 py-1 text-[10px] font-semibold text-foreground backdrop-blur-md">
                      {banner.ctaLabel}
                    </span>
                  )}
                </div>
              </article>
            );

            return (
              <div
                key={banner.slot}
                className="absolute"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {href.startsWith("http") || href.startsWith("/") || href.startsWith("#") ? (
                  <Link
                    href={href}
                    className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-3xl"
                    onClick={(e) => {
                      // Prevent navigation while dragging
                      if (Math.abs(rotation % SLOT_ANGLE) > 0 && dragging) {
                        e.preventDefault();
                      }
                    }}
                    draggable={false}
                  >
                    {CardInner}
                  </Link>
                ) : (
                  CardInner
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
