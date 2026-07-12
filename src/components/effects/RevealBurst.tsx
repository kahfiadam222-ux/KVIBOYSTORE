"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const COLORS = ["var(--primary)", "var(--chart-1)", "var(--chart-4)"];
const PARTICLE_COUNT = 36;
const DURATION_MS = 1100;

// The lightweight, no-external-asset stand-in for the PRD's GPU particle
// "digital unboxing" deconstruction — a short one-time burst that plays when
// this component mounts, then removes itself. Canvas-only, no scroll/wheel
// listeners, so it can never interfere with page scroll.
export function RevealBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const resolvedColors = COLORS.map((token) => {
      const probe = document.createElement("span");
      probe.style.color = token;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      document.body.removeChild(probe);
      return rgb;
    });

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: resolvedColors[Math.floor(Math.random() * resolvedColors.length)],
      };
    });

    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION_MS, 1);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life = 1 - t;

        ctx!.beginPath();
        ctx!.fillStyle = p.color.replace("rgb(", "rgba(").replace(")", `, ${p.life})`);
        ctx!.arc(p.x, p.y, 2.5 * p.life + 0.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
