"use client";

import { Menu, X } from "lucide-react";
import { useContext } from "react";
import { SidebarContext } from "./sidebar-context";
import { cn } from "@/lib/utils";

/** Tombol menu — hanya tampil di HP, membuka drawer navigasi. */
export function NavbarMenuButton() {
  const sidebar = useContext(SidebarContext);

  if (!sidebar?.isMobile) return null;

  const open = !sidebar.collapsed;

  return (
    <button
      type="button"
      onClick={sidebar.toggle}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)]",
        "bg-background/50 text-foreground transition-all touch-manipulation",
        "hover:border-primary/25 hover:bg-primary/10 hover:text-primary",
        open && "border-primary/30 bg-primary/10 text-primary"
      )}
      aria-label={open ? "Tutup menu" : "Buka menu"}
      aria-expanded={open}
    >
      {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}