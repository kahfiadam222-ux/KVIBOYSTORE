import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { MobileNav } from "./MobileNav";
import { Button, buttonVariants } from "@/components/ui/button";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase.from("profiles").select("role").eq("id", user.id).single()
      ).data
    : null;

  const userWithRole = user
    ? {
        id: user.id,
        email: user.email ?? "",
        role: (profile?.role as "buyer" | "seller" | "admin") ?? "buyer",
      }
    : null;

  const links = user
    ? [
        { href: "/profile", label: "Profil Saya" },
        { href: "/orders", label: "Pesanan Saya" },
        ...(profile?.role === "buyer" ? [{ href: "/sell", label: "Jadi Penjual" }] : []),
        ...(profile?.role === "seller"
          ? [{ href: "/seller/dashboard", label: "Dashboard Penjual" }]
          : []),
        ...(profile?.role === "admin"
          ? [
              { href: "/admin/sellers", label: "Penjual" },
              { href: "/admin/listings", label: "Stok Jualan" },
              { href: "/admin/disputes", label: "Sengketa" },
              { href: "/admin/banners", label: "Banner" },
            ]
          : []),
      ]
    : [
        { href: "/login", label: "Masuk" },
        { href: "/signup", label: "Daftar" },
      ];

  return (
    <header className="glass-panel sticky top-0 z-40 border-x-0 border-t-0 backdrop-blur-xl lg:border-l-0">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3.5 sm:px-6 lg:px-8">
        {/* Mobile Logo - Only show on mobile */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight lg:hidden"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11.5 12 4l9 7.5" />
              <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
            </svg>
          </span>
          <span className="font-qurova bg-gradient-to-r from-primary via-[var(--gold-soft)] to-foreground bg-clip-text text-xl font-bold tracking-tight text-transparent">
            KV
          </span>
        </Link>

        {/* Desktop: Search Bar or Page Title */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-4">
          {user ? (
            <>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative whitespace-nowrap text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground py-1 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-primary to-[var(--gold)] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              <Link
                href="/profile"
                className="hidden max-w-[160px] truncate text-sm text-muted-foreground lg:inline border-l pl-4 border-border/60 hover:text-foreground transition-colors duration-200"
              >
                {user.email}
              </Link>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Keluar
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="relative text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground py-1 group"
              >
                Masuk
                <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-primary to-[var(--gold)] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNav user={userWithRole} />
        </div>
      </nav>
      {/* Gold divider — premium section break under the navbar. */}
      <div className="gold-line opacity-70" />
    </header>
  );
}
