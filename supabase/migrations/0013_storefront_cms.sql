-- CMS for storefront hero copy + 4 floating 3D banner slots (admin-only writes).

create table if not exists storefront_hero (
  id integer primary key default 1 check (id = 1),
  eyebrow text not null default 'kviboystore',
  title text not null default 'Langganan digital',
  title_highlight text not null default 'yang rapi dan cepat',
  description text not null default 'Marketplace lisensi dan langganan digital — checkout cepat, pengiriman instan, dan pengalaman belanja yang modern.',
  cta_primary_label text not null default 'Jelajahi katalog',
  cta_primary_href text not null default '#produk',
  cta_secondary_label text not null default 'Lihat promo',
  cta_secondary_href text not null default '/promo',
  updated_at timestamptz not null default now()
);

insert into storefront_hero (id) values (1)
on conflict (id) do nothing;

alter table storefront_hero enable row level security;

drop policy if exists "storefront_hero: public read" on storefront_hero;
create policy "storefront_hero: public read" on storefront_hero
  for select using (true);

-- Exactly 4 floating banner columns (slots 1–4)
create table if not exists float_banners (
  slot smallint primary key check (slot between 1 and 4),
  title text not null,
  subtitle text,
  image_url text,
  cta_label text,
  cta_href text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into float_banners (slot, title, subtitle, cta_label, cta_href, is_active) values
  (1, 'Instant delivery', 'Kode masuk otomatis setelah bayar', 'Belanja', '#produk', true),
  (2, 'Escrow aman', 'Dana dilindungi sampai order selesai', 'Pelajari', '/support', true),
  (3, 'Produk resmi', 'Listing terverifikasi & transparan', 'Katalog', '#produk', true),
  (4, 'Promo aktif', 'Cek penawaran spesial minggu ini', 'Lihat promo', '/promo', true)
on conflict (slot) do nothing;

alter table float_banners enable row level security;

drop policy if exists "float_banners: public read active" on float_banners;
create policy "float_banners: public read active" on float_banners
  for select using (is_active = true);

-- Admin may need to read inactive slots for editing via service role (bypasses RLS).
