import Link from "next/link";
import { login } from "../actions";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { GithubLoginButton } from "@/components/auth/GithubLoginButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiltCard } from "@/components/effects/TiltCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <TiltCard className="w-full max-w-md relative rounded-3xl" glowColor="var(--gold)">
        <Card className="w-full glass-card rounded-[inherit] shadow-[var(--shadow-premium)]">
          <CardHeader className="space-y-2 text-center pb-4">
            <p className="eyebrow mb-1">Selamat Datang</p>
            <CardTitle className="heading-display text-2xl sm:text-3xl">
              Masuk ke{" "}
              <span className="text-premium">KVIBOYSTORE</span>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline transition-colors">
                Daftar Sekarang
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <GoogleLoginButton />
              <GithubLoginButton />
            </div>

            <div className="flex items-center gap-3">
              <div className="gold-line flex-1 opacity-50" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">atau</span>
              <div className="gold-line flex-1 opacity-50" />
            </div>

            <form action={login} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="eyebrow">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="h-10 rounded-xl px-4 border-[var(--glass-border)] bg-background/30 focus-visible:ring-[var(--gold)]/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="eyebrow">Kata Sandi</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-10 rounded-xl px-4 border-[var(--glass-border)] bg-background/30 focus-visible:ring-[var(--gold)]/20"
                />
              </div>
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2">
                Masuk
              </Button>
            </form>
          </CardContent>
        </Card>
      </TiltCard>
    </div>
  );
}
