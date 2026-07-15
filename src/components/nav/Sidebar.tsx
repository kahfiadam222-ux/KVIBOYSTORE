"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { SIDEBAR_WIDTH_EXPANDED } from "./sidebar-context";
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

function SidebarNavLabel({
  collapsed,
  children,
  className,
}: {
  collapsed: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "truncate whitespace-nowrap transition-all duration-300 ease-in-out",
        collapsed ? "max-w-0 opacity-0" : "max-w-full flex-1 opacity-100",
        className
      )}
    >
      {children}
    </span>
  );
}

function SidebarSectionLabel({
  collapsed,
  children,
  className,
}: {
  collapsed: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mb-2 block overflow-hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-300",
        collapsed ? "max-h-0 opacity-0" : "max-h-6 opacity-100",
        className
      )}
    >
      {children}
    </span>
  );
}

const categories = [
  { href: "/?q=netflix", label: "Netflix", icon: Tv },
  { href: "/?q=spotify", label: "Spotify", icon: Music2 },
  { href: "/?q=canva", label: "Canva Pro", icon: Palette },
  { href: "/?q=chatgpt", label: "ChatGPT Plus", icon: Bot },
  { href: "/?q=vpn", label: "VPN Premium", icon: Shield },
  { href: "/?q=microsoft", label: "Microsoft 365", icon: FileText },
];

function SidebarPanel({
  user,
  collapsed,
  toggle,
  onNavigate,
}: {
  user: SidebarProps["user"];
  collapsed: boolean;
  toggle: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "sidebar-topbar flex h-16 shrink-0 items-center gap-2 overflow-hidden border-b border-[var(--glass-border)] px-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "brand-wordmark min-w-0 truncate text-[1.05rem] text-foreground transition-all duration-300 ease-in-out hover:text-primary",
            collapsed
              ? "pointer-events-none max-w-0 opacity-0"
              : "max-w-[170px] flex-1 px-1 opacity-100"
          )}
          tabIndex={collapsed ? -1 : 0}
          aria-hidden={collapsed}
        >
          kviboystore
        </Link>
        <button
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-background/40 text-muted-foreground transition-all hover:border-primary/25 hover:bg-primary/10 hover:text-primary touch-manipulation"
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

      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto py-4 scrollbar-thin">
        <nav className="space-y-1 px-3">
          <SidebarSectionLabel collapsed={collapsed} className="text-muted-foreground/70">
            Menu
          </SidebarSectionLabel>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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
                <SidebarNavLabel collapsed={collapsed}>{item.label}</SidebarNavLabel>
                <div
                  className={cn(
                    "absolute right-2 h-1.5 w-1.5 rounded-full bg-primary transition-opacity duration-300",
                    isActive && !collapsed ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "mt-6 overflow-hidden px-3 transition-all duration-300 ease-in-out",
            collapsed ? "pointer-events-none max-h-0 opacity-0" : "max-h-[420px] opacity-100"
          )}
        >
          <SidebarSectionLabel collapsed={collapsed} className="text-muted-foreground/70">
            Kategori
          </SidebarSectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={onNavigate}
                  tabIndex={collapsed ? -1 : 0}
                  className="flex items-center gap-2 rounded-lg bg-[var(--glass-fill)]/60 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {user?.role === "admin" && (
          <div className="mt-6 space-y-1 px-3">
            <SidebarSectionLabel collapsed={collapsed} className="text-primary/80">
              Admin
            </SidebarSectionLabel>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
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
                  <SidebarNavLabel collapsed={collapsed}>{item.label}</SidebarNavLabel>
                </Link>
              );
            })}
            <Link
              href="/admin/banners"
              onClick={onNavigate}
              tabIndex={collapsed ? -1 : 0}
              className={cn(
                "mt-1 flex items-center gap-2 overflow-hidden rounded-xl bg-[image:var(--primary-gradient)] px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300",
                collapsed
                  ? "pointer-events-none max-h-0 opacity-0 py-0"
                  : "max-h-12 opacity-100"
              )}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="truncate">Panel konten</span>
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-1 px-3">
          <SidebarSectionLabel collapsed={collapsed} className="text-muted-foreground/70">
            Aksi
          </SidebarSectionLabel>
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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
                <SidebarNavLabel collapsed={collapsed}>{item.label}</SidebarNavLabel>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[var(--glass-border)] px-3 pt-4">
          {user && (
            <div
              className={cn(
                "mb-3 flex items-center gap-3 overflow-hidden rounded-xl bg-[var(--glass-fill)]/60 px-3 transition-all duration-300",
                collapsed
                  ? "pointer-events-none max-h-0 opacity-0 py-0"
                  : "max-h-20 opacity-100 py-2.5"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
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
            {user && (
              <Link
                href="/profile"
                onClick={onNavigate}
                tabIndex={collapsed ? -1 : 0}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-[var(--glass-fill)] hover:text-foreground",
                  collapsed
                    ? "pointer-events-none max-h-0 max-w-0 opacity-0"
                    : "opacity-100"
                )}
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const { collapsed, toggle, close, isOverlay } = useSidebar();
  const railCollapsed = isOverlay || collapsed;

  return (
    <div className="sidebar-slot sticky top-0 z-20 h-screen min-w-0">
      {/* Rail di dalam grid — lebar mengikuti kolom grid */}
      <aside
        className={cn(
          "sidebar-rail flex h-full w-full flex-col overflow-hidden border-r border-[var(--glass-border)] backdrop-blur-2xl",
          "bg-gradient-to-b from-[var(--glass-fill)] via-background/96 to-background/92",
          "shadow-[8px_0_40px_-28px_rgba(0,0,0,0.4)]"
        )}
        aria-expanded={!railCollapsed}
      >
        <SidebarPanel
          user={user}
          collapsed={railCollapsed}
          toggle={toggle}
        />
      </aside>

      {/* Mobile: panel penuh melayang di atas konten saat dibuka */}
      {isOverlay && (
        <aside
          className="sidebar-drawer fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-[var(--glass-border)] backdrop-blur-2xl shadow-2xl"
          style={{ width: SIDEBAR_WIDTH_EXPANDED }}
        >
          <div className="flex h-full w-full flex-col bg-gradient-to-b from-[var(--glass-fill)] via-background/96 to-background/92">
            <SidebarPanel
              user={user}
              collapsed={false}
              toggle={toggle}
              onNavigate={close}
            />
          </div>
        </aside>
      )}
    </div>
  );
}