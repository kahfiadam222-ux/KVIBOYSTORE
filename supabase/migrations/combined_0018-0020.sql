-- ============================================================
-- kviboystore — gabungan migrations 0018 + 0019 + 0020
-- Aman dijalankan berulang (idempotent). Jalankan sekaligus di
-- Supabase → SQL Editor → Run.
-- (0017 sidebar_categories sudah dijalankan sebelumnya)
-- ============================================================

-- ---------- 0018: partnership_settings (CMS halaman partner) ----------
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

-- ---------- 0019: partner_logos (grid logo partner) ----------
create table if not exists partner_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  partner_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table partner_logos enable row level security;

drop policy if exists "partner_logos: public read" on partner_logos;
create policy "partner_logos: public read" on partner_logos
  for select using (true);

-- ---------- 0020: restock aman (jangan aktifkan ulang listing yg sengaja dimatikan) ----------
create or replace function increment_listing_stock(p_listing_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  prev_count integer;
begin
  select stock_count into prev_count
  from listings
  where id = p_listing_id
  for update;

  if prev_count is null then
    return;
  end if;

  update listings
  set
    stock_count = stock_count + 1,
    is_active = case
      when prev_count = 0 then true
      else is_active
    end
  where id = p_listing_id;
end;
$$;
