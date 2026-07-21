import { createClient } from "@/lib/supabase/server";
import type { StorefrontListing } from "@/types/catalog";

export async function getActiveListings(searchQuery?: string): Promise<StorefrontListing[]> {
  const supabase = await createClient();

  // Only show listings that are active AND still have stock. Sold-out items are
  // auto-deactivated, but we also guard stock_count so a stale is_active flag
  // never surfaces an empty product on the storefront.
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id,
      price,
      currency,
      stock_count,
      products (
        id,
        title,
        description,
        image_url,
        is_platform_owned,
        created_at,
        product_types ( name, risk_tier, delivery_method ),
        seller_profiles ( reputation_score )
      )
    `,
    )
    .eq("is_active", true)
    .gt("stock_count", 0)
    .order("id", { ascending: false });

  if (error) {
    console.error("[getActiveListings]", error.message);
    return [];
  }

  type Row = {
    id: string;
    price: number;
    currency: string;
    stock_count: number;
    products: {
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      is_platform_owned: boolean;
      created_at: string | null;
      product_types: {
        name: string;
        risk_tier: StorefrontListing["riskTier"];
        delivery_method: StorefrontListing["deliveryMethod"];
      } | null;
      seller_profiles: { reputation_score: number } | null;
    } | null;
  };

  const mapped = ((data ?? []) as unknown as Row[])
    .filter((row) => row.products && row.products.product_types)
    .map((row) => {
      const listing: StorefrontListing & { createdAt: string | null } = {
        listingId: row.id,
        productId: row.products!.id,
        title: row.products!.title,
        description: row.products!.description,
        imageUrl: row.products!.image_url?.trim() || null,
        price: row.price,
        currency: row.currency,
        stockCount: row.stock_count,
        productTypeName: row.products!.product_types!.name,
        riskTier: row.products!.product_types!.risk_tier,
        deliveryMethod: row.products!.product_types!.delivery_method,
        isPlatformOwned: row.products!.is_platform_owned,
        sellerReputation: row.products!.seller_profiles?.reputation_score ?? null,
        createdAt: row.products!.created_at,
      };
      return listing;
    })
    // Newest products first so freshly uploaded stock/photos show at the top.
    .sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });

  const listings: StorefrontListing[] = mapped.map((row) => {
    const { createdAt, ...listing } = row;
    void createdAt;
    return listing;
  });

  if (!searchQuery) return listings;

  const needle = searchQuery.toLowerCase();
  return listings.filter(
    (l) =>
      l.title.toLowerCase().includes(needle) ||
      l.productTypeName.toLowerCase().includes(needle) ||
      (l.description?.toLowerCase().includes(needle) ?? false),
  );
}
