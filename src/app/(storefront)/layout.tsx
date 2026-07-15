import { Navbar } from "@/components/nav/Navbar";
import { SidebarProvider } from "@/components/nav/sidebar-context";
import { StorefrontFrame } from "@/components/nav/StorefrontFrame";
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
    <SidebarProvider>
      <StorefrontFrame user={userWithRole}>
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </StorefrontFrame>
    </SidebarProvider>
  );
}
