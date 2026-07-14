"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { FloatBanner } from "@/lib/storefront/defaults";
import { cn } from "@/lib/utils";

/**
 * 4-slot circular glossy carousel.
 * Rotation + depth are applied via rAF/DOM only (no React re-renders per frame).
 */
export function FloatingBanners3D({ banners }: { banners: FloatBanner[] }) {
  const items = banners.slice(0, 4);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotRef = useRef(0);
  const velRef = useRef(0);
  const dragRef = useRef({ active: false, lastX: 0, moved: false });
  const pausedRef = useRef(false);
  const reducedRef = useRef(false);
  const radiusRef = useRef(150);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root || items.length === 0) return;

    const count = items.length;
    const step = 360 / count;

    const measureRadius = () => {
      const w = root.clientWidth;
      // Keep cards from overlapping; scale with viewport
      radiusRef.current = Math.max(100, Math.min(180, w * 0.28));
    };
    measureRadius();

    let raf = 0;
    let last = performance.now();
    const AUTO = 18; // deg/sec — steady orbit
    const FRICTION = 0.955;
    const MAX_VEL = 4.5;

    const paint = () => {
      const rot = rotRef.current;
      const radius = radiusRef.current;
      // Stage itself does not rotate — each card orbits independently
      // so we can face-camera + depth-sort cleanly.
      stage.style.transform = "translateZ(0)";

      for (let i = 0; i < count; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const base = i * step;
        const world = base + rot;
        // Orbit then cancel yaw so face always looks at camera
        el.style.transform = `rotateY(${world}deg) translateZ(${radius}px) rotateY(${-world}deg)`;

        // Front = cos(world) close to 1
        const rad = (world * Math.PI) / 180;
        const facing = Math.cos(rad); // 1 front … -1 back
        const t = (facing + 1) / 2; // 0..1
        const scale = 0.82 + t * 0.22;
        el.style.setProperty("--fb-scale", String(scale));
        el.style.opacity = String(0.38 + t * 0.62);
        el.style.zIndex = String(Math.round(10 + t * 90));
        el.style.filter = `brightness(${0.72 + t * 0.38}) saturate(${0.85 + t * 0.2})`;
        // Soften pointer on back cards
        el.style.pointerEvents = facing > 0.15 ? "auto" : "none";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(28, now - last);
      last = now;
      const sec = dt / 1000;

      if (!dragRef.current.active && !pausedRef.current && !reducedRef.current) {
        if (Math.abs(velRef.current) > 0.015) {
          rotRef.current += velRef.current * (dt / 16);
          velRef.current *= FRICTION;
          if (Math.abs(velRef.current) < 0.015) velRef.current = 0;
        } else {
          rotRef.current += AUTO * sec;
        }
      }

      paint();
      raf = requestAnimationFrame(tick);
    };

    paint();
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      measureRadius();
      paint();
    };

    const onWheel = (e: WheelEvent) => {
      // Only capture horizontal-ish / intentional scroll on the banner
      if (Math.abs(e.deltaX) < 1 && Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const delta = e.deltaY * 0.65 + e.deltaX * 0.85;
      velRef.current = Math.max(
        -MAX_VEL,
        Math.min(MAX_VEL, velRef.current + delta * 0.014)
      );
      rotRef.current += delta * 0.09;
      paint();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      dragRef.current = { active: true, lastX: e.clientX, moved: false };
      velRef.current = 0;
      root.setPointerCapture(e.pointerId);
      root.classList.add("is-dragging");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      if (Math.abs(dx) > 2) dragRef.current.moved = true;
      dragRef.current.lastX = e.clientX;
      rotRef.current += dx * 0.28;
      velRef.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, dx * 0.09));
      paint();
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      root.classList.remove("is-dragging");
      try {
        root.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    // Pause auto only on fine pointer hover (desktop)
    const pause = () => {
      if (window.matchMedia("(hover: hover)").matches) pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };

    window.addEventListener("resize", onResize, { passive: true });
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointercancel", endDrag);
      root.removeEventListener("mouseenter", pause);
      root.removeEventListener("mouseleave", resume);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="mb-5 select-none" aria-label="Banner">
      <div
        ref={rootRef}
        className={cn(
          "float-banner-scene relative mx-auto h-[210px] sm:h-[240px] w-full max-w-3xl",
          "touch-none cursor-grab active:cursor-grabbing"
        )}
        style={{
          perspective: "1100px",
          perspectiveOrigin: "50% 48%",
          contain: "layout paint style",
        }}
      >
        {/* Soft floor reflection / glow */}
        <div aria-hidden className="float-banner-floor" />

        <div
          ref={stageRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((banner, i) => {
            const href = banner.ctaHref || "#produk";
            return (
              <div
                key={banner.slot}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="float-banner-orbit absolute"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Link
                  href={href}
                  className="float-banner-card block outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  draggable={false}
                  onClick={(e) => {
                    if (dragRef.current.moved) {
                      e.preventDefault();
                      dragRef.current.moved = false;
                    }
                  }}
                >
                  {/* Glossy layers */}
                  <span aria-hidden className="float-banner-sheen" />
                  <span aria-hidden className="float-banner-rim" />

                  <span
                    className="float-banner-media absolute inset-0"
                    style={{
                      backgroundImage: banner.imageUrl
                        ? `url(${banner.imageUrl})`
                        : undefined,
                    }}
                    data-has-image={banner.imageUrl ? "1" : "0"}
                  />
                  <span className="float-banner-scrim absolute inset-0" />

                  <span className="relative z-[2] flex h-full flex-col justify-end p-3 sm:p-3.5">
                    <span className="text-[11px] sm:text-sm font-semibold leading-snug text-white drop-shadow-sm line-clamp-2">
                      {banner.title}
                    </span>
                    {banner.subtitle && (
                      <span className="mt-0.5 text-[9px] sm:text-[10px] leading-snug text-white/75 line-clamp-2">
                        {banner.subtitle}
                      </span>
                    )}
                    {banner.ctaLabel && (
                      <span className="float-banner-cta mt-2 w-fit">
                        {banner.ctaLabel}
                      </span>
                    )}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
