"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function WelcomeScreen() {
  const [stage, setStage] = useState<"enter" | "fadeout" | "exit">("enter");

  useEffect(() => {
    // Kunci scroll saat welcome screen aktif
    document.body.style.overflow = "hidden";

    // Tahap 1: Mulai memudar keluar setelah 550ms
    const fadeTimer = setTimeout(() => {
      setStage("fadeout");
    }, 550);

    // Tahap 2: Hapus dari DOM setelah animasi fadeout selesai (900ms total)
    const exitTimer = setTimeout(() => {
      setStage("exit");
      document.body.style.overflow = "";
    }, 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(exitTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (stage === "exit") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto",
        "bg-background/15 backdrop-blur-[6px] saturate-[1.2]",
        "transition-all duration-350 ease-out",
        stage === "fadeout" ? "opacity-0 scale-[1.01] pointer-events-none" : "opacity-100 scale-100"
      )}
    >
      {/* Glossy glass gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

      {/* Minimalist ambient light behind text */}
      <div
        className={cn(
          "absolute h-36 w-36 rounded-full bg-primary/5 blur-[60px] transition-transform duration-[0.6s] ease-out",
          stage === "fadeout" ? "scale-125 opacity-0" : "scale-100 opacity-100"
        )}
      />

      <div className="relative flex flex-col items-center px-6 text-center select-none">
        <span
          className={cn(
            "text-[10px] sm:text-xs font-light tracking-[0.25em] text-foreground/75 lowercase",
            "transition-all duration-400 ease-out delay-50",
            stage === "fadeout" ? "translate-y-[-6px] opacity-0 blur-[1px]" : "translate-y-0 opacity-100"
          )}
        >
          welcome to kviboystore
        </span>

        {/* Minimalist Fast Loading Bar */}
        <div
          className={cn(
            "relative w-24 h-[1.5px] bg-foreground/5 rounded-full overflow-hidden mt-3.5",
            "transition-all duration-400 ease-out delay-75",
            stage === "fadeout" ? "scale-x-75 opacity-0" : "scale-x-100 opacity-100"
          )}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-primary/80 rounded-full animate-fast-load"
            style={{
              width: "100%",
              transformOrigin: "left",
              animation: "fast-loader 480ms cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
              willChange: "transform"
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fast-loader {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
