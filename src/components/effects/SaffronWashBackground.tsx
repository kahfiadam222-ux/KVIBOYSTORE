"use client";

import { useEffect, useRef } from "react";

/** Baca CSS var `--wash-N` bertformat "r, g, b". Fallback ke pastel. */
function readWash(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(raw)) {
    return raw.replace(/\s+/g, " ");
  }
  return fallback;
}

interface Bloom {
  baseX: number; // 0..1 relatif lebar
  baseY: number; // 0..1 relatif tinggi
  size: number; // px
  color: 0 | 1; // index warna wash
  opacity: number;
  phase: number;
  driftX: number;
  driftY: number;
}

/**
 * Aurora Pastel wash — glow lembut sky-blue ↔ lavender.
 * Disederhanakan dari efek partikel jadi beberapa bloom besar yang
 * mengambang sangat pelan. Tenang, tidak ramai, hemat CPU.
 */
export function SaffronWashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const parallaxRef = useRef({ x: 0.5, y: 0.5 });
  const colorsRef = useRef<[string, string]>(["147, 197, 253", "196, 181, 253"]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncColors = () => {
      colorsRef.current = [
        readWash("--wash-1", "147, 197, 253"),
        readWash("--wash-2", "196, 181, 253"),
      ];
    };
    syncColors();

    // Warna mengikuti tema aktif (adaptif saat class <html> berganti).
    const themeObserver = new MutationObserver(syncColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let lastMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMove > 32) {
        mouseRef.current = { x: e.clientX / width, y: e.clientY / height };
        lastMove = now;
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Bloom besar, lembut — sedikit saja. Intensitas glow utama datang dari
    // CSS --body-gradient (gratis/GPU); canvas hanya menambah gerak halus.
    const blooms: Bloom[] = [
      { baseX: 0.04, baseY: 0.3, size: 760, color: 1, opacity: 0.5, phase: 0.0, driftX: 0.035, driftY: 0.028 },
      { baseX: 0.97, baseY: 0.34, size: 800, color: 0, opacity: 0.52, phase: 2.1, driftX: 0.04, driftY: 0.026 },
      { baseX: 0.62, baseY: 0.04, size: 620, color: 1, opacity: 0.34, phase: 3.2, driftX: 0.05, driftY: 0.03 },
      { baseX: 0.5, baseY: 1.06, size: 820, color: 0, opacity: 0.4, phase: 4.2, driftX: 0.03, driftY: 0.022 },
    ];

    let raf: number;
    // Batasi ke ~30fps: drift glow sangat pelan, 30fps tak terlihat bedanya
    // tapi memangkas beban main thread separuh (penting di perangkat low-end).
    const FRAME_MS = 33;
    let lastFrame = 0;

    const draw = (t: number) => {
      if (t - lastFrame < FRAME_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = t;
      ctx.clearRect(0, 0, width, height);

      // Parallax mouse yang sangat halus (lerp).
      parallaxRef.current.x += (mouseRef.current.x - parallaxRef.current.x) * 0.04;
      parallaxRef.current.y += (mouseRef.current.y - parallaxRef.current.y) * 0.04;
      const px = (parallaxRef.current.x - 0.5) * width * 0.03;
      const py = (parallaxRef.current.y - 0.5) * height * 0.03;

      const colors = colorsRef.current;

      for (const b of blooms) {
        const cx =
          b.baseX * width +
          Math.sin(t * 0.00012 + b.phase) * width * b.driftX +
          px;
        const cy =
          b.baseY * height +
          Math.cos(t * 0.0001 + b.phase) * height * b.driftY +
          py;
        const pulse = Math.sin(t * 0.0006 + b.phase) * 0.06 + 0.94;
        const r = b.size * pulse;
        const c = colors[b.color];

        const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
        grad.addColorStop(0, `rgba(${c}, ${b.opacity * pulse})`);
        grad.addColorStop(0.5, `rgba(${c}, ${b.opacity * 0.4 * pulse})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-80 mix-blend-multiply"
      style={{ willChange: "transform" }}
    />
  );
}
