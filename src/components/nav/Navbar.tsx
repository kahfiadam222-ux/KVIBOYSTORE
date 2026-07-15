import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { NavbarMobileBrand } from "./NavbarMobileBrand";

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

  const role = (profile?.role as "buyer" | "seller" | "admin") ?? "buyer";
  const isAdmin = role === "admin";

  return (
    <header className="navbar-topbar sticky top-0 z-30 h-16 shrink-0 border-b border-[var(--glass-border)] bg-[var(--glass-fill)]/92 backdrop-blur-2xl supports-[backdrop-filter]:bg-[var(--glass-fill)]/78">
      <nav className="flex h-full w-full items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <NavbarMobileBrand />
          <div className="hidden lg:flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Live storefront
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-0.5">
                <Link
                  href="/profile"
                  className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground"
                >
                  Profil
                </Link>
                <Link
                  href="/orders"
                  className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground"
                >
                  Pesanan
                </Link>
                {role === "seller" && (
                  <Link
                    href="/seller/dashboard"
                    className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              {isAdmin && (
                <Link
                  href="/admin/banners"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "h-8 rounded-xl text-xs font-semibold px-3 gap-1.5 shadow-[var(--shadow-glow)]",
                  })}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline sm:inline">Admin</span>
                </Link>
              )}

              <Link
                href="/profile"
                className="hidden max-w-[120px] truncate text-xs text-muted-foreground sm:inline border-l pl-3 border-[var(--glass-border)] hover:text-foreground transition-colors"
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
    </header>
  );
}
