import { Navbar } from "@/components/nav/Navbar";
import { SidebarProvider } from "@/components/nav/sidebar-context";
import { StorefrontFrame } from "@/components/nav/StorefrontFrame";
import { createClient } from "@/lib/supabase/server";
import { getSidebarCategories } from "@/lib/categories/queries";

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

  const categories = await getSidebarCategories();

  return (
    <SidebarProvider>
      <StorefrontFrame user={userWithRole} categories={categories}>
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </StorefrontFrame>
    </SidebarProvider>
  );
}
