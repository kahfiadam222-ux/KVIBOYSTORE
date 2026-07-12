"use server";

import { revalidatePath } from "next/cache";
import { requireSeller } from "@/lib/auth/requireSeller";
import { createClient } from "@/lib/supabase/server";

export async function createListing(formData: FormData) {
  const user = await requireSeller();
  const supabase = await createClient();

  const productTypeId = formData.get("productTypeId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const stockCount = Number(formData.get("stockCount"));

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      product_type_id: productTypeId,
      title,
      description,
      is_platform_owned: false,
      status: "active",
    })
    .select("id")
    .single();

  if (productError || !product) return;

  await supabase.from("listings").insert({
    product_id: product.id,
    price,
    stock_count: stockCount,
    is_active: true,
  });

  revalidatePath("/seller/dashboard");
}
