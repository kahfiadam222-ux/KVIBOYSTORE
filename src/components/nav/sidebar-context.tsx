"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SIDEBAR_WIDTH_COLLAPSED = 72;
export const SIDEBAR_WIDTH_EXPANDED = 260;
const MOBILE_MAX = 767;

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
  width: number;
  /** Mobile: expanded sidebar floats over content instead of squishing it. */
  isOverlay: boolean;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("kvibo-sidebar-collapsed");
  if (stored !== null) return stored === "true";
  return window.innerWidth <= MOBILE_MAX;
}

function applySidebarLayout(width: number, collapsed: boolean) {
  document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
  document.documentElement.dataset.sidebarCollapsed = collapsed ? "true" : "false";
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const initial = readInitialCollapsed();
    setCollapsed(initial);

    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const syncMobile = () => setIsMobile(mq.matches);
    syncMobile();
    mq.addEventListener("change", syncMobile);

    return () => mq.removeEventListener("change", syncMobile);
  }, []);

  const isOverlay = isMobile && !collapsed;
  const width = isOverlay
    ? SIDEBAR_WIDTH_COLLAPSED
    : collapsed
      ? SIDEBAR_WIDTH_COLLAPSED
      : SIDEBAR_WIDTH_EXPANDED;

  useLayoutEffect(() => {
    applySidebarLayout(width, collapsed);
    localStorage.setItem("kvibo-sidebar-collapsed", String(collapsed));
  }, [width, collapsed]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setCollapsed(true);
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      toggle,
      close,
      width,
      isOverlay,
    }),
    [collapsed, toggle, close, width, isOverlay]
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