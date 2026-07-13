-- Distinguishes the horizontal hero carousel from the new vertical (slide
-- up/down) side banner; both are managed from the same admin banners page.
alter table homepage_banners
  add column layout text not null default 'horizontal'
  check (layout in ('horizontal', 'vertical'));
