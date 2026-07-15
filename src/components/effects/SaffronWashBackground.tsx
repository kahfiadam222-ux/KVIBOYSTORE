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

    // Create watercolor-style particles
    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 28 + 12,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.35 + 0.15,
      hue: 28 + Math.random() * 12, // Saffron orange range
    }));

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const { x: mx, y: my, active } = mouseRef.current;

      particles.forEach((p, i) => {
        // Gentle floating movement
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        // Subtle mouse attraction (very gentle)
        if (active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 280 && dist > 0) {
            const force = (280 - dist) / 2800;
            p.x += dx * force * 0.6;
            p.y += dy * force * 0.6;
          }
        }

        // Soft pulsing
        const pulse = Math.sin(Date.now() * 0.0008 + i) * 0.2 + 0.8;

        // Draw soft watercolor blob
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          p.x, p.y, p.size * 0.2,
          p.x, p.y, p.size * pulse
        );

        gradient.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${p.opacity * pulse})`);
        gradient.addColorStop(0.6, `hsla(${p.hue}, 75%, 55%, ${p.opacity * 0.6 * pulse})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);

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
      className="pointer-events-none fixed inset-0 -z-10 opacity-70 mix-blend-multiply"
    />
  );
}
