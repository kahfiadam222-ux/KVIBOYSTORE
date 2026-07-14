"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { FloatBanner } from "@/lib/storefront/defaults";
import { cn } from "@/lib/utils";

/**
 * High-performance 3D carousel: rotation is applied via DOM transforms
 * (no React setState per frame) for smooth 60–120fps on mobile + desktop.
 */
export function FloatingBanners3D({ banners }: { banners: FloatBanner[] }) {
  const items = banners.slice(0, 4);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0);
  const velRef = useRef(0);
  const dragRef = useRef({
    active: false,
    lastX: 0,
    moved: false,
    pointerId: -1,
  });
  const pausedRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root || items.length === 0) return;

    let raf = 0;
    let last = performance.now();
    const AUTO_DEG_PER_SEC = 14;
    const FRICTION = 0.94;
    const MAX_VEL = 3.2;

    const apply = () => {
      // GPU layer — only transform, no layout
      stage.style.transform = `translateZ(0) rotateY(${rotRef.current}deg)`;
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const sec = dt / 1000;

      if (dragRef.current.active) {
        // velocity handled in pointermove
      } else if (!pausedRef.current && !reducedRef.current) {
        // decay user fling, then gentle auto-spin
        if (Math.abs(velRef.current) > 0.02) {
          rotRef.current += velRef.current * (dt / 16);
          velRef.current *= FRICTION;
        } else {
          velRef.current = 0;
          rotRef.current += AUTO_DEG_PER_SEC * sec;
        }
      }

      apply();
      raf = requestAnimationFrame(tick);
    };

    apply();
    raf = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY + e.deltaX;
      velRef.current = Math.max(
        -MAX_VEL,
        Math.min(MAX_VEL, velRef.current + delta * 0.012)
      );
      rotRef.current += delta * 0.1;
      apply();
    };

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current = {
        active: true,
        lastX: e.clientX,
        moved: false,
        pointerId: e.pointerId,
      };
      velRef.current = 0;
      root.setPointerCapture(e.pointerId);
      root.classList.add("is-dragging");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      if (Math.abs(dx) > 2) dragRef.current.moved = true;
      dragRef.current.lastX = e.clientX;
      rotRef.current += dx * 0.32;
      velRef.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, dx * 0.08));
      apply();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      root.classList.remove("is-dragging");
      try {
        root.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("mouseenter", pause);
      root.removeEventListener("mouseleave", resume);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  const radius = items.length <= 2 ? 110 : 145;

  return (
    <section
      className="mb-6 select-none"
      aria-label="Banner"
    >
      <div
        ref={rootRef}
        className={cn(
          "relative mx-auto h-[200px] sm:h-[220px] w-full max-w-3xl",
          "touch-none cursor-grab active:cursor-grabbing"
        )}
        style={{
          perspective: "900px",
          contain: "layout paint style",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 bottom-2 h-6 w-[55%] -translate-x-1/2 rounded-[100%] opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%)",
            filter: "blur(6px)",
          }}
        />

        <div
          ref={stageRef}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          {items.map((banner, i) => {
            const angle = i * (360 / items.length);
            const href = banner.ctaHref || "#produk";

            const card = (
              <article
                className={cn(
                  "float-banner-card relative h-[148px] w-[112px] sm:h-[168px] sm:w-[128px]",
                  "rounded-2xl overflow-hidden"
                )}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: banner.imageUrl
                      ? `linear-gradient(160deg, color-mix(in oklch, var(--background) 50%, transparent), transparent 55%), url(${banner.imageUrl})`
                      : "var(--primary-gradient)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                <div className="relative z-[1] flex h-full flex-col justify-end p-3">
                  <h3 className="text-xs sm:text-sm font-semibold leading-snug text-foreground line-clamp-2">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaLabel && (
                    <span className="mt-2 inline-flex w-fit rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] px-2 py-0.5 text-[9px] font-semibold text-foreground backdrop-blur-md">
                      {banner.ctaLabel}
                    </span>
                  )}
                </div>
              </article>
            );

            return (
              <div
                key={banner.slot}
                className="absolute will-change-transform"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <Link
                  href={href}
                  className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  draggable={false}
                  onClick={(e) => {
                    if (dragRef.current.moved) {
                      e.preventDefault();
                      dragRef.current.moved = false;
                    }
                  }}
                >
                  {card}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
