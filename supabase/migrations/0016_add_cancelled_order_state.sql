-- Allow unpaid / abandoned checkouts to leave the state machine cleanly.
-- Used when a Xendit invoice expires/fails, or when checkout fails after stock claim.
alter type order_state add value if not exists 'cancelled';
