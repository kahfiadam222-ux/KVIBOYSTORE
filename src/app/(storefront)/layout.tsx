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
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar user={userWithRole} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:ml-[260px]">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
