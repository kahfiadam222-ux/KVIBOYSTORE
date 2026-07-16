-- CMS for the sidebar "Kategori" section (admin-editable: name, logo, add/remove).

create table if not exists sidebar_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null default '/',
  -- Lucide icon name used as fallback when no uploaded logo (icon_url) is set.
  icon text not null default 'Tag',
  -- Optional uploaded logo (stored as a compressed data URL, like float_banners.image_url).
  icon_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Seed with the categories that were previously hardcoded in the sidebar.
insert into sidebar_categories (label, href, icon, sort_order) values
  ('Netflix',       '/?q=netflix',   'Tv',       0),
  ('Spotify',       '/?q=spotify',   'Music2',   1),
  ('Canva Pro',     '/?q=canva',     'Palette',  2),
  ('ChatGPT Plus',  '/?q=chatgpt',   'Bot',      3),
  ('VPN Premium',   '/?q=vpn',       'Shield',   4),
  ('Microsoft 365', '/?q=microsoft', 'FileText', 5)
on conflict do nothing;

alter table sidebar_categories enable row level security;

drop policy if exists "sidebar_categories: public read active" on sidebar_categories;
create policy "sidebar_categories: public read active" on sidebar_categories
  for select using (is_active = true);

-- Admin writes go through the service-role client (bypasses RLS).
