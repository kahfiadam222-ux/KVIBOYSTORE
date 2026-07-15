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

    // Try to select with Slide 2 columns
    const { data, error } = await supabase
      .from("storefront_hero")
      .select(
        "eyebrow, title, title_highlight, description, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, slide2_title, slide2_description, slide2_cta_label, slide2_cta_href, slide2_promo_text"
      )
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      // Fallback: select only Slide 1 columns if Slide 2 columns don't exist yet in DB
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("storefront_hero")
        .select(
          "eyebrow, title, title_highlight, description, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href"
        )
        .eq("id", 1)
        .maybeSingle();

      if (fallbackError || !fallbackData) return DEFAULT_HERO;

      return {
        eyebrow: fallbackData.eyebrow ?? DEFAULT_HERO.eyebrow,
        title: fallbackData.title ?? DEFAULT_HERO.title,
        titleHighlight: fallbackData.title_highlight ?? DEFAULT_HERO.titleHighlight,
        description: fallbackData.description ?? DEFAULT_HERO.description,
        ctaPrimaryLabel: fallbackData.cta_primary_label ?? DEFAULT_HERO.ctaPrimaryLabel,
        ctaPrimaryHref: fallbackData.cta_primary_href ?? DEFAULT_HERO.ctaPrimaryHref,
        ctaSecondaryLabel: fallbackData.cta_secondary_label ?? DEFAULT_HERO.ctaSecondaryLabel,
        ctaSecondaryHref: fallbackData.cta_secondary_href ?? DEFAULT_HERO.ctaSecondaryHref,
        slide2Title: DEFAULT_HERO.slide2Title,
        slide2Description: DEFAULT_HERO.slide2Description,
        slide2CtaLabel: DEFAULT_HERO.slide2CtaLabel,
        slide2CtaHref: DEFAULT_HERO.slide2CtaHref,
        slide2PromoText: DEFAULT_HERO.slide2PromoText,
      };
    }

    return {
      eyebrow: data.eyebrow ?? DEFAULT_HERO.eyebrow,
      title: data.title ?? DEFAULT_HERO.title,
      titleHighlight: data.title_highlight ?? DEFAULT_HERO.titleHighlight,
      description: data.description ?? DEFAULT_HERO.description,
      ctaPrimaryLabel: data.cta_primary_label ?? DEFAULT_HERO.ctaPrimaryLabel,
      ctaPrimaryHref: data.cta_primary_href ?? DEFAULT_HERO.ctaPrimaryHref,
      ctaSecondaryLabel: data.cta_secondary_label ?? DEFAULT_HERO.ctaSecondaryLabel,
      ctaSecondaryHref: data.cta_secondary_href ?? DEFAULT_HERO.ctaSecondaryHref,
      slide2Title: data.slide2_title ?? DEFAULT_HERO.slide2Title,
      slide2Description: data.slide2_description ?? DEFAULT_HERO.slide2Description,
      slide2CtaLabel: data.slide2_cta_label ?? DEFAULT_HERO.slide2CtaLabel,
      slide2CtaHref: data.slide2_cta_href ?? DEFAULT_HERO.slide2CtaHref,
      slide2PromoText: data.slide2_promo_text ?? DEFAULT_HERO.slide2PromoText,
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
