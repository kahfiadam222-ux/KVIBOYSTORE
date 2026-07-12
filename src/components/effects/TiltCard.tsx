"use client";

import { useRef, useState, type ReactNode } from "react";

const MAX_TILT_DEG = 8;

// Mouse-tracking 3D tilt + a glow highlight that follows the cursor — the
// lightweight, no-external-asset stand-in for the PRD's WebGL "digital
// engine" tracking behavior. Pointer-driven only (no wheel/scroll listeners),
// so this can never interfere with page scroll.
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
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glow, setGlow] = useState<React.CSSProperties>({ opacity: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * MAX_TILT_DEG * 2;
    const rotateX = (0.5 - py) * MAX_TILT_DEG * 2;

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
      transition: "transform 0.05s linear",
    });
    setGlow({
      opacity: 1,
      background: `radial-gradient(280px circle at ${px * 100}% ${py * 100}%, color-mix(in oklch, ${glowColor} 22%, transparent), transparent 70%)`,
    });
  }

  function handleMouseLeave() {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.4s ease-out",
    });
    setGlow({ opacity: 0, transition: "opacity 0.4s ease-out" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ ...style, willChange: "transform" }}
    >
      <div className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" style={glow} />
      {children}
    </div>
  );
}
