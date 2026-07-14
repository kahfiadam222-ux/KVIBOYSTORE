"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Palette, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  THEMES,
  applyThemeClass,
  resolveThemeId,
  type ThemeId,
} from "@/lib/themes";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 288;

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("theme-midnight");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = resolveThemeId(localStorage.getItem("kvibo-theme"));
    setActiveTheme(saved);
    applyThemeClass(saved);
    if (localStorage.getItem("kvibo-theme") !== saved) {
      localStorage.setItem("kvibo-theme", saved);
    }
  }, []);

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const panelH = panelRef.current?.offsetHeight ?? 360;
    const gap = 10;

    let left = rect.left;
    let top = rect.top - panelH - gap;

    // Prefer opening above; if clipped, open below
    if (top < 8) {
      top = rect.bottom + gap;
    }
    // Keep inside viewport horizontally
    if (left + PANEL_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - PANEL_WIDTH - 8;
    }
    if (left < 8) left = 8;
    // Clamp vertical if still overflowing bottom
    if (top + panelH > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - panelH - 8);
    }

    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent) {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const changeTheme = (themeId: ThemeId) => {
    applyThemeClass(themeId);
    setActiveTheme(themeId);
    localStorage.setItem("kvibo-theme", themeId);
    setOpen(false);
  };

  const active = THEMES.find((t) => t.id === activeTheme) ?? THEMES[0];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border)]",
          "bg-[var(--glass-fill)] text-muted-foreground backdrop-blur-md",
          "transition-all duration-200 hover:border-primary/30 hover:text-foreground",
          "active:scale-[0.98] cursor-pointer relative",
          open && "border-primary/40 text-foreground ring-2 ring-primary/15"
        )}
        aria-label={`Pilih tema — ${active.label}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        type="button"
        title={`Tema: ${active.label}`}
      >
        <span
          aria-hidden
          className="absolute inset-1 rounded-lg opacity-90"
          style={{ background: active.swatch }}
        />
        <Palette className="relative h-3.5 w-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-label="Pemilih tema"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  width: PANEL_WIDTH,
                  zIndex: 100,
                }}
                className={cn(
                  "overflow-hidden rounded-2xl border border-[var(--glass-border)]",
                  "bg-[color-mix(in_oklch,var(--popover)_92%,transparent)]",
                  "shadow-[0_24px_64px_-16px_rgba(0,0,0,0.55),0_0_0_1px_color-mix(in_oklch,var(--primary)_10%,transparent)]",
                  "backdrop-blur-2xl"
                )}
              >
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-3.5 py-3">
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-foreground">
                      Tema
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Pilih palet warna
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Tutup"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3">
                  {THEMES.map((theme) => {
                    const selected = activeTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => changeTheme(theme.id)}
                        className={cn(
                          "group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          selected
                            ? "border-primary/50 ring-2 ring-primary/20"
                            : "border-[var(--glass-border)] hover:border-primary/30"
                        )}
                      >
                        <span
                          className="block h-14 w-full"
                          style={{ background: theme.swatch }}
                        />
                        <span className="flex items-start justify-between gap-1 px-2.5 py-2">
                          <span>
                            <span className="block text-[12px] font-semibold text-foreground">
                              {theme.label}
                            </span>
                            <span className="block text-[10px] text-muted-foreground leading-snug">
                              {theme.description}
                            </span>
                          </span>
                          {selected && (
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
