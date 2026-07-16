"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const gyroRef = useRef({ x: 0, y: 0 });

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

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / width - 0.5) * 2,
        y: (e.clientY / height - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Gyro support (mobile)
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        gyroRef.current = {
          x: Math.max(-1, Math.min(1, e.gamma / 45)),
          y: Math.max(-1, Math.min(1, e.beta / 45)),
        };
      }
    };
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    // Particles
    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.3,
    }));

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x * 0.6 + gyroRef.current.x * 0.8;
      const my = mouseRef.current.y * 0.6 + gyroRef.current.y * 0.8;

      particles.forEach((p, i) => {
        // Gentle movement + mouse/gyro influence
        p.x += p.speedX + mx * 0.4;
        p.y += p.speedY + my * 0.4;

        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle pulsing
        const pulse = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * pulse * 0.85})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-45 mix-blend-screen"
    />
  );
}
