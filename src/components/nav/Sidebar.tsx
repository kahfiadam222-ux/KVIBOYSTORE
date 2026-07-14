"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  CreditCard,
  Gift,
  Tv,
  Music2,
  Palette,
  Bot,
  Shield,
  FileText,
  LayoutDashboard,
  ImageIcon,
  Users,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

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

const adminNavItems = [
  { href: "/admin/banners", label: "Konten beranda", icon: ImageIcon },
  { href: "/admin/sellers", label: "Penjual", icon: Users },
  { href: "/admin/listings", label: "Stok jualan", icon: PackageOpen },
  { href: "/admin/disputes", label: "Sengketa", icon: AlertTriangle },
];

const quickActions = [
  { href: "/sell", label: "Jadi Penjual", icon: Store, highlight: true },
  { href: "/topup", label: "Top Up Saldo", icon: CreditCard },
  { href: "/promo", label: "Promo dan Diskon", icon: Gift },
  { href: "/support", label: "Bantuan", icon: HelpCircle },
];

const categories = [
  { href: "/?q=netflix", label: "Netflix", icon: Tv },
  { href: "/?q=spotify", label: "Spotify", icon: Music2 },
  { href: "/?q=canva", label: "Canva Pro", icon: Palette },
  { href: "/?q=chatgpt", label: "ChatGPT Plus", icon: Bot },
  { href: "/?q=vpn", label: "VPN Premium", icon: Shield },
  { href: "/?q=microsoft", label: "Microsoft 365", icon: FileText },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setCollapsed(false);
    }
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen border-r border-[var(--glass-border)] backdrop-blur-2xl transition-all duration-300",
        "bg-gradient-to-b from-[var(--glass-fill)] via-background/96 to-background/92",
        "shadow-[8px_0_40px_-28px_rgba(0,0,0,0.4)]",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-[var(--glass-border)] px-3 gap-2">
        {!collapsed && (
          <Link
            href="/"
            className="brand-wordmark min-w-0 truncate px-1 text-[1.05rem] text-foreground hover:text-primary transition-colors"
          >
            kviboystore
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-background/40 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/25",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          type="button"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto overflow-x-hidden py-4 scrollbar-thin">
        <nav className="space-y-1 px-3">
          {!collapsed && (
            <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Menu
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
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-[var(--glass-fill)] hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-[var(--glass-fill)] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="mt-6 px-3">
            <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Kategori
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="flex items-center gap-2 rounded-lg bg-[var(--glass-fill)]/60 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {user?.role === "admin" && (
          <div className="mt-6 space-y-1 px-3">
            {!collapsed && (
              <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Admin
              </span>
            )}
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-primary/10 text-primary/90 group-hover:bg-primary/15"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                </Link>
              );
            })}
            {!collapsed && (
              <Link
                href="/admin/banners"
                className="mt-1 flex items-center gap-2 rounded-xl bg-[image:var(--primary-gradient)] px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Panel konten
              </Link>
            )}
          </div>
        )}

        <div className="mt-6 space-y-1 px-3">
          {!collapsed && (
            <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Aksi
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
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:bg-[var(--glass-fill)] hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                    item.highlight
                      ? "bg-primary/15 text-primary"
                      : "bg-[var(--glass-fill)] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[var(--glass-border)] px-3 pt-4">
          {!collapsed && user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-[var(--glass-fill)]/60 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user.email}
                </p>
                <p className="text-[10px] capitalize text-muted-foreground">
                  {user.role}
                </p>
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
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-[var(--glass-fill)] hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
