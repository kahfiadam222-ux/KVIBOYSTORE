"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background/50 backdrop-blur transition-all duration-200 active:scale-95"
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-border bg-popover/90 p-4 shadow-xl backdrop-blur-xl"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground active:scale-[0.98]"
              >
                {link.label}
              </Link>
            ))}
            {email && (
              <div className="border-t border-border/40 mt-2 pt-2">
                <p className="truncate px-3 py-1.5 text-xs text-muted-foreground">{email}</p>
              </div>
            )}
            {email && (
              <form action={logout} className="px-3 pt-1">
                <Button type="submit" variant="outline" size="sm" className="w-full">
                  Keluar
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
