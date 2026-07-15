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
  phase: number;
}

interface Bloom {
  x: number;
  y: number;
  size: number;
  opacity: number;
  phase: number;
}

export function SaffronWashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true
    });
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

    // Mouse tracking with throttling
    let lastMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMove > 16) { // ~60fps tracking
        mouseRef.current = {
          x: e.clientX,
          y: e.clientY,
          active: true,
        };
        lastMove = now;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    // High-quality watercolor particles
    const particles: Particle[] = Array.from({ length: 72 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 24 + 13,
      speedX: (Math.random() - 0.5) * 0.14,
      speedY: (Math.random() - 0.5) * 0.14,
      opacity: Math.random() * 0.42 + 0.18,
      hue: 22 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
    }));

    // Premium light blooms
    const blooms: Bloom[] = Array.from({ length: 7 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 155 + 95,
      opacity: Math.random() * 0.2 + 0.11,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf: number;
    let lastTime = performance.now();

    const draw = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      const { x: mx, y: my, active } = mouseRef.current;

      // Draw watercolor particles (optimized)
      particles.forEach((p, i) => {
        // Very smooth movement
        p.x += p.speedX * (delta / 16);
        p.y += p.speedY * (delta / 16);

        // Wrap around
        if (p.x < -28) p.x = width + 28;
        if (p.x > width + 28) p.x = -28;
        if (p.y < -28) p.y = height + 28;
        if (p.y > height + 28) p.y = -28;

        // Smooth mouse interaction
        if (active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 340 && dist > 0) {
            const force = (340 - dist) / 3200;
            p.x += dx * force * 0.65;
            p.y += dy * force * 0.65;
          }
        }

        // Very smooth pulsing
        const pulse = Math.sin(currentTime * 0.00085 + p.phase) * 0.1 + 0.9;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          p.x, p.y, p.size * 0.18,
          p.x, p.y, p.size * pulse
        );

        gradient.addColorStop(0, `hsla(${p.hue}, 90%, 58%, ${p.opacity * pulse})`);
        gradient.addColorStop(0.45, `hsla(${p.hue}, 82%, 52%, ${p.opacity * 0.5 * pulse})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 75%, 48%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });

      // Draw light blooms (premium quality)
      blooms.forEach((b, i) => {
        if (active) {
          const dx = mx - b.x;
          const dy = my - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 35) {
            const speed = Math.min(dist / 2800, 0.018);
            b.x += dx * speed;
            b.y += dy * speed;
          }
        } else {
          // Very gentle floating
          b.x += Math.sin(currentTime * 0.00035 + b.phase) * 0.18;
          b.y += Math.cos(currentTime * 0.00032 + b.phase) * 0.15;
        }

        // Keep in bounds smoothly
        b.x = Math.max(0, Math.min(width, b.x));
        b.y = Math.max(0, Math.min(height, b.y));

        const pulse = Math.sin(currentTime * 0.0011 + b.phase) * 0.07 + 0.93;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * pulse, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          b.x, b.y, b.size * 0.12,
          b.x, b.y, b.size * pulse
        );

        gradient.addColorStop(0, `rgba(242, 124, 46, ${b.opacity * pulse})`);
        gradient.addColorStop(0.3, `rgba(242, 124, 46, ${b.opacity * 0.45 * pulse})`);
        gradient.addColorStop(1, `rgba(242, 124, 46, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

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
      className="pointer-events-none fixed inset-0 -z-10 opacity-90 mix-blend-multiply"
      style={{ willChange: 'transform' }}
    />
  );
}
