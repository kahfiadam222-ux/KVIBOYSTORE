"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function WelcomeScreen() {
  const [stage, setStage] = useState<"enter" | "fadeout" | "exit">("enter");

  useEffect(() => {
    // Kunci scroll saat welcome screen aktif
    document.body.style.overflow = "hidden";

    // Tahap 1: Mulai memudar keluar setelah 1.2 detik
    const fadeTimer = setTimeout(() => {
      setStage("fadeout");
    }, 1200);

    // Tahap 2: Hapus dari DOM setelah animasi fadeout selesai (1.7 detik total)
    const exitTimer = setTimeout(() => {
      setStage("exit");
      document.body.style.overflow = "";
    }, 1700);

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
        "fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto",
        "bg-background/35 backdrop-blur-[32px] saturate-[1.4]",
        "transition-all duration-500 ease-in-out",
        stage === "fadeout" ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
      )}
    >
      {/* Glossy glass gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Minimalist ambient light behind text */}
      <div
        className={cn(
          "absolute h-48 w-48 rounded-full bg-primary/10 blur-[80px] transition-transform duration-[1.5s] ease-out",
          stage === "fadeout" ? "scale-150 opacity-0" : "scale-100 opacity-100"
        )}
      />

      <div className="relative flex flex-col items-center px-6 text-center select-none">
        <span
          className={cn(
            "text-[10px] sm:text-xs font-light tracking-[0.3em] text-foreground/80 lowercase",
            "transition-all duration-700 ease-out delay-100",
            stage === "fadeout" ? "translate-y-[-8px] opacity-0 blur-[2px]" : "translate-y-0 opacity-100"
          )}
        >
          welcome to kviboystore
        </span>
        {/* Subtle decorative horizontal line */}
        <div
          className={cn(
            "h-[1px] w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-3.5",
            "transition-all duration-700 ease-out delay-200",
            stage === "fadeout" ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
          )}
        />
      </div>
    </div>
  );
}
