"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({
  links,
  email,
}: {
  links: NavLink[];
  email: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        aria-label="Buka menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-input"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="glass-panel absolute inset-x-0 top-full flex flex-col gap-1 border-t-0 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {email && (
            <p className="truncate px-3 py-1.5 text-xs text-muted-foreground">{email}</p>
          )}
          {email && (
            <form action={logout} className="px-3 pt-1">
              <Button type="submit" variant="outline" size="sm" className="w-full">
                Keluar
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
