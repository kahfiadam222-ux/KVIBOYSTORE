"use client";

import type { ReactNode, ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar, MOBILE_MAX } from "./sidebar-context";
import type { SidebarCategory } from "@/lib/categories/defaults";

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
  Tag,
  Tags,
  type LucideProps,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

/** Lucide icons used as fallback when a category has no uploaded logo. */
const CATEGORY_ICONS: Record<string, ComponentType<LucideProps>> = {
  Tv,
  Music2,
  Palette,
  Bot,
  Shield,
  FileText,
  Tag,
  Gift,
  Store,
  CreditCard,
};

interface SidebarProps {
  user: {
    id: string;
    email: string;
    role: "buyer" | "seller" | "admin";
  } | null;
  categories: SidebarCategory[];
}

const mainNavItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/orders", label: "Pesanan Saya", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Keranjang", icon: ShoppingCart },
];

const adminNavItems = [
  { href: "/admin/banners", label: "Konten beranda", icon: ImageIcon },
  { href: "/admin/categories", label: "Kategori sidebar", icon: Tags },
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

function SidebarPanel({
  user,
  categories = [],
  collapsed,
  toggle,
  onNavigate,
}: {
  user: SidebarProps["user"];
  categories?: SidebarCategory[];
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-background/40 text-muted-foreground transition-all hover:border-primary/25 hover:bg-primary/10 hover:text-primary touch-manipulation sidebar-toggle-btn"
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
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-[var(--accent)] hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <SidebarNavLabel collapsed={collapsed}>{item.label}</SidebarNavLabel>
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
              const Icon = CATEGORY_ICONS[cat.iconName] ?? Tag;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  onClick={onNavigate}
                  tabIndex={collapsed ? -1 : 0}
                  className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-[var(--accent)] hover:text-foreground"
                >
                  {cat.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.iconUrl}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded-sm object-cover"
                    />
                  ) : (
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                  )}
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
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-[var(--accent)] hover:text-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <SidebarNavLabel collapsed={collapsed}>{item.label}</SidebarNavLabel>
                </Link>
              );
            })}
            <Link
              href="/admin/banners"
              onClick={onNavigate}
              tabIndex={collapsed ? -1 : 0}
              className={cn(
                "mt-1 flex h-10 items-center gap-2 overflow-hidden rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-opacity duration-300",
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
                  "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                  item.highlight
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-[var(--accent)] hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    item.highlight ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <SidebarNavLabel collapsed={collapsed}>{item.label}</SidebarNavLabel>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--glass-border)] px-3 pb-4 pt-4">
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
    </>
  );
}

export function Sidebar({ user, categories = [] }: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, toggle, close } = useSidebar();

  useEffect(() => {
    // Tutup sidebar drawer jika berpindah halaman di mobile
    if (window.innerWidth <= MOBILE_MAX) {
      close();
    }
  }, [pathname, close]);

  return (
    <div className="sidebar-slot">
      <aside
        className={cn(
          "sidebar-rail flex h-full h-[100dvh] w-full flex-col overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] backdrop-blur-2xl"
        )}
        aria-expanded={!collapsed}
      >
        <SidebarPanel
          user={user}
          categories={categories}
          collapsed={collapsed}
          toggle={toggle}
          onNavigate={close}
        />
      </aside>
    </div>
  );
}
