-- Product photo, shown in storefront cards instead of a placeholder gradient.
alter table products add column image_url text;

-- Admin-managed homepage promo banners (the rotating hero carousel).
create table homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  cta_label text,
  cta_href text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table homepage_banners enable row level security;

create policy "homepage_banners: public read active" on homepage_banners
  for select using (is_active);

-- No client-facing write policy — banners are managed via the admin client only.
