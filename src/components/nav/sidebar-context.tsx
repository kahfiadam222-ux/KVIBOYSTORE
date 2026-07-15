"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SIDEBAR_WIDTH_COLLAPSED = 72;
export const SIDEBAR_WIDTH_EXPANDED = 260;
export const MOBILE_MAX = 767;

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
  isMobile: boolean;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("kvibo-sidebar-collapsed");
  if (stored !== null) return stored === "true";
  return window.innerWidth <= MOBILE_MAX;
}

function applySidebarLayout(collapsed: boolean) {
  const mobile = window.innerWidth <= MOBILE_MAX;
  const width = mobile ? 0 : (collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED);

  document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
  document.documentElement.dataset.sidebarCollapsed = collapsed ? "true" : "false";
  document.documentElement.dataset.sidebarMobile = mobile ? "true" : "false";
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Sync state dengan DOM setelah mount
  useEffect(() => {
    const initial = readInitialCollapsed();
    const mobile = window.innerWidth <= MOBILE_MAX;
    setCollapsed(initial);
    setIsMobile(mobile);
    applySidebarLayout(initial);

    // Update layout saat ukuran layar berubah
    const handleResize = () => {
      const currentMobile = window.innerWidth <= MOBILE_MAX;
      setIsMobile(currentMobile);
      if (currentMobile) {
        setCollapsed(true);
        applySidebarLayout(true);
      } else {
        const stored = localStorage.getItem("kvibo-sidebar-collapsed");
        const currentCollapsed = stored !== null ? stored === "true" : false;
        setCollapsed(currentCollapsed);
        applySidebarLayout(currentCollapsed);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update DOM saat state collapsed berubah
  useEffect(() => {
    applySidebarLayout(collapsed);
    localStorage.setItem("kvibo-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setCollapsed(true);
  }, []);

  const open = useCallback(() => {
    setCollapsed(false);
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      toggle,
      close,
      open,
      isMobile,
    }),
    [collapsed, toggle, close, open, isMobile]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
