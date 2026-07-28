# Advanced Features Roadmap

## 1. Review & Rating System

### Schema
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  body TEXT,
  verified_purchase BOOLEAN DEFAULT true,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

### Features
- 1-5 star ratings
- Verified purchase badge
- Helpful voting
- Seller response to reviews
- Review moderation (spam/inappropriate)

## 2. Recommendation Engine

### Collaborative Filtering
```javascript
// Users who bought X also bought Y
async function getRecommendations(userId) {
  const userOrders = await db
    .from('orders')
    .select('product_id')
    .eq('buyer_id', userId);

  // Find similar buyers
  const similarBuyers = await db
    .rpc('find_similar_buyers', { p_user_id: userId });

  // Get products they bought but current user didn't
  const recommendations = await db
    .from('products')
    .select('*')
    .in('id', similarBuyers.product_ids)
    .not('id', 'in', userOrders.product_ids)
    .order('popularity', { ascending: false })
    .limit(10);

  return recommendations;
}
```

### Content-Based
```javascript
// Products similar to what user viewed/bought
async function getSimilarProducts(productId) {
  const product = await db.from('products').select('*').eq('id', productId).single();
  
  const similar = await db
    .from('products')
    .select('*')
    .eq('product_type_id', product.product_type_id)
    .neq('id', productId)
    .order('rating', { ascending: false })
    .limit(5);

  return similar;
}
```

## 3. Seller Features

### Bulk Product Upload
```csv
title,description,product_type,price,currency,stock_count
"Product 1","Description 1","Streaming Video",25000,"IDR",100
"Product 2","Description 2","Cloud Storage",350000,"IDR",50
```

```javascript
async function bulkUploadProducts(csvFile, sellerId) {
  const rows = parseCSV(csvFile);
  
  const products = rows.map(row => ({
    seller_id: sellerId,
    product_type_id: getTypeId(row.product_type),
    title: row.title,
    description: row.description,
    status: 'draft',
  }));

  const listings = rows.map((row, idx) => ({
    product_id: products[idx].id,
    price: row.price,
    currency: row.currency,
    stock_count: row.stock_count,
  }));

  await db.from('products').insert(products);
  await db.from('listings').insert(listings);
}
```

### Commission Tracking
```sql
CREATE TABLE seller_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(user_id),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL, -- e.g., 0.10 = 10%
  commission_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, released
  created_at TIMESTAMPTZ DEFAULT now()
);
```

```javascript
// Auto-calculate commission on order completion
async function calculateCommission(orderId) {
  const order = await db.from('orders').select('*').eq('id', orderId).single();
  const seller = await db.from('seller_profiles').select('commission_rate').eq('user_id', order.seller_id).single();
  
  const commissionAmount = order.amount * (seller.commission_rate || 0.10);
  
  await db.from('seller_commissions').insert({
    order_id: orderId,
    seller_id: order.seller_id,
    amount: order.amount,
    commission_amount: commissionAmount,
  });
}
```

### Payout Management
```sql
CREATE TABLE seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(user_id),
  amount NUMERIC NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES seller_bank_accounts(id),
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  xendit_disbursement_id VARCHAR(255),
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

## 4. Analytics Dashboard

### Metrics
```javascript
// Sales by day
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(amount) as revenue
FROM orders
WHERE seller_id = $1 AND created_at > now() - interval '30 days'
GROUP BY date
ORDER BY date;

// Top products
SELECT 
  p.title,
  COUNT(o.id) as sales,
  SUM(o.amount) as revenue
FROM orders o
JOIN listings l ON o.listing_id = l.id
JOIN products p ON l.product_id = p.id
WHERE p.seller_id = $1
GROUP BY p.id
ORDER BY sales DESC;

// Customer retention
SELECT 
  COUNT(DISTINCT buyer_id) as unique_buyers,
  COUNT(DISTINCT CASE WHEN created_at > now() - interval '7 days' THEN buyer_id END) as buyers_7d,
  COUNT(DISTINCT CASE WHEN created_at > now() - interval '30 days' THEN buyer_id END) as buyers_30d
FROM orders
WHERE seller_id = $1;
```

## 5. Wishlist Sharing

```javascript
// Generate shareable link
async function createWishlistShare(userId) {
  const shareToken = generateToken(32);
  
  await db.from('wishlist_shares').insert({
    user_id: userId,
    token: shareToken,
    expires_at: addDays(new Date(), 30),
  });

  return `https://kviboystore.com/wishlist/${shareToken}`;
}

// View shared wishlist
async function getSharedWishlist(token) {
  const share = await db
    .from('wishlist_shares')
    .select('user_id')
    .eq('token', token)
    .single();

  const wishlist = await db
    .from('wishlists')
    .select('product_id')
    .eq('user_id', share.user_id);

  return wishlist;
}
```

## 6. Gift Cards

```sql
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  issued_by UUID REFERENCES seller_profiles(user_id),
  purchased_by UUID NOT NULL REFERENCES profiles(id),
  recipient_email VARCHAR(255),
  message TEXT,
  balance NUMERIC NOT NULL,
  status TEXT DEFAULT 'active', -- active, redeemed, expired
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 year'),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 7. Subscription Products

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  frequency TEXT NOT NULL, -- monthly, yearly
  auto_renew BOOLEAN DEFAULT true,
  next_renewal_at TIMESTAMPTZ
);
```

## 8. Email Marketing

### Segmentation
```javascript
// Users who haven't purchased in 30 days
const dormantUsers = await db.rpc('find_dormant_users', {
  days: 30
});

// Send re-engagement email
await sendEmail(dormantUsers, 'Come back! 20% off waiting for you');
```

### Abandoned Cart Recovery
```javascript
// Track cart abandon
const cartAbandonments = await db.rpc('find_abandoned_carts', {
  hours: 24
});

// Send reminder with discount code
```

## 9. Compliance & KYC

### ID Verification
```sql
CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(user_id),
  id_type TEXT NOT NULL, -- ktp, passport
  id_number VARCHAR(255) NOT NULL,
  id_image_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT
);
```

## Implementation Priority

1. **Reviews & Ratings** — social proof critical for conversion
2. **Recommendation Engine** — increase AOV & engagement
3. **Seller Analytics** — retention & growth
4. **Bulk Upload** — seller onboarding
5. **Email Marketing** — user retention
6. **KYC** — compliance & trust
7. **Gift Cards** — new revenue stream
8. **Subscriptions** — recurring revenue

## Estimated Timeline

- Reviews: 2 weeks
- Recommendations: 3 weeks
- Seller Features: 4 weeks
- Analytics: 2 weeks
- Email: 1 week
- Total: 12 weeks (3 months)
