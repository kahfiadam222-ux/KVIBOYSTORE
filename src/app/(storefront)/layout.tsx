import { Navbar } from "@/components/nav/Navbar";
import { Sidebar } from "@/components/nav/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userWithRole = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userWithRole = {
      id: user.id,
      email: user.email ?? "",
      role: (profile?.role as "buyer" | "seller" | "admin") ?? "buyer",
    };
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar - Always visible on left for both mobile and desktop */}
      <Sidebar user={userWithRole} />

      {/* Main Content Area - shifts to make space for sidebar */}
      <div className="flex flex-1 flex-col pl-[72px] lg:pl-[260px] transition-all duration-300 w-full min-w-0">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
