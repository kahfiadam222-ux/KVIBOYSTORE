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

## Deploy ke Vercel

Proyek ini telah dikonfigurasi untuk dapat dideploy langsung ke Vercel. Pastikan Anda telah mengatur semua environment variables yang terdaftar di `.env.local.example` pada bagian Settings → Environment Variables di dasbor Vercel Anda sebelum melakukan build.

Co-Authored-By: Claude <noreply@anthropic.com>
🤖 Generated with [Claude Code](https://claude.com/claude-code)
