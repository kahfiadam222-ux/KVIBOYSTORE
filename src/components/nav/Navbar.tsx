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
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          KVIBOYSTORE
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
