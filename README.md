# kviboystore

Kviboystore adalah platform creative workspace dan digital asset management premium yang dibangun dengan arsitektur modern Next.js 16 + React 19, Tailwind CSS v4, dan Supabase. Platform ini dirancang untuk mempermudah penjualan, pembelian, serta pengelolaan lisensi aset digital dengan alur kerja yang elegan dan aman.

## Fitur Utama

- 🎨 **Glassmorphic UI/UX**: Tampilan premium dengan tema kustom yang elegan, space background, ambient orbs, dan banner 3D interaktif.
- 🔐 **Autentikasi & Otorisasi**: Proteksi halaman dashboard admin, seller, dan profile terintegrasi dengan Supabase Auth & Row Level Security (RLS).
- 🛒 **Storefront Terpadu**: Fitur keranjang belanja (Cart), Wishlist, pencarian cepat (SearchBar), serta dashboard seller untuk mengelola produk.
- 💳 **Integrasi Pembayaran**: Sistem checkout yang terhubung dengan **Xendit payment gateway** untuk pembayaran instan, top up saldo, payout, dan pengembalian dana (refund).
- 📦 **Automasi Transaksi**: Cron job auto-confirm dan webhook handler untuk pembaruan status pemesanan secara real-time.
- 🗃️ **Database Migrations**: Skema database yang lengkap untuk escrow ledger, manajemen stok, ulasan produk, dispute resolution, dan CMS banner dinamis.

## Stack Teknologi

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library UI**: React 19, Framer Motion, Lucide React, Shadcn/ui, Base UI
- **Styling**: Tailwind CSS v4 + PostCSS
- **Backend & Database**: Supabase (Auth, Storage, PostgreSQL)
- **Payment Gateway**: Xendit

## Persiapan Instalasi

1. **Clone repository**:
   ```bash
   git clone https://github.com/kahfiadam222-ux/KVIBOYSTORE.git
   cd KVIBOYSTORE
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Salin berkas `.env.local.example` menjadi `.env.local` lalu isi dengan kredensial API Supabase dan Xendit Anda:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Jalankan server development**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

5. **Bersihkan cache build** (opsional, jika dev/build aneh):
   ```bash
   npm run clean
   ```
   Menghapus `.next/`, `.vercel/`, `tsconfig.tsbuildinfo`, dan `node_modules/.cache`.

6. **Migrasi database terkait keamanan stok**:
   Jalankan di Supabase SQL Editor (jika belum):
   - `supabase/migrations/0014_add_increment_stock.sql` — mengembalikan stok listing secara atomik
   - `supabase/migrations/0016_add_cancelled_order_state.sql` — status order `cancelled` untuk invoice gagal/expired

## Keamanan (ringkas)

- **CSP + security headers** via `src/proxy.ts` + `src/lib/security/headers.ts` (nonce per request)
- **Rate limit** login/signup/checkout (email/user + IP) di `src/lib/security/rateLimiter.ts`
- **Validasi input** email/password/UUID di `src/lib/security/validation.ts`
- **Timing-safe secret compare** untuk webhook Xendit & cron secret di `src/lib/security/crypto.ts`
- **Restore stok** saat invoice `EXPIRED`/`FAILED` atau checkout gagal setelah stock claim
- **Logger** terpusat di `src/lib/debug.ts` (level `security` untuk insiden)

## Debugging di VS Code

Buka folder `kviboystore` sebagai workspace, lalu gunakan konfigurasi di `.vscode/launch.json`:
- **Next.js: Debug Server-side**
- **Next.js: Debug Client-side**
- **Next.js: Debug Full Stack**

## Deploy ke Vercel

Proyek ini telah dikonfigurasi untuk dapat dideploy langsung ke Vercel. Pastikan Anda telah mengatur semua environment variables yang terdaftar di `.env.local.example` pada bagian Settings → Environment Variables di dasbor Vercel Anda sebelum melakukan build.

Co-Authored-By: Claude <noreply@anthropic.com>
🤖 Generated with [Claude Code](https://claude.com/claude-code)
