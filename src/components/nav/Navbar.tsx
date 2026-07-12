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

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          KVIBOYSTORE
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">
                Pesanan Saya
              </Link>
              {profile?.role === "buyer" && (
                <Link href="/sell" className="text-sm text-muted-foreground hover:text-foreground">
                  Jadi Penjual
                </Link>
              )}
              {profile?.role === "seller" && (
                <Link
                  href="/seller/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Dashboard Penjual
                </Link>
              )}
              {profile?.role === "admin" && (
                <Link
                  href="/admin/sellers"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-muted-foreground">{user.email}</span>
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
      </nav>
    </header>
  );
}
