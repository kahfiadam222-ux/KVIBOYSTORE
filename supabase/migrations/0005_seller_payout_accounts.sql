-- Seller's registered payout destination, used to release escrow funds via
-- Xendit Payout once a buyer confirms a non-platform-owned order.
alter table seller_profiles add column payout_channel_code text;
alter table seller_profiles add column payout_account_number text;
alter table seller_profiles add column payout_account_holder_name text;
