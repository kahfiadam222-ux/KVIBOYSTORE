import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductTypeManager, type ProductTypeRow } from "./ProductTypeManager";

export default async function AdminProductTypesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from("product_types")
    .select("id, name, risk_tier, delivery_method")
    .order("name", { ascending: true });

  const productTypes: ProductTypeRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    riskTier: (row.risk_tier as string) ?? "tier_1",
    deliveryMethod: (row.delivery_method as string) ?? "redeem_code",
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jenis produk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola jenis produk (tipe stok) yang bisa dipilih penjual & admin saat
          membuat listing — tambah, ubah nama/risk tier/metode pengiriman, atau
          hapus. Hanya admin.
        </p>
      </div>

      <ProductTypeManager productTypes={productTypes} />
    </main>
  );
}
