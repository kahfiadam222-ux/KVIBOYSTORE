"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  phase: number;
  speed: number;
  vx: number;
  vy: number;
}

/**
 * Quiet ambient starfield — soft drift, no meteors/cracks.
 * Startup-calm: depth without distraction.
 */
export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.25,
      baseOpacity: Math.random() * 0.4 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.45 + 0.2,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.03,
    }));

    let rafId: number;
    function frame(now: number) {
      ctx!.clearRect(0, 0, width, height);

      const isLight =
        !document.documentElement.classList.contains("dark") &&
        ![
          "theme-jetblack",
          "theme-cosmic",
          "theme-orchid",
          "theme-wineash",
          "theme-turquoise",
          "theme-candyblue",
          "theme-lavender",
          "theme-violet",
        ].some((t) => document.documentElement.classList.contains(t));

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < -4) star.x = width + 4;
          if (star.x > width + 4) star.x = -4;
          if (star.y < -4) star.y = height + 4;
          if (star.y > height + 4) star.y = -4;
        }

        const twinkle =
          0.65 + 0.35 * Math.sin(now * 0.0008 * star.speed + star.phase);
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = isLight
          ? `rgba(100, 116, 139, ${(star.baseOpacity * twinkle * 0.3).toFixed(3)})`
          : `rgba(255, 255, 255, ${(star.baseOpacity * twinkle * 0.75).toFixed(3)})`;
        ctx!.fill();
      }

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 55%)",
        }}
      />
    </div>
  );
}
