"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

type StorefrontFrameProps = {
  user: {
    id: string;
    email: string;
    role: "buyer" | "seller" | "admin";
  } | null;
  children: ReactNode;
};

export function StorefrontFrame({ user, children }: StorefrontFrameProps) {
  const { width, isOverlay, close, isMobile } = useSidebar();
  const [isClosing, setIsClosing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Handle overlay animation
  useEffect(() => {
    if (isOverlay) {
      setIsClosing(false);
      setShowOverlay(true);
    } else if (showOverlay) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShowOverlay(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOverlay, showOverlay]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      close();
    }, 150);
  }, [close]);

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {showOverlay && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          className={cn(
            "sidebar-overlay fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]",
            isClosing && "closing"
          )}
          onClick={handleClose}
        />
      )}

      {isMobile ? (
        <>
          <Sidebar user={user} />
          <div className="storefront-main flex min-w-0 w-full flex-col">
            {children}
          </div>
        </>
      ) : (
        <div
          className="kvibo-app-shell grid min-h-screen w-full"
          style={{ gridTemplateColumns: `${width}px minmax(0, 1fr)` }}
        >
          <Sidebar user={user} />
          <div className="storefront-main flex min-w-0 flex-col overflow-x-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}