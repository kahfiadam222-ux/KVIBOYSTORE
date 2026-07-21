-- Restoring stock must not re-activate a listing the seller deliberately turned off.
-- Only auto-reactivate when stock was zero (sold out) or listing was inactive solely due to stock.
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
    -- Re-activate only when we are recovering from empty stock (oversell/cancel path).
    -- If seller set is_active=false while stock was already > 0, leave it inactive.
    is_active = case
      when prev_count = 0 then true
      else is_active
    end
  where id = p_listing_id;
end;
$$;
