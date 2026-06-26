---
id: checklists-security-basics
title: "Security Basics Checklist"
summary: "The baseline security practices I apply to every project. Not exhaustive — a security specialist would go much deeper — but the things that prevent the most common mistakes."
tags: ["checklists", "security-basics"]
updated: 2026-05-28
---
# Security Basics Checklist

The baseline security practices I apply to every project. Not exhaustive — a security specialist would go much deeper — but the things that prevent the most common mistakes.

---

## Secrets management

- [ ] No secrets in source code
- [ ] No secrets committed to git history (check with `git log -p | grep -i "secret\|key\|password\|token"`)
- [ ] All secrets in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] Production secrets never shared in Slack, email, or other non-secret stores
- [ ] API keys scoped to minimum required permissions

## Authentication

- [ ] All passwords hashed with bcrypt (or auth service handles this)
- [ ] Auth tokens verified server-side on every protected request
- [ ] User identity derived from verified token, not client-supplied values
- [ ] Session invalidation works (logout actually works)
- [ ] Rate limiting on login / signup / password reset endpoints

## Input validation & injection

- [ ] All user input validated (Zod or equivalent)
- [ ] No raw string interpolation in SQL queries — use parameterized queries (Prisma handles this)
- [ ] File upload validation: check type and size, not just extension
- [ ] Rich text / HTML input sanitized if rendered to DOM

## Transport security

- [ ] HTTPS enforced in production (redirect HTTP to HTTPS)
- [ ] HTTP Strict Transport Security (HSTS) header set
- [ ] Cookies set with `Secure`, `HttpOnly`, and `SameSite` flags

## HTTP headers

Check with [securityheaders.com](https://securityheaders.com):

- [ ] `Content-Security-Policy` — restrict sources for scripts, styles, etc.
- [ ] `X-Frame-Options: DENY` — prevent clickjacking
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` — restrict browser features not needed

## API security

- [ ] CORS configured explicitly — not `*` on sensitive endpoints
- [ ] Rate limiting on public APIs
- [ ] Sensitive API routes authenticated
- [ ] No internal error details in API responses (log server-side, return sanitized messages)
- [ ] API keys for third-party clients, not user passwords

## Dependencies

- [ ] `npm audit` clean (or known exceptions documented)
- [ ] Dependencies kept reasonably up to date
- [ ] Only necessary packages installed — check for unused dependencies

## Data

- [ ] Personal data handled per privacy policy
- [ ] Logs don't contain passwords, tokens, or PII
- [ ] Database not publicly accessible (in private subnet or IP-restricted)
- [ ] Database credentials rotated if ever exposed

---

*These are minimums. For applications handling sensitive data, financial information, or at significant scale, go deeper. Consider a security audit.*
