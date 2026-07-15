"use client";

import Link from "next/link";
import { useContext } from "react";
import { SidebarContext } from "./sidebar-context";

export function NavbarMobileBrand() {
  const sidebar = useContext(SidebarContext);

  if (sidebar && !sidebar.isMobile && !sidebar.collapsed) return null;

  return (
    <Link
      href="/"
      className="brand-wordmark min-w-0 truncate text-base sm:text-[1.05rem] text-foreground transition-opacity duration-300 hover:text-primary lg:hidden"
    >
      kviboystore
    </Link>
  );
}