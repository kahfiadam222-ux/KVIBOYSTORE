-- ============================================================================
-- STEP 0: cleanup any leftover types from a previously failed run
-- ============================================================================
drop type if exists user_role cascade;
drop type if exists kyc_status cascade;
drop type if exists product_delivery_method cascade;
drop type if exists risk_tier cascade;
drop type if exists verification_status cascade;
drop type if exists order_state cascade;
drop type if exists transition_actor cascade;
drop type if exists escrow_entry_type cascade;
drop type if exists deposit_entry_type cascade;
drop type if exists ledger_direction cascade;
drop type if exists dispute_status cascade;
drop type if exists dispute_opened_by cascade;
drop table if exists disputes cascade;
drop table if exists deposit_ledger cascade;
drop table if exists deliveries cascade;
drop table if exists escrow_ledger cascade;
drop table if exists order_state_transitions cascade;
drop table if exists orders cascade;
drop table if exists listings cascade;
drop table if exists products cascade;
drop table if exists product_types cascade;
drop table if exists social_proof_scores cascade;
drop table if exists seller_verifications cascade;
drop table if exists kyc_documents cascade;
drop table if exists seller_profiles cascade;
drop table if exists profiles cascade;
drop function if exists public.handle_new_user cascade;

-- ============================================================================
-- STEP 1: 0001_init_core_schema.sql
-- ============================================================================

-- KVIBOYSTORE core schema: profiles, catalog, escrow ledger, order state machine,
-- seller verification queue, disputes, deposit ledger.
-- Ledgers (escrow_ledger, deposit_ledger, order_state_transitions) are append-only:
-- application code must only INSERT into them, never UPDATE/DELETE, so balances are
-- always derivable by summing rows rather than trusted from a mutable field.

create extension if not exists "pgcrypto";

create type user_role as enum ('buyer', 'seller', 'admin');
create type kyc_status as enum ('unverified', 'pending', 'verified', 'rejected');

create type product_delivery_method as enum (
  'shared_account', 'private_account', 'invite_family',
  'voucher', 'redeem_code', 'license_key', 'lifetime_license'
);
create type risk_tier as enum ('tier_1', 'tier_2', 'tier_3');

create type verification_status as enum ('pending_kyc', 'pending_review', 'approved', 'rejected');

create type order_state as enum (
  'created', 'payment_held', 'awaiting_delivery', 'delivered',
  'buyer_confirmed', 'payout_released', 'completed',
  'buyer_disputed', 'delivery_timeout', 'auto_escalated',
  'under_review', 'refunded'
);
create type transition_actor as enum ('system', 'buyer', 'seller', 'admin');

create type escrow_entry_type as enum (
  'payment_held', 'payout_released', 'refund_issued'
);
create type deposit_entry_type as enum (
  'collected', 'forfeited_partial', 'forfeited_full', 'restored'
);
create type ledger_direction as enum ('debit', 'credit');

create type dispute_status as enum ('open', 'under_review', 'resolved');
create type dispute_opened_by as enum ('buyer', 'seller');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  phone text,
  role user_role not null default 'buyer',
  kyc_status kyc_status not null default 'unverified',
  created_at timestamptz not null default now()
);

create table seller_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  legal_name text not null,
  ktp_number_hash text not null,
  verification_status verification_status not null default 'pending_kyc',
  reputation_score numeric not null default 0,
  active_since timestamptz,
  suspended_at timestamptz,
  suspension_reason text
);

create table kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('ktp', 'selfie')),
  storage_ref text not null,
  verified_by text,
  verification_result text,
  submitted_at timestamptz not null default now()
);

create table seller_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status verification_status not null default 'pending_kyc',
  assigned_reviewer_id uuid references profiles(id),
  submitted_at timestamptz not null default now(),
  sla_deadline timestamptz not null default (now() + interval '48 hours'),
  decision_reason text,
  decided_at timestamptz
);

create table social_proof_scores (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references seller_profiles(user_id) on delete cascade,
  criterion text not null,
  score numeric not null,
  reviewer_id uuid references profiles(id),
  notes text,
  scored_at timestamptz not null default now()
);

create table product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  risk_tier risk_tier not null,
  delivery_method product_delivery_method not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references seller_profiles(user_id) on delete cascade,
  product_type_id uuid not null references product_types(id),
  title text not null,
  description text,
  is_platform_owned boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'suspended')),
  created_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  price numeric not null check (price >= 0),
  currency text not null default 'IDR',
  stock_count integer not null default 0 check (stock_count >= 0),
  is_active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id),
  listing_id uuid not null references listings(id),
  seller_id uuid not null references seller_profiles(user_id),
  is_platform_owned boolean not null default false,
  amount numeric not null check (amount >= 0),
  currency text not null default 'IDR',
  state order_state not null default 'created',
  delivery_deadline timestamptz,
  created_at timestamptz not null default now()
);

create table order_state_transitions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_state order_state,
  to_state order_state not null,
  actor_type transition_actor not null,
  actor_id uuid references profiles(id),
  reason text,
  created_at timestamptz not null default now()
);

