import { createClient } from "@/lib/supabase/server";
import type { StorefrontListing } from "@/types/catalog";

export async function getActiveListings(searchQuery?: string): Promise<StorefrontListing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id,
      price,
      currency,
      products (
        id,
        title,
        description,
        image_url,
        is_platform_owned,
        product_types ( name, risk_tier, delivery_method ),
        seller_profiles ( reputation_score )
      )
    `,
    )
    .eq("is_active", true);

  if (error) throw error;

  type Row = {
    id: string;
    price: number;
    currency: string;
    products: {
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      is_platform_owned: boolean;
      product_types: {
        name: string;
        risk_tier: StorefrontListing["riskTier"];
        delivery_method: StorefrontListing["deliveryMethod"];
      } | null;
      seller_profiles: { reputation_score: number } | null;
    } | null;
  };

  const listings = ((data ?? []) as unknown as Row[])
    .filter((row) => row.products && row.products.product_types)
    .map((row) => ({
      listingId: row.id,
      productId: row.products!.id,
      title: row.products!.title,
      description: row.products!.description,
      imageUrl: row.products!.image_url,
      price: row.price,
      currency: row.currency,
      productTypeName: row.products!.product_types!.name,
      riskTier: row.products!.product_types!.risk_tier,
      deliveryMethod: row.products!.product_types!.delivery_method,
      isPlatformOwned: row.products!.is_platform_owned,
      sellerReputation: row.products!.seller_profiles?.reputation_score ?? null,
    }));

  if (!searchQuery) return listings;

  const needle = searchQuery.toLowerCase();
  return listings.filter(
    (l) =>
      l.title.toLowerCase().includes(needle) ||
      l.productTypeName.toLowerCase().includes(needle),
  );
}
