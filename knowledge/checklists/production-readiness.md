---
id: checklists-production-readiness
title: "Production Readiness Checklist"
summary: "A more thorough version of the before-launch list. Use this for projects that need to hold up under real load, real users, and real failure modes."
tags: ["checklists", "production-readiness"]
updated: 2026-05-28
---
# Production Readiness Checklist

A more thorough version of the before-launch list. Use this for projects that need to hold up under real load, real users, and real failure modes.

---

## Infrastructure

- [ ] Production database on managed infrastructure (RDS, PlanetScale, Supabase, Neon: not localhost)
- [ ] Database automated backups enabled and tested (confirm you can restore)
- [ ] Database connection pooling in place (especially critical for serverless)
- [ ] Application deployed to production (not "will deploy later")
- [ ] Custom domain configured with HTTPS
- [ ] CDN for static assets (Vercel handles this, or CloudFront)
- [ ] Region selection considered (closer to your users is faster)

## Observability

- [ ] Error tracking (Sentry or equivalent): capturing unhandled exceptions
- [ ] Structured logging: server-side errors logged with context
- [ ] Uptime monitoring (BetterUptime, Pingdom, UptimeRobot: something)
- [ ] Performance monitoring: at least Vercel Analytics or Lighthouse for baseline
- [ ] Database slow query monitoring if at any meaningful scale

## Reliability

- [ ] Application gracefully handles database connection failures
- [ ] Application gracefully handles third-party service downtime (Stripe, Firebase, etc.)
- [ ] Webhooks have retry handling on your end
- [ ] Long-running jobs are async (not blocking the request lifecycle)
- [ ] Cron jobs / scheduled tasks are running and monitored

## Security

- [ ] All production secrets in environment variables, not code
- [ ] Secrets rotated from any that were ever exposed (committed, logged, etc.)
- [ ] Security headers configured (check securityheaders.com)
- [ ] Rate limiting on auth endpoints and public APIs
- [ ] CORS configured correctly (not `*` for sensitive APIs)
- [ ] Dependencies audited for known vulnerabilities (`npm audit`)

## Scalability basics

- [ ] Database indexed on columns used in frequent queries
- [ ] Pagination in place for any list endpoints (don't return unbounded results)
- [ ] File uploads go directly to storage (S3/Firebase), not through your API server

## Deployment process

- [ ] CI/CD pipeline running on main branch
- [ ] Database migrations have a tested rollback path
- [ ] Zero-downtime deployments (or at least a maintenance window plan)
- [ ] Rollback plan documented: if something goes wrong after deployment, how do you revert?

## Documentation

- [ ] README explains how to set up and run the project locally
- [ ] Environment variables documented (names, descriptions, where to get them)
- [ ] Deployment process documented
- [ ] On-call runbook for common failure scenarios (if multi-person team)

---

*This list is for "this needs to work" projects. Smaller personal projects and prototypes get the shorter [Before Launch](./before-launch.md) list.*
