import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_FLOAT_BANNERS,
  DEFAULT_HERO,
  type FloatBanner,
  type StorefrontHeroContent,
} from "./defaults";

export async function getStorefrontHero(): Promise<StorefrontHeroContent> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("storefront_hero")
      .select(
        "eyebrow, title, title_highlight, description, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href"
      )
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_HERO;

    return {
      eyebrow: data.eyebrow ?? DEFAULT_HERO.eyebrow,
      title: data.title ?? DEFAULT_HERO.title,
      titleHighlight: data.title_highlight ?? DEFAULT_HERO.titleHighlight,
      description: data.description ?? DEFAULT_HERO.description,
      ctaPrimaryLabel: data.cta_primary_label ?? DEFAULT_HERO.ctaPrimaryLabel,
      ctaPrimaryHref: data.cta_primary_href ?? DEFAULT_HERO.ctaPrimaryHref,
      ctaSecondaryLabel:
        data.cta_secondary_label ?? DEFAULT_HERO.ctaSecondaryLabel,
      ctaSecondaryHref:
        data.cta_secondary_href ?? DEFAULT_HERO.ctaSecondaryHref,
    };
  } catch {
    return DEFAULT_HERO;
  }
}

export async function getFloatBanners(
  opts: { includeInactive?: boolean } = {}
): Promise<FloatBanner[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("float_banners")
      .select("slot, title, subtitle, image_url, cta_label, cta_href, is_active")
      .order("slot", { ascending: true });

    if (!opts.includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return opts.includeInactive
        ? DEFAULT_FLOAT_BANNERS
        : DEFAULT_FLOAT_BANNERS.filter((b) => b.isActive);
    }

    const bySlot = new Map(
      data.map((row) => [
        row.slot as number,
        {
          slot: row.slot as 1 | 2 | 3 | 4,
          title: row.title,
          subtitle: row.subtitle,
          imageUrl: row.image_url,
          ctaLabel: row.cta_label,
          ctaHref: row.cta_href,
          isActive: row.is_active,
        } satisfies FloatBanner,
      ])
    );

    // Always return 4 slots for admin editing; fill missing with defaults
    return ([1, 2, 3, 4] as const).map((slot) => {
      const found = bySlot.get(slot);
      if (found) return found;
      return DEFAULT_FLOAT_BANNERS.find((b) => b.slot === slot)!;
    }).filter((b) => (opts.includeInactive ? true : b.isActive));
  } catch {
    return opts.includeInactive
      ? DEFAULT_FLOAT_BANNERS
      : DEFAULT_FLOAT_BANNERS.filter((b) => b.isActive);
  }
}
