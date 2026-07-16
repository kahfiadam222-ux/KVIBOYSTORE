import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CATEGORIES, type SidebarCategory } from "./defaults";

function mapRow(row: {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  icon_url: string | null;
  sort_order: number | null;
  is_active: boolean;
}): SidebarCategory {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    iconName: row.icon ?? "Tag",
    iconUrl: row.icon_url,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active,
  };
}

/** Fetch sidebar categories. Falls back to DEFAULT_CATEGORIES when the table
 *  is missing or empty, so the sidebar always renders something sensible. */
export async function getSidebarCategories(
  opts: { includeInactive?: boolean } = {}
): Promise<SidebarCategory[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("sidebar_categories")
      .select("id, label, href, icon, icon_url, sort_order, is_active")
      .order("sort_order", { ascending: true });

    if (!opts.includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return opts.includeInactive
        ? DEFAULT_CATEGORIES
        : DEFAULT_CATEGORIES.filter((c) => c.isActive);
    }

    return data.map(mapRow);
  } catch {
    return opts.includeInactive
      ? DEFAULT_CATEGORIES
      : DEFAULT_CATEGORIES.filter((c) => c.isActive);
  }
}
