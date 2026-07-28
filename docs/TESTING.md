# API Testing Guide for Kviboystore

## Setup

### 1. Environment
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
XENDIT_SECRET_KEY=xnd_...
```

### 2. Test Tools
- **Postman** — API testing & debugging
- **cURL** — command-line requests
- **Jest** — unit tests
- **Playwright** — E2E tests

## Test Cases

### Authentication

#### POST /auth/v1/signup
```bash
curl -X POST https://your-project.supabase.co/auth/v1/signup \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Expected:** 200 OK, returns user + session

#### POST /auth/v1/token
```bash
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Expected:** 200 OK, returns access_token

### Products

#### GET /rest/v1/listings
```bash
curl "https://your-project.supabase.co/rest/v1/listings?select=*&is_active=eq.true&stock_count=gt.0" \
  -H "apikey: $ANON_KEY"
```

**Expected:** 200 OK, returns active listings with stock

#### POST /rest/v1/products (Seller)
```bash
curl -X POST https://your-project.supabase.co/rest/v1/products \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seller_id": "user-uuid",
    "product_type_id": "type-uuid",
    "title": "Test Product",
    "description": "Test description"
  }'
```

**Expected:** 201 Created

### Orders & Payment

#### POST /api/checkout (Mock)
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "items": [{"id": "listing-uuid"}],
    "customer": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+62123456789"
    },
    "paymentMethod": "transfer"
  }'
```

**Expected:** 200 OK, returns paymentUrl

#### Xendit Webhook (Test)
```bash
curl -X POST http://localhost:3000/api/webhooks/xendit \
  -H "Content-Type: application/json" \
  -H "x-callback-token: $CRON_SECRET" \
  -d '{
    "id": "invoice-uuid",
    "status": "PAID",
    "external_id": "order-uuid",
    "amount": 500000
  }'
```

**Expected:** 200 OK, order state updated

### Orders

#### GET /rest/v1/orders (User)
```bash
curl "https://your-project.supabase.co/rest/v1/orders?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected:** 200 OK, returns user's orders only (RLS enforced)

#### GET /rest/v1/orders?id=eq.order-uuid
```bash
curl "https://your-project.supabase.co/rest/v1/orders?id=eq.order-uuid&select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected:** 200 OK, returns order detail if user is buyer/seller

### Profile

#### GET /rest/v1/profiles
```bash
curl "https://your-project.supabase.co/rest/v1/profiles?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected:** 200 OK, returns only user's profile (RLS)

#### PATCH /rest/v1/profiles
```bash
curl -X PATCH "https://your-project.supabase.co/rest/v1/profiles?id=eq.user-uuid" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+62123456789",
    "display_name": "New Name"
  }'
```

**Expected:** 200 OK

## Error Scenarios

### Invalid Auth Token
```bash
curl "https://your-project.supabase.co/rest/v1/orders" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer invalid-token"
```

**Expected:** 401 Unauthorized

### RLS Policy Violation (Accessing other user's order)
```bash
curl "https://your-project.supabase.co/rest/v1/orders?id=eq.other-user-order" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected:** 200 OK but empty result (silently filtered by RLS)

### Rate Limiting (Checkout)
```bash
# Multiple requests within 5 minutes
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/checkout ...
done
```

**Expected:** 429 Too Many Requests after 10th request

### Stock Exhaustion
```bash
# Attempt to checkout item with 0 stock
```

**Expected:** Error: "Stok produk sudah habis"

## Performance Testing

### Load Test (1000 concurrent users viewing products)
```bash
# Using Apache Bench
ab -n 10000 -c 1000 https://yourdomain.com/

# Expected: < 2s response time, < 5% errors
```

### Database Query Performance
```bash
-- Check slow queries in Supabase
SELECT query_time, query
FROM pg_stat_statements
ORDER BY query_time DESC
LIMIT 10;
```

## Monitoring

### Key Metrics
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Xendit webhook delivery success rate
- Stock claim atomicity (overselling incidents)

### Sentry Error Tracking
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

## Checklist Before Production

- [ ] All endpoints tested with valid/invalid inputs
- [ ] RLS policies block unauthorized access
- [ ] Rate limiting prevents abuse
- [ ] Stock atomic operations verified (no overselling)
- [ ] Xendit webhook handles retries
- [ ] Payment timeout handling (14-day auto-confirm)
- [ ] Error messages don't leak sensitive info
- [ ] Database backups working
- [ ] Monitoring & alerting configured
- [ ] Load test passed (1000 concurrent users)
