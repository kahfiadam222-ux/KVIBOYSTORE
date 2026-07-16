import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerListingCard } from "@/components/storefront/SellerListingCard";
import { CreateListingForm } from "@/components/storefront/CreateListingForm";

export default async function AdminListingsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  // Query all listings with their seller legal name
  const { data: products } = await admin
    .from("products")
    .select("id, title, description, image_url, product_type_id, status, seller_id, seller_profiles ( legal_name ), listings ( id, price, currency, stock_count, is_active )")
    .order("created_at", { ascending: false });

  // Query all product types
  const { data: productTypes } = await admin
    .from("product_types")
    .select("id, name")
    .order("name");

  // Query semua penjual untuk pembuat listing admin (fleksibel — tidak dibatasi
  // hanya yang approved; admin juga bisa memilih Platform sebagai pemilik).
  const { data: sellers } = await admin
    .from("seller_profiles")
    .select("user_id, legal_name")
    .order("legal_name");

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 flex-grow">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Semua Stok Jualan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sebagai Administrator, Anda dapat mengedit harga, deskripsi, jenis, gambar, dan persediaan stok untuk semua produk di platform.
        </p>
      </header>

      {/* Admin Creator for New Listings */}
      <CreateListingForm 
        productTypes={productTypes ?? []} 
        sellers={sellers ?? []} 
        isAdmin={true} 
      />

      <h2 className="mb-4 text-lg font-semibold text-foreground">Daftar Semua Stok Jualan</h2>
      {!products || products.length === 0 ? (
        <p className="text-muted-foreground">Tidak ada produk jualan di platform.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <SellerListingCard
              key={product.id}
              product={product as any}
              productTypes={productTypes ?? []}
            />
          ))}
        </div>
      )}
    </main>
  );
}
