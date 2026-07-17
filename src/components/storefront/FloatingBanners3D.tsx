"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import type { FloatBanner } from "@/lib/storefront/defaults";
import { cn } from "@/lib/utils";
import { X, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

function emptySubscribe() {
  return () => {};
}

/**
 * 4-slot circular glossy carousel.
 * Rotation + depth are applied via rAF/DOM only (no React re-renders per frame).
 * Click to Zoom-in Modal feature with React Portal for absolute z-index isolation.
 */
export function FloatingBanners3D({ banners }: { banners: FloatBanner[] }) {
  const items = banners.slice(0, 4);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotRef = useRef(0);
  const velRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, lastX: 0, moved: false });
  const pausedRef = useRef(false);
  const reducedRef = useRef(false);
  const radiusRef = useRef(150);

  // Merekam waktu dan koordinat koordinat pointerdown pada tombol card untuk membedakan klik vs drag
  const clickStartRef = useRef<{ [key: string]: { x: number; y: number; time: number } }>({});

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [zoomedBanner, setZoomedBanner] = useState<FloatBanner | null>(null);
  const [modalStage, setModalStage] = useState<"enter" | "exit">("exit");

  const handleOpenZoom = (banner: FloatBanner) => {
    setZoomedBanner(banner);
    setModalStage("enter");
  };

  const handleCloseZoom = () => {
    setModalStage("exit");
    setTimeout(() => {
      setZoomedBanner(null);
    }, 200);
  };

  // Lock body scroll while zoom modal is open (DOM side-effect only).
  useEffect(() => {
    if (!zoomedBanner) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [zoomedBanner]);

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
      radiusRef.current = Math.max(100, Math.min(180, w * 0.28));
    };
    measureRadius();

    let raf = 0;
    let last = performance.now();
    const AUTO = 18; // deg/sec
    const FRICTION = 0.955;
    const MAX_VEL = 4.5;

    const paint = () => {
      const rot = rotRef.current;
      const radius = radiusRef.current;
      stage.style.transform = "translateZ(0)";

      for (let i = 0; i < count; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const base = i * step;
        const world = base + rot;
        el.style.transform = `rotateY(${world}deg) translateZ(${radius}px) rotateY(${-world}deg)`;

        const rad = (world * Math.PI) / 180;
        const facing = Math.cos(rad);
        const t = (facing + 1) / 2;
        const scale = 0.82 + t * 0.22;
        el.style.setProperty("--fb-scale", String(scale));
        el.style.opacity = String(0.38 + t * 0.62);
        el.style.zIndex = String(Math.round(10 + t * 90));
        el.style.filter = `brightness(${0.72 + t * 0.38}) saturate(${0.85 + t * 0.2})`;

        // Di PC & HP, berikan pointerEvents "auto" ke semua card depan untuk interaksi klik yang andal
        el.style.pointerEvents = facing > -0.05 ? "auto" : "none";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(28, now - last);
      last = now;
      const sec = dt / 1000;

      const isModalActive = zoomedBanner !== null || modalStage === "enter";

      if (!dragRef.current.active && !pausedRef.current && !reducedRef.current && !isModalActive) {
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
      if (zoomedBanner) return;
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
      if (zoomedBanner) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        moved: false,
      };
      velRef.current = 0;
      root.setPointerCapture(e.pointerId);
      root.classList.add("is-dragging");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active || zoomedBanner) return;
      const dx = e.clientX - dragRef.current.lastX;

      const dist = Math.sqrt(
        Math.pow(e.clientX - dragRef.current.startX, 2) +
        Math.pow(e.clientY - dragRef.current.startY, 2)
      );
      if (dist > 4) {
        dragRef.current.moved = true;
      }

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
  }, [items.length, zoomedBanner, modalStage]);

  if (items.length === 0) return null;

  const renderModalPortal = () => {
    if (!mounted || !zoomedBanner) return null;

    return createPortal(
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center p-4",
          "bg-black/35 backdrop-blur-[6px] transition-all duration-200 ease-out",
          modalStage === "enter" ? "opacity-100 animate-fade-in-quick" : "opacity-0 pointer-events-none"
        )}
        onClick={handleCloseZoom}
      >
        {/* Main Modal Box - Vertically Oriented Card (aspect-[3/4.2]) */}
        <div
          className={cn(
            "relative w-full max-w-[280px] sm:max-w-[300px] aspect-[3/4.2] overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-[var(--glass-fill)] via-background/98 to-background/96 shadow-2xl backdrop-blur-2xl",
            "transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)",
            modalStage === "enter" ? "scale-100 opacity-100 translate-y-0" : "scale-[0.88] opacity-0 translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseZoom}
            className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-background/60 text-muted-foreground backdrop-blur-md transition-all hover:bg-white/10 hover:text-foreground active:scale-90 cursor-pointer"
            aria-label="Tutup zoom"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Glossy layers */}
          <span aria-hidden className="float-banner-sheen opacity-40" />
          <span aria-hidden className="float-banner-rim" />

          {/* Vertical Image */}
          {zoomedBanner.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={zoomedBanner.imageUrl}
              alt={zoomedBanner.title}
              className="absolute inset-0 h-full w-full object-cover object-center select-none"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/35 flex items-center justify-center">
              <span className="brand-wordmark text-2xl text-premium opacity-50">kviboystore</span>
            </div>
          )}

          {/* Dark Scrim overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/85 z-[1]" />

          {/* Content Area */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-[2] flex flex-col justify-end">
            <span className="eyebrow block text-primary text-[9px] mb-1 tracking-[0.2em] font-bold">
              PROMO PILIHAN
            </span>
            <h3 className="heading-display text-[14px] sm:text-[15px] font-bold text-white leading-snug drop-shadow-sm">
              {zoomedBanner.title}
            </h3>
            {zoomedBanner.subtitle && (
              <p className="mt-1.5 text-[10px] sm:text-[11px] text-white/80 leading-normal line-clamp-3">
                {zoomedBanner.subtitle}
              </p>
            )}

            {/* Action Button */}
            <div className="mt-4 flex gap-2">
              <Link
                href={zoomedBanner.ctaHref || "#produk"}
                onClick={handleCloseZoom}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-8.5 rounded-xl w-full text-[11px] font-bold gap-1.5 justify-center border border-white/10 shadow-[var(--shadow-glow)]"
                )}
              >
                {zoomedBanner.ctaLabel || "Beli Sekarang"}
                <ExternalLink className="h-3 w-3" />
              </Link>
              <button
                onClick={handleCloseZoom}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-8.5 rounded-xl px-3 text-[11px] font-semibold border-white/15 bg-white/5 text-white backdrop-blur hover:bg-white/10"
                )}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

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
            const key = banner.slot;
            return (
              <div
                key={key}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="float-banner-orbit absolute"
                style={{ transformStyle: "preserve-3d" }}
              >
                <button
                  type="button"
                  className="float-banner-card block outline-none text-left focus-visible:ring-2 focus-visible:ring-ring cursor-zoom-in"
                  draggable={false}
                  onPointerDown={(e) => {
                    // Simpan koordinat awal saat pointer ditekan di card
                    clickStartRef.current[key] = {
                      x: e.clientX,
                      y: e.clientY,
                      time: Date.now(),
                    };
                  }}
                  onClick={(e) => {
                    const start = clickStartRef.current[key];
                    // Jika trigger lewat keyboard (Space/Enter), `start` akan bernilai undefined
                    if (!start) {
                      handleOpenZoom(banner);
                      return;
                    }

                    const dx = e.clientX - start.x;
                    const dy = e.clientY - start.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Jika pointer hampir tidak bergerak, anggap sebagai click nyata
                    if (dist < 6) {
                      handleOpenZoom(banner);
                    }

                    // Hapus data koordinat
                    delete clickStartRef.current[key];
                  }}
                >
                  {/* Glossy layers */}
                  <span aria-hidden className="float-banner-sheen" />
                  <span aria-hidden className="float-banner-rim" />

                  {banner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={banner.imageUrl}
                      alt=""
                      className="float-banner-media absolute inset-0 h-full w-full object-cover object-center"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      draggable={false}
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="float-banner-media absolute inset-0"
                      data-has-image="0"
                    />
                  )}
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
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Render Modal via Portal */}
      {renderModalPortal()}
    </section>
  );
}
