-- Auto-create a profiles row whenever a new auth.users row appears, so every
-- other table's profiles(id) foreign key is satisfied the moment someone signs up.
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

-- Seed Tier 1 (voucher/redeem/license key) product types — the MVP catalog scope.
insert into product_types (name, risk_tier, delivery_method) values
  ('Canva Pro', 'tier_1', 'redeem_code'),
  ('CapCut Pro', 'tier_1', 'redeem_code'),
  ('VPN', 'tier_1', 'license_key'),
  ('Microsoft 365', 'tier_1', 'license_key'),
  ('GitHub Copilot', 'tier_1', 'voucher'),
  ('Cursor', 'tier_1', 'license_key');
