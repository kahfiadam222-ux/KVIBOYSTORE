# Backend Integration Guide

## Environment Setup

1. **Copy `.env.local.example` ke `.env.local`:**
```bash
cp .env.local.example .env.local
```

2. **Fill Supabase credentials:**
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL (Settings → API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon Key (Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` — Service Role Key (Settings → API, restricted)

3. **Fill Xendit credentials:**
- `NEXT_PUBLIC_XENDIT_PUBLIC_KEY` — From Xendit Dashboard
- `XENDIT_SECRET_KEY` — Secret Key (keep safe)

4. **Site URL & Cron:**
- `NEXT_PUBLIC_SITE_URL` — Your domain (e.g., `https://kviboystore.com`)
- `CRON_SECRET` — Random string untuk auto-confirm webhook

## Database Setup

Run migrations di Supabase SQL Editor:
```bash
supabase/migrations/combined_run_once.sql
```

Tables created:
- `profiles` — Users
- `products`, `listings` — Catalog
- `orders`, `order_state_transitions` — Order tracking
- `escrow_ledger` — Payment holding
- `disputes`, `deposit_ledger` — Dispute resolution

## API Endpoints

### Products (Public)
```
GET /rest/v1/listings?select=...&is_active=eq.true&stock_count=gt.0
```

### Checkout
```
POST /api/(storefront)/checkout
→ Creates order → Calls Xendit → Redirects to payment
```

### Webhooks
```
POST /api/webhooks/xendit
→ Listens for payment updates
→ Updates order state
```

### Cron Jobs
```
POST /api/cron/auto-confirm?secret=...
→ Runs daily
→ Auto-confirms delivered orders after 14 days
```

## Frontend Integration Status

✅ **Home Page** — Fetches products from Supabase
⏳ **Cart** — Ready for localStorage + checkout
⏳ **Checkout** — Ready to integrate Xendit
⏳ **Orders** — Ready for order tracking
⏳ **Profile** — Ready for user data
⏳ **Seller Dashboard** — Ready for seller management

## Testing Locally

1. Run dev server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Check console for API logs

4. Test with mock product data (fallback)

## Deployment (Vercel)

1. Add env vars to Vercel project settings
2. Deploy: `git push`
3. Vercel auto-builds & deploys

## Security Notes

- RLS policies block unauthorized access
- Rate limiting on checkout/login
- Xendit webhook signature validation
- Stock decrement is atomic (no overselling)
