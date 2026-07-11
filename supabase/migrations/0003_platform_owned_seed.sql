-- Platform-owned listings (is_platform_owned = true) have no external seller —
-- KVIBOYSTORE itself is the counterparty, so seller_id must be nullable here,
-- with a check enforcing the pairing (platform-owned <=> no seller_id).
alter table products alter column seller_id drop not null;
alter table products add constraint products_seller_pairing
  check ((is_platform_owned and seller_id is null) or (not is_platform_owned and seller_id is not null));

alter table orders alter column seller_id drop not null;
alter table orders add constraint orders_seller_pairing
  check ((is_platform_owned and seller_id is null) or (not is_platform_owned and seller_id is not null));

-- MVP launch catalog: platform-owned Tier 1 listings for the 6 seeded product types.
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
