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
  x: number; // 0..1 relatif lebar
  y: number; // 0..1 relatif tinggi
  size: number; // px
  color: 0 | 1; // index warna wash
  opacity: number;
}

// Komposisi mengikuti referensi: lavender kiri, sky-blue kanan,
// haze violet atas, glow lembut dari bawah. Posisi TETAP (statis).
const BLOOMS: Bloom[] = [
  { x: 0.04, y: 0.3, size: 760, color: 1, opacity: 0.5 },
  { x: 0.97, y: 0.34, size: 800, color: 0, opacity: 0.52 },
  { x: 0.62, y: 0.04, size: 620, color: 1, opacity: 0.34 },
  { x: 0.5, y: 1.06, size: 820, color: 0, opacity: 0.4 },
];

/**
 * Aurora Pastel wash — glow statis sky-blue ↔ lavender.
 * Digambar SEKALI (tanpa animasi/mouse); redraw hanya saat resize
 * atau ganti tema. Nol beban CPU saat idle.
 */
export function SaffronWashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const colors: [string, string] = [
        readWash("--wash-1", "147, 197, 253"),
        readWash("--wash-2", "196, 181, 253"),
      ];

      for (const b of BLOOMS) {
        const cx = b.x * width;
        const cy = b.y * height;
        const r = b.size;
        const c = colors[b.color];

        const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
        grad.addColorStop(0, `rgba(${c}, ${b.opacity})`);
        grad.addColorStop(0.5, `rgba(${c}, ${b.opacity * 0.4})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    render();

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(render, 150);
    };
    window.addEventListener("resize", onResize);

    // Redraw saat tema berganti (warna wash ikut tema).
    const themeObserver = new MutationObserver(render);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.clearTimeout(resizeTimer);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-80 mix-blend-multiply"
    />
  );
}
