import Link from "next/link";
import { signup } from "../actions";
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

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <TiltCard className="w-full max-w-md relative rounded-3xl" glowColor="var(--primary)">
        <Card className="w-full border-border bg-card/60 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">Buat Akun KVIBOYSTORE</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline transition-colors">
                Masuk Di Sini
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <GoogleLoginButton />
              <GithubLoginButton />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">atau</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <form action={signup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="h-10 rounded-xl px-4 border-border bg-background/30 focus-visible:ring-primary/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kata Sandi</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="h-10 rounded-xl px-4 border-border bg-background/30 focus-visible:ring-primary/20"
                />
              </div>
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2">
                Daftar
              </Button>
            </form>
          </CardContent>
        </Card>
      </TiltCard>
    </div>
  );
}
