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

  const links = user
    ? [
        { href: "/orders", label: "Pesanan Saya" },
        ...(profile?.role === "buyer" ? [{ href: "/sell", label: "Jadi Penjual" }] : []),
        ...(profile?.role === "seller"
          ? [{ href: "/seller/dashboard", label: "Dashboard Penjual" }]
          : []),
        ...(profile?.role === "admin"
          ? [
              { href: "/admin/sellers", label: "Admin" },
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
    <header className="glass-panel sticky top-0 z-40 border-x-0 border-t-0 backdrop-blur-xl">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight"
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
          <span className="hidden sm:inline">KVIBOYSTORE</span>
        </Link>

        <div className="hidden min-w-0 items-center gap-4 sm:flex">
          {user ? (
            <>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground lg:inline">
                {user.email}
              </span>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Keluar
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Masuk
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Daftar
              </Link>
            </>
          )}
        </div>

        <MobileNav links={links} email={user?.email ?? null} />
      </nav>
    </header>
  );
}
