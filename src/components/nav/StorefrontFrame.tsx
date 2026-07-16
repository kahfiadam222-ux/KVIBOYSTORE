"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "./sidebar-context";
import type { SidebarCategory } from "@/lib/categories/defaults";

type StorefrontFrameProps = {
  user: {
    id: string;
    email: string;
    role: "buyer" | "seller" | "admin";
  } | null;
  categories: SidebarCategory[];
  children: ReactNode;
};

export function StorefrontFrame({ user, categories, children }: StorefrontFrameProps) {
  const { close } = useSidebar();

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {/* Overlay backdrop mobile - diatur lewat CSS */}
      <button
        type="button"
        aria-label="Tutup menu navigasi"
        className="sidebar-overlay fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] opacity-0 pointer-events-none transition-all duration-300"
        onClick={close}
      />

      <div className="kvibo-app-shell grid min-h-screen w-full">
        <Sidebar user={user} categories={categories} />
        <div className="storefront-main flex min-w-0 flex-col overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
