"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "./sidebar-context";

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

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {isOverlay && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
          onClick={close}
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