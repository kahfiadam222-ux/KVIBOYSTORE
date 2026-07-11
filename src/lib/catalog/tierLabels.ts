import type { RiskTier } from "@/types/catalog";

// Buyer-facing labels never say "risk tier" — they describe delivery certainty,
// which is what the label is actually protecting trust around.
export const tierLabels: Record<RiskTier, { label: string; description: string }> = {
  tier_1: {
    label: "Instant Delivery",
    description: "Kode aktivasi resmi, terkirim otomatis setelah pembayaran dikonfirmasi.",
  },
  tier_2: {
    label: "Verified Delivery",
    description: "Akun pribadi, dikirim langsung oleh penjual terverifikasi.",
  },
  tier_3: {
    label: "Shared Plan",
    description: "Slot dalam paket berbagi, dengan penggantian otomatis jika terjadi gangguan.",
  },
};
