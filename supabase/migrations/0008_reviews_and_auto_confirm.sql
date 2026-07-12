-- Buyer reviews, tied 1:1 to a completed order so a buyer can't review twice
-- or review an order they didn't place.
create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  seller_id uuid references seller_profiles(user_id) on delete cascade,
  buyer_id uuid not null references profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

create policy "reviews: public read" on reviews
  for select using (true);

create policy "reviews: buyer can review own completed order" on reviews
  for insert with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from orders o
      where o.id = order_id and o.buyer_id = auth.uid() and o.state = 'completed'
    )
  );

-- Recomputes a seller's reputation_score as the plain average of their review
-- ratings — simple and auditable, recalculated from source rather than
-- incrementally maintained so it can never drift out of sync.
create function refresh_seller_reputation(p_seller_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update seller_profiles
  set reputation_score = coalesce(
    (select avg(rating)::numeric(3,2) from reviews where seller_id = p_seller_id),
    0
  )
  where user_id = p_seller_id;
end;
$$;
