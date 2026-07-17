"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/app/(auth)/actions";
import {
  Home,
  ShoppingCart,
  Package,
  Heart,
  User,
  Store,
  Settings,
  HelpCircle,
  CreditCard,
  Gift,
  X,
  Menu,
  LogOut,
  Tv,
  Music2,
  Palette,
  Bot,
  Shield,
  FileText,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  role: "buyer" | "seller" | "admin";
}

const mainNavItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/orders", label: "Pesanan Saya", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Keranjang", icon: ShoppingCart },
];

const categories = [
  { href: "/?q=netflix", label: "Netflix", icon: Tv },
  { href: "/?q=spotify", label: "Spotify", icon: Music2 },
  { href: "/?q=canva", label: "Canva Pro", icon: Palette },
  { href: "/?q=chatgpt", label: "ChatGPT Plus", icon: Bot },
  { href: "/?q=vpn", label: "VPN Premium", icon: Shield },
  { href: "/?q=microsoft", label: "Microsoft 365", icon: FileText },
];

export function MobileNav({ user }: { user: UserProfile | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close drawer when the route changes (adjust state during render — React-recommended).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const quickActions = [
    ...(user?.role === "buyer" ? [{ href: "/sell", label: "Jadi Penjual", icon: Store, highlight: true }] : []),
    ...(user?.role === "seller" ? [{ href: "/seller/dashboard", label: "Dashboard Penjual", icon: Store, highlight: true }] : []),
    ...(user?.role === "admin"
      ? [
          { href: "/admin/banners", label: "Konten beranda (Admin)", icon: Gift, highlight: true },
          { href: "/admin/sellers", label: "Penjual (Admin)", icon: Store },
          { href: "/admin/listings", label: "Stok Jualan (Admin)", icon: Package },
          { href: "/admin/disputes", label: "Sengketa (Admin)", icon: HelpCircle },
        ]
      : []),
    { href: "/topup", label: "Top Up Saldo", icon: CreditCard },
    { href: "/promo", label: "Promo & Diskon", icon: Gift },
    { href: "/support", label: "Bantuan", icon: HelpCircle },
  ];

  return (
    <div className="lg:hidden">
      {/* Hamburger Trigger Button */}
      <button
        aria-label="Buka menu"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-glass-border bg-background/50 backdrop-blur transition-all duration-200 active:scale-95"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Mobile Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex h-full w-[280px] flex-col border-r border-glass-border bg-gradient-to-b from-[var(--glass-fill)] via-background/95 to-background/90 p-4 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header Logo & Close button */}
              <div className="flex h-12 items-center justify-between border-b border-glass-border pb-3">
                <Link
                  href="/"
                  className="brand-wordmark text-[1.05rem] text-foreground"
                  onClick={() => setOpen(false)}
                >
                  kviboystore
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border bg-background/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
                {/* Menu Utama */}
                <nav className="space-y-1">
                  <span className="mb-2 block px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    Menu Utama
                  </span>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-glass-fill hover:text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8.5 w-8.5 items-center justify-center rounded-lg transition-all",
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-glass-fill text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Kategori Populer */}
                <div>
                  <span className="mb-2 block px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    Kategori Populer
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 px-1">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 rounded-lg bg-glass-fill/50 px-2 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                          <span className="truncate">{cat.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Aksi Cepat */}
                <div className="space-y-1">
                  <span className="mb-2 block px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    Aksi Cepat
                  </span>
                  {quickActions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200",
                          item.highlight
                            ? "bg-gradient-to-r from-[var(--gold)]/15 to-primary/15 text-[var(--gold-soft)] hover:from-[var(--gold)]/25 hover:to-primary/25"
                            : "text-muted-foreground hover:bg-glass-fill hover:text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8.5 w-8.5 items-center justify-center rounded-lg transition-all",
                            item.highlight
                              ? "bg-[var(--gold)]/20 text-[var(--gold-soft)]"
                              : "bg-glass-fill text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Footer Section */}
              <div className="border-t border-glass-border pt-4 mt-auto">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-glass-fill/50 px-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{user.email}</p>
                        <p className="text-[9px] capitalize text-muted-foreground">{user.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <ThemeSwitcher />
                      <div className="flex items-center gap-1">
                        <Link
                          href="/profile"
                          onClick={() => setOpen(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border bg-background/40 text-muted-foreground hover:text-foreground"
                        >
                          <Settings className="h-4 w-4" />
                        </Link>
                        <form action={logout}>
                          <button
                            type="submit"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <ThemeSwitcher />
                      <span className="text-[10px] text-muted-foreground">Pilih Tema Visual</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="flex h-9 items-center justify-center rounded-xl border border-glass-border bg-background/50 text-xs font-bold hover:bg-glass-fill"
                      >
                        Masuk
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setOpen(false)}
                        className="flex h-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        Daftar
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
