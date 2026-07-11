import { createClient } from "@/lib/supabase/server";
import type { StorefrontListing } from "@/types/catalog";

export async function getActiveListings(): Promise<StorefrontListing[]> {
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
        is_platform_owned,
        product_types ( name, risk_tier, delivery_method )
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
      is_platform_owned: boolean;
      product_types: {
        name: string;
        risk_tier: StorefrontListing["riskTier"];
        delivery_method: StorefrontListing["deliveryMethod"];
      } | null;
    } | null;
  };

  return ((data ?? []) as unknown as Row[])
    .filter((row) => row.products && row.products.product_types)
    .map((row) => ({
      listingId: row.id,
      productId: row.products!.id,
      title: row.products!.title,
      description: row.products!.description,
      price: row.price,
      currency: row.currency,
      productTypeName: row.products!.product_types!.name,
      riskTier: row.products!.product_types!.risk_tier,
      deliveryMethod: row.products!.product_types!.delivery_method,
      isPlatformOwned: row.products!.is_platform_owned,
    }));
}
