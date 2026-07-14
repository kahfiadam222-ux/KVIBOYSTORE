"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingCart,
  Package,
  Heart,
  User,
  Store,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  Gift,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

import { useEffect } from "react";

interface SidebarProps {
  user: {
    id: string;
    email: string;
    role: "buyer" | "seller" | "admin";
  } | null;
}

const mainNavItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/orders", label: "Pesanan Saya", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Keranjang", icon: ShoppingCart },
];

const quickActions = [
  { href: "/sell", label: "Jadi Penjual", icon: Store, highlight: true },
  { href: "/topup", label: "Top Up Saldo", icon: CreditCard },
  { href: "/promo", label: "Promo & Diskon", icon: Gift },
  { href: "/support", label: "Bantuan", icon: HelpCircle },
];

const categories = [
  { href: "/?q=netflix", label: "Netflix", icon: "🎬" },
  { href: "/?q=spotify", label: "Spotify", icon: "🎵" },
  { href: "/?q=canva", label: "Canva Pro", icon: "🎨" },
  { href: "/?q=chatgpt", label: "ChatGPT Plus", icon: "🤖" },
  { href: "/?q=vpn", label: "VPN Premium", icon: "🔒" },
  { href: "/?q=microsoft", label: "Microsoft 365", icon: "📝" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Expand by default on desktop, collapse on mobile
    if (window.innerWidth >= 1024) {
      setCollapsed(false);
    }
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen border-r border-[var(--glass-border)] backdrop-blur-2xl transition-all duration-300",
        "bg-gradient-to-b from-[var(--glass-fill)] via-background/95 to-background/90",
        "shadow-[8px_0_40px_-24px_rgba(0,0,0,0.45)]",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--glass-border)] px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[var(--gold)] shadow-[var(--shadow-glow)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-qurova block bg-gradient-to-r from-primary via-[var(--gold-soft)] to-foreground bg-clip-text text-xl font-bold tracking-tight text-transparent">
                KVIBOY
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Store
              </span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-background/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-glass-border scrollbar-track-transparent">
        {/* Main Navigation */}
        <nav className="space-y-1 px-3">
          {!collapsed && (
            <span className="mb-2 block px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Menu Utama
            </span>
          )}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-glass-fill hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-glass-fill text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Categories */}
        {!collapsed && (
          <div className="mt-6 px-3">
            <span className="mb-2 block px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Kategori Populer
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="flex items-center gap-2 rounded-lg bg-glass-fill/50 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 space-y-1 px-3">
          {!collapsed && (
            <span className="mb-2 block px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Aksi Cepat
            </span>
          )}
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  item.highlight
                    ? "bg-gradient-to-r from-[var(--gold)]/15 to-primary/15 text-[var(--gold-soft)] hover:from-[var(--gold)]/25 hover:to-primary/25"
                    : "text-muted-foreground hover:bg-glass-fill hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                    item.highlight
                      ? "bg-[var(--gold)]/20 text-[var(--gold-soft)]"
                      : "bg-glass-fill text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Section (Bottom) */}
        <div className="mt-auto border-t border-[var(--glass-border)] px-3 pt-4">
          {!collapsed && user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-glass-fill/50 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{user.email}</p>
                <p className="text-[10px] capitalize text-muted-foreground">{user.role}</p>
              </div>
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-2",
              collapsed ? "flex-col" : "justify-between"
            )}
          >
            <ThemeSwitcher />
            {user && !collapsed && (
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-glass-fill hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Glass Sheen Overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-2xl">
        <div className="absolute -right-20 -top-20 h-40 w-40 rotate-45 bg-gradient-to-br from-white/10 to-transparent" />
      </div>
    </aside>
  );
}
