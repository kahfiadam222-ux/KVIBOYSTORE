export type StorefrontHeroContent = {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  description: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

export type FloatBanner = {
  slot: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isActive: boolean;
};

export const DEFAULT_HERO: StorefrontHeroContent = {
  eyebrow: "kviboystore",
  title: "Langganan digital",
  titleHighlight: "yang rapi dan cepat",
  description:
    "Marketplace lisensi dan langganan digital — checkout cepat, pengiriman instan, dan pengalaman belanja yang modern.",
  ctaPrimaryLabel: "Jelajahi katalog",
  ctaPrimaryHref: "#produk",
  ctaSecondaryLabel: "Lihat promo",
  ctaSecondaryHref: "/promo",
};

export const DEFAULT_FLOAT_BANNERS: FloatBanner[] = [
  {
    slot: 1,
    title: "Instant delivery",
    subtitle: "Kode masuk otomatis setelah bayar",
    imageUrl: null,
    ctaLabel: "Belanja",
    ctaHref: "#produk",
    isActive: true,
  },
  {
    slot: 2,
    title: "Escrow aman",
    subtitle: "Dana dilindungi sampai order selesai",
    imageUrl: null,
    ctaLabel: "Pelajari",
    ctaHref: "/support",
    isActive: true,
  },
  {
    slot: 3,
    title: "Produk resmi",
    subtitle: "Listing terverifikasi & transparan",
    imageUrl: null,
    ctaLabel: "Katalog",
    ctaHref: "#produk",
    isActive: true,
  },
  {
    slot: 4,
    title: "Promo aktif",
    subtitle: "Cek penawaran spesial minggu ini",
    imageUrl: null,
    ctaLabel: "Lihat promo",
    ctaHref: "/promo",
    isActive: true,
  },
];
