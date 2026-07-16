-- Atomically returns one unit of stock and re-activates the listing if it was deactivated.
create or replace function increment_listing_stock(p_listing_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update listings
  set stock_count = stock_count + 1,
      is_active = true
  where id = p_listing_id;
end;
$$;