create table escrow_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  entry_type escrow_entry_type not null,
  direction ledger_direction not null,
  amount numeric not null check (amount >= 0),
  reference_disbursement_id text,
  created_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  payload_encrypted text not null,
  delivery_method product_delivery_method not null,
  delivered_at timestamptz,
  reveal_expires_at timestamptz,
  buyer_confirmed_at timestamptz
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  opened_by dispute_opened_by not null,
  reason text not null,
  evidence_refs text[],
  status dispute_status not null default 'open',
  resolution text,
  resolved_by_admin_id uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table deposit_ledger (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references seller_profiles(user_id) on delete cascade,
  entry_type deposit_entry_type not null,
  amount numeric not null check (amount >= 0),
  related_dispute_id uuid references disputes(id),
  appeal_status text check (appeal_status in ('pending_appeal', 'final')),
  appeal_deadline timestamptz,
  created_at timestamptz not null default now()
);

create index idx_orders_buyer on orders(buyer_id);
create index idx_orders_seller on orders(seller_id);
create index idx_orders_state on orders(state);
create index idx_order_transitions_order on order_state_transitions(order_id);
create index idx_escrow_ledger_order on escrow_ledger(order_id);
create index idx_deposit_ledger_seller on deposit_ledger(seller_id);
create index idx_disputes_status on disputes(status);
create index idx_seller_verifications_status on seller_verifications(status);
create index idx_listings_product on listings(product_id);
create index idx_products_seller on products(seller_id);

alter table profiles enable row level security;
alter table seller_profiles enable row level security;
alter table kyc_documents enable row level security;
alter table seller_verifications enable row level security;
alter table social_proof_scores enable row level security;
alter table product_types enable row level security;
alter table products enable row level security;
alter table listings enable row level security;
alter table orders enable row level security;
alter table order_state_transitions enable row level security;
alter table escrow_ledger enable row level security;
alter table deliveries enable row level security;
alter table disputes enable row level security;
alter table deposit_ledger enable row level security;

create policy "profiles: read own" on profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

create policy "seller_profiles: read own" on seller_profiles
  for select using (auth.uid() = user_id);

create policy "product_types: public read" on product_types
  for select using (true);

create policy "products: public read active" on products
  for select using (status = 'active');
create policy "products: seller manage own" on products
  for all using (auth.uid() = seller_id);

create policy "listings: public read active" on listings
  for select using (
    is_active and exists (
      select 1 from products p where p.id = listings.product_id and p.status = 'active'
    )
  );
create policy "listings: seller manage own" on listings
  for all using (
    exists (select 1 from products p where p.id = listings.product_id and p.seller_id = auth.uid())
  );

create policy "orders: parties read own" on orders
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "deliveries: parties read own" on deliveries
  for select using (
    exists (
      select 1 from orders o where o.id = deliveries.order_id
      and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

create policy "disputes: parties read own" on disputes
  for select using (
    exists (
      select 1 from orders o where o.id = disputes.order_id
      and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );
create policy "disputes: buyer or seller can open" on disputes
  for insert with check (
    exists (
      select 1 from orders o where o.id = disputes.order_id
      and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

-- ============================================================================
-- STEP 2: 0002_profile_trigger_and_seed.sql
-- ============================================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into product_types (name, risk_tier, delivery_method) values
  ('Canva Pro', 'tier_1', 'redeem_code'),
  ('CapCut Pro', 'tier_1', 'redeem_code'),
  ('VPN', 'tier_1', 'license_key'),
  ('Microsoft 365', 'tier_1', 'license_key'),
  ('GitHub Copilot', 'tier_1', 'voucher'),
  ('Cursor', 'tier_1', 'license_key');

-- ============================================================================
-- STEP 3: 0003_platform_owned_seed.sql
-- ============================================================================

alter table products alter column seller_id drop not null;
alter table products add constraint products_seller_pairing
  check ((is_platform_owned and seller_id is null) or (not is_platform_owned and seller_id is not null));

alter table orders alter column seller_id drop not null;
alter table orders add constraint orders_seller_pairing
  check ((is_platform_owned and seller_id is null) or (not is_platform_owned and seller_id is not null));

insert into products (product_type_id, title, description, is_platform_owned, status)
select id, name || ' - Kode Aktivasi Resmi', 'Dikirim otomatis setelah pembayaran dikonfirmasi.', true, 'active'
from product_types
where risk_tier = 'tier_1';

insert into listings (product_id, price, stock_count, is_active)
select p.id,
  case pt.name
    when 'Canva Pro' then 49000
    when 'CapCut Pro' then 39000
    when 'VPN' then 25000
    when 'Microsoft 365' then 199000
    when 'GitHub Copilot' then 89000
    when 'Cursor' then 149000
  end,
  100,
  true
from products p
join product_types pt on pt.id = p.product_type_id
where p.is_platform_owned;

-- ============================================================================
-- STEP 4: force PostgREST to pick up the new schema immediately
-- ============================================================================
NOTIFY pgrst, 'reload schema';
