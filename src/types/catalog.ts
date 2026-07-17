export type RiskTier = "tier_1" | "tier_2" | "tier_3";

export type DeliveryMethod =
  | "shared_account"
  | "private_account"
  | "invite_family"
  | "voucher"
  | "redeem_code"
  | "license_key"
  | "lifetime_license";

export interface StorefrontListing {
  listingId: string;
  productId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  currency: string;
  stockCount: number;
  productTypeName: string;
  riskTier: RiskTier;
  deliveryMethod: DeliveryMethod;
  isPlatformOwned: boolean;
  sellerReputation: number | null;
}
