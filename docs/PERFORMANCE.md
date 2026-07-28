<!-- Performance Optimization Guide untuk Kviboystore -->

# Performance Checklist

## 1. Image Optimization

### Lazy Loading
```html
<img 
  src="placeholder.jpg" 
  data-src="real-image.jpg"
  loading="lazy"
  alt="Product"
/>
```

Script: `image-optimization.js` sudah tersedia.

### Responsive Images
```html
<picture>
  <source media="(max-width: 640px)" srcset="image-400w.jpg">
  <source media="(max-width: 1024px)" srcset="image-800w.jpg">
  <img src="image-1200w.jpg" alt="Product">
</picture>
```

### WebP Format
- Gunakan WebP untuk modern browsers
- Fallback ke JPEG untuk older browsers
- Hemat ~30% bandwidth

## 2. Code Splitting

### Route-based
```javascript
// Next.js automatic per-route splitting
// Setiap halaman load code sendiri-sendiri
```

### Component-based
```javascript
// Dynamic import untuk heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

## 3. Caching Strategies

### Browser Cache
```
Cache-Control: public, max-age=31536000
// Static assets (1 tahun)

Cache-Control: public, max-age=3600
// HTML pages (1 jam)

Cache-Control: private, max-age=86400
// User data (1 hari)
```

### CDN Caching
- Setup Cloudflare / AWS CloudFront
- Cache images, CSS, JS globally
- Auto-purge on deploy

### Database Query Cache
```javascript
// Redis caching untuk frequent queries
const products = await redis.get('products:latest');
if (!products) {
  const data = await db.query('SELECT...');
  await redis.set('products:latest', JSON.stringify(data), 'EX', 3600);
}
```

## 4. Database Optimization

### Indexes
```sql
-- Pada kolom yang sering di-query
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_listings_active ON listings(is_active, stock_count);
```

### Connection Pooling
```
Supabase → Settings → Database → Connection Pool
Min: 10, Max: 20
```

### Query Optimization
```sql
-- Hindari N+1 queries
SELECT orders.*, products.title 
FROM orders 
JOIN products ON orders.product_id = products.id
-- vs SELECT orders; SELECT products WHERE id IN (...)
```

## 5. Frontend Performance

### Bundle Size
```bash
npm run build
# Check .next/static/chunks/*.js
# Target: < 200KB per route
```

### Critical CSS
```html
<!-- Inline critical CSS di <head> -->
<style>
  /* Hero section styles */
</style>
<!-- Non-critical CSS async-load -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### Font Loading
```css
@font-face {
  font-family: 'Custom';
  font-display: swap; /* Show fallback immediately */
  src: url('font.woff2') format('woff2');
}
```

## 6. Xendit API Optimization

### Rate Limiting
```javascript
// Cache payment method list
const paymentMethods = await cache.get('xendit:methods');
if (!paymentMethods) {
  const methods = await xendit.paymentMethods.list();
  await cache.set('xendit:methods', methods, 3600); // 1 hour
}
```

### Batch Requests
```javascript
// Batch multiple orders update
const updates = orders.map(o => ({
  id: o.id,
  state: 'completed'
}));
await db.from('orders').upsert(updates);
```

## 7. Monitoring & Alerts

### Web Vitals
```javascript
// Google Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => console.log(metric)); // Layout Shift
getFID(metric => console.log(metric)); // Interactivity
getLCP(metric => console.log(metric)); // Loading
```

### Error Tracking
```javascript
// Sentry integration
Sentry.captureException(error);
```

### Performance Monitoring
```javascript
// Server timing
performance.mark('db-query-start');
const data = await db.query();
performance.mark('db-query-end');
performance.measure('db-query', 'db-query-start', 'db-query-end');
```

## 8. Deployment Optimization

### Vercel Settings
- ✅ Auto-optimize images
- ✅ Enable compression (gzip/brotli)
- ✅ Setup edge caching
- ✅ Enable analytics

### Environment
```bash
# Production
NODE_ENV=production
# Disables dev tools, enables optimizations
```

## Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Google PageSpeed |
| FID | < 100ms | Web Vitals |
| CLS | < 0.1 | Web Vitals |
| TTFB | < 600ms | Lighthouse |
| Bundle | < 200KB | webpack-bundle-analyzer |

## Checklist Sebelum Production

- [ ] Images optimized (WebP, responsive sizes)
- [ ] Lazy loading enabled
- [ ] CSS critical inline, non-critical async
- [ ] JS code-split by route
- [ ] Database indexes created
- [ ] Connection pooling enabled
- [ ] CDN configured
- [ ] Caching headers set
- [ ] Web Vitals < targets
- [ ] Load testing passed (1000 concurrent)
- [ ] Error tracking setup
- [ ] Monitoring alerts active
