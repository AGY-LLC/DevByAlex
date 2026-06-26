---
id: checklists-before-launch
title: "Before Launch Checklist"
summary: "The things I check before going live. This has grown from painful experience."
tags: ["checklists", "before-launch"]
updated: 2026-05-28
---
# Before Launch Checklist

The things I check before going live. This has grown from painful experience.

Not every item applies to every project. Use judgment.

For the broader *process* — staging environment, manual smoke testing, compliance pages, launch-day sequencing — see [Preparing for Launch](./preparing-for-launch.md). This file is the short checklist; that one is the workflow.

---

## Auth & Accounts

- [ ] Sign up flow works end to end (including email verification if applicable)
- [ ] Login works with all configured providers
- [ ] Password reset flow works (send email → click link → reset → log in)
- [ ] Session expiry is handled gracefully (redirect to login, not a broken state)
- [ ] Logout clears session properly
- [ ] Protected routes actually redirect unauthenticated users
- [ ] User roles/permissions are enforced server-side, not just client-side

## Payments (if applicable)

- [ ] Payment flow works in test mode end to end
- [ ] Webhook handler is deployed and receives events
- [ ] Webhook signature verification is in place
- [ ] Success/failure states are handled
- [ ] Subscription cancellation works
- [ ] Switch from test to live Stripe keys in production env

## Environment & Config

- [ ] All required environment variables are set in production
- [ ] No development/test credentials in production config
- [ ] No hardcoded secrets or API keys in code
- [ ] Production database is separate from development/staging
- [ ] Database connection pooling is configured for production load

## Security

- [ ] HTTPS is enforced
- [ ] Security headers are set (CSP, HSTS, X-Frame-Options) — check with securityheaders.com
- [ ] Rate limiting on auth endpoints and public APIs
- [ ] Input validation on all user-submitted data
- [ ] File upload validation (type, size) if applicable
- [ ] Sensitive error details not exposed to clients

## Performance

- [ ] Images are optimized (Next.js `<Image>` or equivalent)
- [ ] Web fonts are loaded efficiently (not blocking render)
- [ ] Core Web Vitals check (Lighthouse or Vercel Analytics)
- [ ] No obvious N+1 queries in high-traffic paths

## Quality

- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Tests pass
- [ ] Manual smoke test: click through the main user flows
- [ ] Keyboard navigation works on critical flows
- [ ] Mobile layout is usable

## Observability

- [ ] Error tracking is set up (Sentry or equivalent)
- [ ] Logging is in place for server-side errors
- [ ] Deployment alerts are configured (Vercel email, etc.)
- [ ] Uptime monitoring (even a basic ping is better than nothing)

## Legal / Business

- [ ] Privacy policy exists and is linked
- [ ] Terms of service exist if required
- [ ] Cookie consent if collecting analytics in GDPR regions
- [ ] Custom domain is configured and DNS is propagated

---

*See also: [Production Readiness](./production-readiness.md) | [Security Basics](./security-basics.md) | [How I Start Projects](./how-i-start-projects.md)*
