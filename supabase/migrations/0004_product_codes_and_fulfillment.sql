-- Inventory of individual redeem/license codes for platform-owned Tier 1 products.
-- One row is claimed per paid order, atomically, so two simultaneous buyers never get the same code.
create table product_codes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  code text not null,
  is_used boolean not null default false,
  order_id uuid references orders(id),
  created_at timestamptz not null default now()
);

create index idx_product_codes_available on product_codes(product_id) where not is_used;

alter table product_codes enable row level security;
-- No client-facing policy: only the service role (webhook/fulfillment code) touches this table.

-- Atomically claims one unused code so concurrent buyers of the same product
-- never receive the same code (SKIP LOCKED lets concurrent calls each grab a
-- different row instead of blocking on each other).
create function claim_product_code(p_product_id uuid, p_order_id uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  claimed_code text;
begin
  update product_codes
  set is_used = true, order_id = p_order_id
  where id = (
    select id from product_codes
    where product_id = p_product_id and not is_used
    limit 1
    for update skip locked
  )
  returning code into claimed_code;

  return claimed_code;
end;
$$;

-- Sample dev/test inventory so the instant-delivery flow can be exercised end-to-end.
insert into product_codes (product_id, code)
select p.id, pt.name || '-' || upper(substr(md5(random()::text || n::text), 1, 10))
from products p
join product_types pt on pt.id = p.product_type_id
cross join generate_series(1, 5) as n
where p.is_platform_owned;
