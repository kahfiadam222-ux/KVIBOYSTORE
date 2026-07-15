"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

interface Bloom {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export function SaffronWashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
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
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Watercolor particles (more visible)
    const particles: Particle[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 26 + 14,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: (Math.random() - 0.5) * 0.18,
      opacity: Math.random() * 0.45 + 0.22,
      hue: 22 + Math.random() * 16,
    }));

    // Light blooms (stronger and more visible)
    const blooms: Bloom[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 160 + 100,
      opacity: Math.random() * 0.22 + 0.12,
    }));

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const { x: mx, y: my, active } = mouseRef.current;

      // Draw watercolor particles
      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        // Stronger mouse interaction
        if (active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 320 && dist > 0) {
            const force = (320 - dist) / 2800;
            p.x += dx * force * 0.7;
            p.y += dy * force * 0.7;
          }
        }

        const pulse = Math.sin(Date.now() * 0.001 + i) * 0.12 + 0.88;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          p.x, p.y, p.size * 0.2,
          p.x, p.y, p.size * pulse
        );

        gradient.addColorStop(0, `hsla(${p.hue}, 88%, 60%, ${p.opacity * pulse})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 52%, ${p.opacity * 0.55 * pulse})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 75%, 48%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });

      // Draw light blooms (more visible)
      blooms.forEach((b, i) => {
        if (active) {
          const dx = mx - b.x;
          const dy = my - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 40) {
            b.x += dx * 0.012;
            b.y += dy * 0.012;
          }
        } else {
          b.x += Math.sin(Date.now() * 0.0004 + i) * 0.2;
          b.y += Math.cos(Date.now() * 0.00035 + i) * 0.18;
        }

        if (b.x < 0) b.x = 0;
        if (b.x > width) b.x = width;
        if (b.y < 0) b.y = 0;
        if (b.y > height) b.y = height;

        const pulse = Math.sin(Date.now() * 0.0012 + i) * 0.08 + 0.92;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * pulse, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          b.x, b.y, b.size * 0.15,
          b.x, b.y, b.size * pulse
        );

        gradient.addColorStop(0, `rgba(242, 124, 46, ${b.opacity * pulse})`);
        gradient.addColorStop(0.35, `rgba(242, 124, 46, ${b.opacity * 0.5 * pulse})`);
        gradient.addColorStop(1, `rgba(242, 124, 46, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-85 mix-blend-multiply"
    />
  );
}
