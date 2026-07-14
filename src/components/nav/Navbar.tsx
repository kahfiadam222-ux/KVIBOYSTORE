import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
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

  const links = user
    ? [
        { href: "/profile", label: "Profil" },
        { href: "/orders", label: "Pesanan" },
        ...(profile?.role === "buyer"
          ? [{ href: "/sell", label: "Jadi Penjual" }]
          : []),
        ...(profile?.role === "seller"
          ? [{ href: "/seller/dashboard", label: "Dashboard" }]
          : []),
        ...(profile?.role === "admin"
          ? [
              { href: "/admin/sellers", label: "Penjual" },
              { href: "/admin/listings", label: "Stok" },
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
    <header className="sticky top-0 z-40 border-b border-[var(--glass-border)] bg-[var(--glass-fill)]/80 backdrop-blur-2xl">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight lg:hidden"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[var(--gold)] shadow-[var(--shadow-glow)] text-white"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 11.91 4.59-2.15 8-6.86 8-11.91V5l-8-3z" />
            </svg>
          </span>
          <span className="font-qurova bg-gradient-to-r from-primary via-[var(--gold-soft)] to-foreground bg-clip-text text-xl font-bold tracking-tight text-transparent">
            KV
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Live storefront
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-1">
                {links.slice(0, 2).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/profile"
                className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline border-l pl-3 border-[var(--glass-border)] hover:text-foreground transition-colors"
              >
                {user.email}
              </Link>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs font-semibold px-3 border-[var(--glass-border)] bg-transparent"
                >
                  Keluar
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground"
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({
                  size: "sm",
                  className: "h-8 rounded-xl text-xs font-semibold px-3.5",
                })}
              >
                Daftar gratis
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="gold-line opacity-50" />
    </header>
  );
}
