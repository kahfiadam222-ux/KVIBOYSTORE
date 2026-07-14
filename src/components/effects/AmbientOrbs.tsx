"use client";

/**
 * Soft floating orbs for depth — CSS only, pointer-events none.
 * Respects prefers-reduced-motion.
 */
export function AmbientOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="noise-overlay" />
    </div>
  );
}
