"use client";

import Link from "next/link";
import { useContext } from "react";
import { SidebarContext } from "./sidebar-context";

/** Shown only when sidebar is collapsed — avoids duplicate branding at the top. */
export function NavbarMobileBrand() {
  const sidebar = useContext(SidebarContext);

  if (sidebar && !sidebar.collapsed) return null;

  return (
    <Link
      href="/"
      className="brand-wordmark shrink-0 text-[1.05rem] text-foreground transition-opacity duration-300 hover:text-primary lg:hidden"
    >
      kviboystore
    </Link>
  );
}