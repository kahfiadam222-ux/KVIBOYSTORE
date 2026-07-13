"use client";

import { useEffect, useState, useRef } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const THEMES = [
  { id: "theme-graffiti", label: "Graffiti Anime", dot: "bg-[#FF0080]" },
  { id: "theme-cyber", label: "Space Cyber", dot: "bg-[#8B6CF5]" },
  { id: "theme-emerald", label: "Emerald Mint", dot: "bg-[#10B981]" },
  { id: "theme-rose", label: "Midnight Rose", dot: "bg-[#F43F5E]" },
  { id: "theme-slate", label: "Monochrome Slate", dot: "bg-[#64748B]" },
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState("theme-cyber");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("kvibo-theme");
    if (savedTheme) {
      setActiveTheme(savedTheme);
      // Remove default theme just in case
      document.documentElement.classList.remove("theme-cyber");
      document.documentElement.classList.add(savedTheme);
    } else {
      document.documentElement.classList.add("theme-cyber");
    }

    // Handle outside clicks
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeTheme = (themeId: string) => {
    // Remove all theme classes
    THEMES.forEach((t) => {
      document.documentElement.classList.remove(t.id);
    });
    // Add new theme class
    document.documentElement.classList.add(themeId);
    setActiveTheme(themeId);
    localStorage.setItem("kvibo-theme", themeId);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background/40 backdrop-blur transition-all duration-200 hover:bg-accent/40 active:scale-95 cursor-pointer"
        aria-label="Ubah Tema"
        type="button"
      >
        <Palette className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 z-50 w-48 rounded-xl border border-border bg-popover/90 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 border-b border-border/40 mb-1">
              Pilih Tema
            </p>
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTheme === theme.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${theme.dot} shadow-sm`} />
                  <span>{theme.label}</span>
                </div>
                {activeTheme === theme.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
