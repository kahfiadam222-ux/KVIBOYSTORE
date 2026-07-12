import type { RiskTier, StorefrontListing } from "@/types/catalog";

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

// Actual delivery certainty depends on who fulfills the order, not just the
// product's nominal risk tier — a seller-listed "Tier 1" item still goes
// through manual delivery, so it can't honestly claim "Instant Delivery".
export function getDeliveryLabel(listing: Pick<StorefrontListing, "riskTier" | "isPlatformOwned">) {
  if (!listing.isPlatformOwned) return tierLabels.tier_2;
  return tierLabels[listing.riskTier];
}
