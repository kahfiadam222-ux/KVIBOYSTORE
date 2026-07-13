"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  phase: number;
  speed: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Crack {
  x: number;
  y: number;
  createdAt: number;
  segments: Array<[number, number, number, number]>;
}

interface DataBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  speed: number;
  rotation: number;
  rotSpeed: number;
}

const CRACK_LIFETIME_MS = 2600;
const METEOR_MIN_GAP_MS = 4000;
const METEOR_MAX_GAP_MS = 9000;

function buildCrackSegments(x: number, y: number): Array<[number, number, number, number]> {
  const segments: Array<[number, number, number, number]> = [];
  const spokes = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2 + Math.random() * 0.4;
    const length = 18 + Math.random() * 26;
    let cx = x;
    let cy = y;
    let a = angle;
    const hops = 2 + Math.floor(Math.random() * 2);
    for (let h = 0; h < hops; h++) {
      const segLen = length / hops;
      const nx = cx + Math.cos(a) * segLen;
      const ny = cy + Math.sin(a) * segLen;
      segments.push([cx, cy, nx, ny]);
      cx = nx;
      cy = ny;
      a += (Math.random() - 0.5) * 0.8;
    }
  }
  return segments;
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.3,
      baseOpacity: Math.random() * 0.5 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.3,
    }));

    const meteors: Meteor[] = [];
    const cracks: Crack[] = [];
    const dataBlocks: DataBlock[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      w: Math.random() * 6 + 3,
      h: Math.random() * 12 + 4,
      opacity: Math.random() * 0.12 + 0.04,
      speed: Math.random() * 0.25 + 0.08,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.006,
    }));
    let nextMeteorAt = performance.now() + 1200;

    function spawnMeteor() {
      const startX = Math.random() * width * 0.7 + width * 0.15;
      const angle = (Math.random() * 20 + 55) * (Math.PI / 180);
      const speed = 9 + Math.random() * 5;
      meteors.push({
        x: startX,
        y: -20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 20,
      });
    }

    let rafId: number;
    function frame(now: number) {
      ctx!.clearRect(0, 0, width, height);

      // Resolve theme variables dynamically
      const isLight = document.documentElement.classList.contains("theme-slate");
      const isGraffiti = document.documentElement.classList.contains("theme-graffiti");
      const style = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
      const primaryColor = style ? style.getPropertyValue("--primary").trim() : "#8B6CF5";

      for (const star of stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(now * 0.001 * star.speed + star.phase);
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = isLight
          ? `rgba(100, 116, 139, ${(star.baseOpacity * twinkle * 0.25).toFixed(3)})`
          : isGraffiti
          ? `rgba(255, 255, 255, ${(star.baseOpacity * twinkle * 0.45).toFixed(3)})`
          : `rgba(255, 255, 255, ${(star.baseOpacity * twinkle).toFixed(3)})`;
        ctx!.fill();
      }

      for (const db of dataBlocks) {
        if (isGraffiti) {
          // Sakura petals drift downward and sway sideways
          db.y += db.speed * 1.3;
          db.rotation += db.rotSpeed * 1.5;
          const sway = Math.sin(now * 0.0015 + db.x) * 0.25;
          db.x += sway;

          if (db.y > height + 20) {
            db.y = -20;
            db.x = Math.random() * width;
          }
        } else {
          db.y -= db.speed;
          db.rotation += db.rotSpeed;
          if (db.y < -30) {
            db.y = height + 20;
            db.x = Math.random() * width;
          }
        }

        ctx!.save();
        ctx!.translate(db.x, db.y);
        ctx!.rotate(db.rotation);
        
        ctx!.globalAlpha = isLight ? db.opacity * 0.35 : isGraffiti ? db.opacity * 1.8 : db.opacity;
        
        if (isGraffiti) {
          const isSakura = db.w > 5;
          if (isSakura) {
            // Draw cherry blossom (Sakura) petal with soft airbrush fuchsia glow
            ctx!.beginPath();
            ctx!.moveTo(0, -db.h / 2);
            ctx!.bezierCurveTo(-db.w * 1.3, -db.h / 5, -db.w * 0.9, db.h / 2, 0, db.h / 1.8);
            ctx!.bezierCurveTo(db.w * 0.9, db.h / 2, db.w * 1.3, -db.h / 5, 0, -db.h / 2);
            
            const petalGrad = ctx!.createRadialGradient(0, 0, 1, 0, 0, db.h / 1.5);
            petalGrad.addColorStop(0, "#FF66B2"); 
            petalGrad.addColorStop(1, "rgba(255, 20, 147, 0.35)"); 
            
            ctx!.fillStyle = petalGrad;
            ctx!.fill();
          } else {
            // Draw soft cyan airbrush spray paint splatter
            ctx!.beginPath();
            ctx!.arc(0, 0, db.w * 1.6, 0, Math.PI * 2);
            const sprayGrad = ctx!.createRadialGradient(0, 0, 1, 0, 0, db.w * 1.6);
            sprayGrad.addColorStop(0, "#00F0FF");
            sprayGrad.addColorStop(0.3, "rgba(0, 240, 255, 0.7)");
            sprayGrad.addColorStop(1, "rgba(0, 240, 255, 0)"); 
            
            ctx!.fillStyle = sprayGrad;
            ctx!.fill();
          }
        } else {
          ctx!.fillStyle = isLight ? "#64748B" : primaryColor;
          ctx!.strokeStyle = isLight ? "#64748B" : primaryColor;
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.rect(-db.w / 2, -db.h / 2, db.w, db.h);
          ctx!.fill();
          ctx!.stroke();
        }
        ctx!.restore();
      }

      if (!prefersReducedMotion && now >= nextMeteorAt) {
        spawnMeteor();
        nextMeteorAt =
          now + METEOR_MIN_GAP_MS + Math.random() * (METEOR_MAX_GAP_MS - METEOR_MIN_GAP_MS);
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life += 1;

        const progress = m.life / m.maxLife;
        const fade = progress > 0.75 ? 1 - (progress - 0.75) / 0.25 : 1;
        const tailX = m.x - m.vx * 6;
        const tailY = m.y - m.vy * 6;

        const grad = ctx!.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, isLight 
          ? `rgba(100, 116, 139, ${(0.45 * fade).toFixed(3)})` 
          : `rgba(255, 255, 255, ${(0.85 * fade).toFixed(3)})`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 2;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(m.x, m.y);
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx!.fillStyle = isLight 
          ? `rgba(100, 116, 139, ${(0.5 * fade).toFixed(3)})` 
          : `rgba(255, 255, 255, ${(0.9 * fade).toFixed(3)})`;
        ctx!.fill();

        if (m.life >= m.maxLife || m.x > width + 40 || m.y > height + 40) {
          cracks.push({
            x: Math.min(Math.max(m.x, 20), width - 20),
            y: Math.min(Math.max(m.y, 20), height - 20),
            createdAt: now,
            segments: buildCrackSegments(m.x, m.y),
          });
          meteors.splice(i, 1);
        }
      }

      for (let i = cracks.length - 1; i >= 0; i--) {
        const crack = cracks[i];
        const age = now - crack.createdAt;
        if (age > CRACK_LIFETIME_MS) {
          cracks.splice(i, 1);
          continue;
        }
        const inOpacity = Math.min(age / 150, 1);
        const outOpacity = 1 - Math.max(0, (age - CRACK_LIFETIME_MS * 0.5) / (CRACK_LIFETIME_MS * 0.5));
        const opacity = Math.min(inOpacity, outOpacity) * 0.55;

        ctx!.save();
        ctx!.strokeStyle = `rgba(220,235,255,${opacity.toFixed(3)})`;
        ctx!.lineWidth = 1.1;
        for (const [x1, y1, x2, y2] of crack.segments) {
          ctx!.beginPath();
          ctx!.moveTo(x1, y1);
          ctx!.lineTo(x2, y2);
          ctx!.stroke();
        }
        ctx!.beginPath();
        ctx!.arc(crack.x, crack.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(220,235,255,${(opacity * 1.4).toFixed(3)})`;
        ctx!.fill();
        ctx!.restore();
      }

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklch, white 4%, transparent), transparent 40%, color-mix(in oklch, white 2%, transparent) 60%, transparent 80%)",
          backdropFilter: "blur(0.5px) saturate(1.05)",
        }}
      />
    </div>
  );
}
