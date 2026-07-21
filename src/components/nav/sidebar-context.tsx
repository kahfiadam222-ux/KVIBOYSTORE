"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
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
  if (typeof window === "undefined") return;
  const mobile = window.innerWidth <= MOBILE_MAX;
  const width = mobile ? 0 : collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
  document.documentElement.dataset.sidebarCollapsed = collapsed ? "true" : "false";
  document.documentElement.dataset.sidebarMobile = mobile ? "true" : "false";
}

function subscribeMobile(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
  mq.addEventListener("change", cb);
  window.addEventListener("resize", cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener("resize", cb);
  };
}

function getIsMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= MOBILE_MAX;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useSyncExternalStore(subscribeMobile, getIsMobile, () => false);
  const [collapsed, setCollapsed] = useState(true);
  const [prevMobile, setPrevMobile] = useState(isMobile);
  const [hydratedPath, setHydratedPath] = useState(false);

  // Hydrate collapsed from localStorage during first client render.
  if (typeof window !== "undefined" && !hydratedPath) {
    setHydratedPath(true);
    const initial = readInitialCollapsed();
    if (initial !== collapsed) setCollapsed(initial);
    applySidebarLayout(initial);
  }

  // Respond to mobile/desktop breakpoint transitions during render.
  if (isMobile !== prevMobile) {
    setPrevMobile(isMobile);
    if (isMobile) {
      if (!collapsed) setCollapsed(true);
      applySidebarLayout(true);
    } else {
      const stored = localStorage.getItem("kvibo-sidebar-collapsed");
      const next = stored !== null ? stored === "true" : false;
      if (next !== collapsed) setCollapsed(next);
      applySidebarLayout(next);
    }
  }

  useEffect(() => {
    applySidebarLayout(collapsed);
    if (typeof window !== "undefined") {
      localStorage.setItem("kvibo-sidebar-collapsed", String(collapsed));
    }
  }, [collapsed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.documentElement.classList.remove("preload");
    }, 600);
    return () => clearTimeout(timer);
  }, []);

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
    [collapsed, toggle, close, open, isMobile],
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
