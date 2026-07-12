import { createClient } from "@/lib/supabase/server";

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
}

export async function getActiveBanners(): Promise<HomepageBanner[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("homepage_banners")
    .select("id, title, subtitle, image_url, cta_label, cta_href")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
  }));
}
