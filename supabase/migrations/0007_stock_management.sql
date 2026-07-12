-- Atomically claims one unit of stock so concurrent buyers of a low-stock
-- listing can't both succeed past the last unit (classic overselling race).
-- Auto-deactivates the listing once stock hits zero so it drops off the
-- storefront without a separate cron/cleanup step.
create function decrement_listing_stock(p_listing_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  new_count integer;
begin
  update listings
  set stock_count = stock_count - 1
  where id = p_listing_id and is_active and stock_count > 0
  returning stock_count into new_count;

  if new_count is null then
    return false;
  end if;

  if new_count = 0 then
    update listings set is_active = false where id = p_listing_id;
  end if;

  return true;
end;
$$;
