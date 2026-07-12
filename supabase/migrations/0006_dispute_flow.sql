-- Needed to call Xendit's Refund API, which refunds against the original invoice.
alter table orders add column xendit_invoice_id text;
