-- Migration: Create partner_logos table for partner grid display on the partnership page

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
