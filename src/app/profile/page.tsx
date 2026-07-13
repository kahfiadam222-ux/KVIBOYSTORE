import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForms } from "./ProfileForms";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, phone, display_name, avatar_url, role, kyc_status")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  let sellerProfile = null;
  if (profile.role === "seller") {
    const { data } = await supabase
      .from("seller_profiles")
      .select("verification_status")
      .eq("user_id", user.id)
      .single();
    sellerProfile = data;
  }

  return (
    <main className="mx-auto max-w-5xl w-full px-4 py-10 flex-grow">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/40 backdrop-blur transition-all duration-200 hover:bg-accent/40 active:scale-95 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs font-semibold text-muted-foreground">Kembali ke Beranda</span>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola data diri, foto profil, dan kata sandi keamanan Anda.
        </p>
      </header>

      <ProfileForms profile={profile} sellerProfile={sellerProfile} />
    </main>
  );
}
