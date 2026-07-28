# Production Deployment Checklist

## Pre-Deployment (1-2 weeks before)

### Code Quality
- [ ] All tests passing (unit + E2E)
- [ ] Code review completed (2+ approvals)
- [ ] No console errors/warnings
- [ ] ESLint passes
- [ ] TypeScript strict mode enabled
- [ ] Bundle size analyzed (< 500KB gzipped)

### Security
- [ ] Secrets not in code (use .env.local)
- [ ] API keys rotated
- [ ] CORS headers configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS prevention (CSP headers)
- [ ] CSRF tokens enabled
- [ ] HTTPS only enforced

### Database
- [ ] Schema migrations reviewed
- [ ] Indexes created for slow queries
- [ ] RLS policies tested
- [ ] Backups automated daily
- [ ] Connection pool configured
- [ ] Query performance < 200ms p95

### Performance
- [ ] Lighthouse score > 80 (all categories)
- [ ] Core Web Vitals < targets
- [ ] Images optimized (WebP, responsive)
- [ ] Lazy loading working
- [ ] CSS critical path optimized
- [ ] JS code-split by route
- [ ] No N+1 queries

### Environment Setup
- [ ] Production Supabase project created
- [ ] Production Xendit keys configured
- [ ] Production domain SSL/TLS
- [ ] Email service configured (SendGrid/etc)
- [ ] CDN setup (Cloudflare/CloudFront)
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (GA4, Mixpanel) configured

## Deployment Week

### 2 Days Before
- [ ] Final staging test on production setup
- [ ] Backup existing data (if migrating)
- [ ] Team trained on rollback procedure
- [ ] On-call engineer assigned
- [ ] Communication plan to users (if downtime)

### Deployment Day (Morning)
- [ ] Database backups verified
- [ ] Monitoring dashboards live
- [ ] Incident response team on standby
- [ ] Chat/Slack alerts configured

### Deployment (Vercel)
```bash
# Push to production branch
git push origin main

# Vercel auto-deploys
# Monitor: https://vercel.com/kviboystore/deployments

# Verify deployment
curl https://kviboystore.com/api/health
# Expected: { "status": "ok" }
```

### Post-Deployment (30 min)
- [ ] Health check endpoint responds
- [ ] Homepage loads (< 2s)
- [ ] Product catalog displays
- [ ] Search works
- [ ] Add to cart works
- [ ] Checkout loads
- [ ] Payment form renders
- [ ] Admin dashboard loads
- [ ] Error tracking reports coming in

### Post-Deployment (2 hours)
- [ ] Monitor error rates (should be 0%)
- [ ] Monitor API latency (should be normal)
- [ ] Check database performance
- [ ] Verify backups created
- [ ] Test payment flow end-to-end
- [ ] Test order notifications

### Post-Deployment (24 hours)
- [ ] No critical errors in Sentry
- [ ] User metrics normal
- [ ] Payment success rate > 95%
- [ ] All features working as expected

## Rollback Procedure

If critical issue detected:

```bash
# Option 1: Revert deployment (Vercel)
# Go to Vercel dashboard → Deployments
# Click "Promote to Production" on previous stable version

# Option 2: Database rollback
# Restore from backup
vercel env pull # Get env from Vercel
psql $DATABASE_URL < backup-2026-07-28.sql

# Option 3: Feature flag toggle
# If only one feature broken, disable it
NEXT_PUBLIC_NEW_FEATURE_ENABLED=false
```

**Decision Point:** If can't fix in 30 min → Rollback immediately

## First Week in Production

### Daily Monitoring
- [ ] Error rate < 1%
- [ ] API latency < 300ms p95
- [ ] Database performance healthy
- [ ] No memory leaks
- [ ] Payment flow success > 95%
- [ ] User complaints/feedback monitored

### Weekly Review
- [ ] Product analytics reviewed
- [ ] Performance metrics analyzed
- [ ] User feedback addressed
- [ ] Bug reports prioritized

## Post-Launch

### Monitoring (Ongoing)
```
Sentry: Error tracking & alerts
DataDog: Performance monitoring
Vercel Analytics: Core Web Vitals
Google Analytics: User behavior
Xendit Dashboard: Payment metrics
```

### Scaling (If Needed)
- [ ] Database connection pool increased
- [ ] CDN cache TTLs optimized
- [ ] Static content served from edge
- [ ] Database read replicas added
- [ ] Cron jobs load-tested

## Launch Communication

### Before Launch
- Email users: "Exciting update coming"
- Social media: Tease new features
- Documentation ready
- Support team briefed

### Day Of
- Public announcement
- Status page live
- Support channels active
- Monitor mentions/feedback

### Post-Launch
- Celebrate with team
- Gather user feedback
- Plan next iteration
- Document lessons learned

## Contact & Escalation

```
On-Call Engineer: [Name] - [Phone]
Technical Lead: [Name] - [Email]
Product Manager: [Name] - [Email]
DevOps: [Name] - [Email]
Customer Support: [Slack Channel]
Status Page: https://status.kviboystore.com
```

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Payment API down | Low | Critical | Fallback to backup gateway |
| Database crash | Very Low | Critical | Automated backups, quick restore |
| DDoS attack | Medium | High | Cloudflare protection, rate limiting |
| Data corruption | Very Low | Critical | Backups, RLS policies |
| Memory leak | Low | Medium | Monitoring, auto-restart on threshold |

## Success Criteria

✅ **Launch is successful if:**
- Zero critical errors
- Zero data loss
- All users can checkout
- Performance metrics green
- 95%+ payment success rate
- Customer support has no critical issues

✅ **Ready to declare "stable" after:**
- 24 hours with no critical issues
- Typical traffic sustained
- All features verified working
- Team confidence high
