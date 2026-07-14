"use client";

import { useRef, useState, type ReactNode, type CSSProperties } from "react";

const MAX_TILT_DEG = 6;
const MAX_LIFT_PX = 6;

/**
 * Subtle pointer-driven 3D tilt + specular highlight.
 * Soft enough for a product grid; never blocks scroll.
 */
export function TiltCard({
  children,
  className,
  glowColor = "var(--primary)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [glow, setGlow] = useState<CSSProperties>({ opacity: 0 });
  const [shine, setShine] = useState<CSSProperties>({ opacity: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * MAX_TILT_DEG * 2;
    const rotateX = (0.5 - py) * MAX_TILT_DEG * 2;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${MAX_LIFT_PX}px)`,
      transition: "transform 0.08s linear",
    });
    setGlow({
      opacity: 1,
      background: `radial-gradient(320px circle at ${px * 100}% ${py * 100}%, color-mix(in oklch, ${glowColor} 18%, transparent), transparent 68%)`,
    });
    setShine({
      opacity: 0.55,
      background: `linear-gradient(${105 + px * 40}deg, transparent 35%, rgba(255,255,255,0.12) 48%, transparent 62%)`,
    });
  }

  function handleMouseLeave() {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)",
      transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
    });
    setGlow({ opacity: 0, transition: "opacity 0.4s ease-out" });
    setShine({ opacity: 0, transition: "opacity 0.4s ease-out" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...style,
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        style={glow}
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-overlay"
        style={shine}
      />
      {children}
    </div>
  );
}
