-- Migration: Create partnership_settings table for dynamic CMS content on the partnership page

create table if not exists partnership_settings (
  id integer primary key default 1 check (id = 1),
  eyebrow text not null default 'Kviboystore Partnership',
  title text not null default 'Tumbuh Bersama Sebagai',
  title_highlight text not null default 'Partner Resmi Kviboystore',
  description text not null default 'Hubungkan produk digital Anda dengan ribuan kreator, profesional, dan tech-enthusiast. Nikmati infrastruktur distribusi lisensi otomatis dan gerbang pembayaran lokal terlengkap.',
  email text not null default 'partner@kviboystore.com',
  cta_primary_label text not null default 'Mulai Jadi Seller',
  cta_primary_href text not null default '/sell',
  cta_secondary_label text not null default 'Hubungi Tim Partnership',
  updated_at timestamptz not null default now()
);

insert into partnership_settings (id) values (1)
on conflict (id) do nothing;

alter table partnership_settings enable row level security;

drop policy if exists "partnership_settings: public read" on partnership_settings;
create policy "partnership_settings: public read" on partnership_settings
  for select using (true);
