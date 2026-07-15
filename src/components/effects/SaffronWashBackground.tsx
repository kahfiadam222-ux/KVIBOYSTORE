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
  targetX: number;
  targetY: number;
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

    // Watercolor particles (soft, scattered)
    const particles: Particle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 22 + 10,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: (Math.random() - 0.5) * 0.12,
      opacity: Math.random() * 0.28 + 0.12,
      hue: 24 + Math.random() * 14, // Saffron orange range
    }));

    // Light blooms (interactive glowing orbs)
    const blooms: Bloom[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 140 + 80,
      opacity: Math.random() * 0.18 + 0.08,
      targetX: Math.random() * width,
      targetY: Math.random() * height,
    }));

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const { x: mx, y: my, active } = mouseRef.current;

      // Draw watercolor particles
      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < -25) p.x = width + 25;
        if (p.x > width + 25) p.x = -25;
        if (p.y < -25) p.y = height + 25;
        if (p.y > height + 25) p.y = -25;

        // Gentle mouse influence
        if (active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 220 && dist > 0) {
            const force = (220 - dist) / 2200;
            p.x += dx * force * 0.5;
            p.y += dy * force * 0.5;
          }
        }

        const pulse = Math.sin(Date.now() * 0.0009 + i) * 0.15 + 0.85;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          p.x, p.y, p.size * 0.15,
          p.x, p.y, p.size * pulse
        );

        gradient.addColorStop(0, `hsla(${p.hue}, 82%, 62%, ${p.opacity * pulse})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 75%, 55%, ${p.opacity * 0.5 * pulse})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });

      // Draw interactive light blooms
      blooms.forEach((b, i) => {
        // Smooth movement toward mouse
        if (active) {
          const dx = mx - b.x;
          const dy = my - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 30) {
            b.x += dx * 0.008;
            b.y += dy * 0.008;
          }
        } else {
          // Gentle floating when mouse inactive
          b.x += Math.sin(Date.now() * 0.0003 + i) * 0.15;
          b.y += Math.cos(Date.now() * 0.0004 + i) * 0.12;
        }

        // Keep within bounds
        if (b.x < 0) b.x = 0;
        if (b.x > width) b.x = width;
        if (b.y < 0) b.y = 0;
        if (b.y > height) b.y = height;

        const pulse = Math.sin(Date.now() * 0.001 + i) * 0.1 + 0.9;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * pulse, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          b.x, b.y, b.size * 0.1,
          b.x, b.y, b.size * pulse
        );

        gradient.addColorStop(0, `rgba(242, 124, 46, ${b.opacity * pulse})`);
        gradient.addColorStop(0.4, `rgba(242, 124, 46, ${b.opacity * 0.4 * pulse})`);
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
      className="pointer-events-none fixed inset-0 -z-10 opacity-75 mix-blend-screen"
    />
  );
}
