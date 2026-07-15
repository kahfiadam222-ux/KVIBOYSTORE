-- Add Slide 2 CMS editable columns to storefront_hero table
alter table storefront_hero add column if not exists slide2_title text not null default 'Kviboystore';
alter table storefront_hero add column if not exists slide2_description text not null default 'Template e-commerce workspace termodulasi dengan komponen yang dapat diperbarui dari CMS.';
alter table storefront_hero add column if not exists slide2_cta_label text not null default 'Discover';
alter table storefront_hero add column if not exists slide2_cta_href text not null default '#produk';
alter table storefront_hero add column if not exists slide2_promo_text text not null default 'PROMO DISKON 10% KHUSUS PENGGUNA BARU';
