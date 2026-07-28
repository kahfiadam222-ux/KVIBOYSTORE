# Kviboystore Deployment Guide

## Pre-deployment Checklist

### 1. Environment Variables
Set these on your hosting platform (Vercel, Netlify, etc):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_...
XENDIT_SECRET_KEY=xnd_...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
CRON_SECRET=your-random-secret-key
```

### 2. Database Setup
Run migrations in Supabase SQL Editor:
```sql
-- Run combined_run_once.sql from migrations folder
```

### 3. Xendit Configuration
- Create account at xendit.co
- Get Public Key & Secret Key
- Test with sandbox credentials first
- Enable webhook: POST /api/webhooks/xendit

### 4. Authentication
- Supabase Auth enabled (default)
- Email confirmation optional but recommended
- Google/GitHub OAuth optional

### 5. Domain & CORS
Configure in Supabase:
- Auth → URL Configuration
- Add your domain to allowed redirect URLs
- Example: `https://yourdomain.com/auth/callback`

## Deployment Steps

### Option A: Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Settings
3. Deploy automatically on push
4. Custom domain setup in Settings

### Option B: Netlify
1. Connect GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add env vars in Site Settings
5. Deploy

### Option C: Self-hosted
1. `npm run build`
2. `npm start`
3. Point domain to server IP
4. Setup SSL/TLS (Let's Encrypt)

## Post-deployment

### 1. Test Flows
- [ ] Sign up → email verification
- [ ] Login with credentials
- [ ] Browse products (home page)
- [ ] Add to cart → checkout
- [ ] Payment with Xendit
- [ ] View order history
- [ ] Update profile

### 2. Monitor
- Check Supabase logs for errors
- Monitor Xendit webhook deliveries
- Setup error tracking (Sentry optional)

### 3. Performance
- Enable Supabase caching
- Optimize images
- Setup CDN for static assets

## Troubleshooting

### "Supabase env not configured"
→ Check NEXT_PUBLIC_SUPABASE_URL & ANON_KEY are set

### Xendit payment fails
→ Verify SECRET_KEY & PUBLIC_KEY match your Xendit account
→ Check webhook endpoint: `/api/webhooks/xendit`

### RLS policies block requests
→ Verify auth token is valid
→ Check user has appropriate role (buyer/seller/admin)

### Stock overselling
→ Ensure `decrement_listing_stock` RPC is callable
→ Check migration 0014 is applied

## Scaling Tips

1. **Database**: Enable connection pooling in Supabase
2. **Storage**: Use Supabase Storage for product images
3. **Cache**: Add Redis for session management (optional)
4. **CDN**: Setup Cloudflare for global distribution
5. **Analytics**: Integrate Mixpanel or Segment

## Security Checklist

- [ ] HTTPS enabled (auto on Vercel/Netlify)
- [ ] CSP headers configured
- [ ] Rate limiting on auth/checkout
- [ ] Webhook signature validation
- [ ] Sensitive keys in env vars (never git commit)
- [ ] RLS policies enforced
- [ ] Regular security audits

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Xendit Docs: https://docs.xendit.co
- Next.js Deployment: https://nextjs.org/docs/deployment
