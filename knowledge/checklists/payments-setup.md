---
id: checklists-payments-setup
title: "Payments Setup Checklist"
summary: "Every time I set up Stripe. Designed to prevent the mistakes I've already made."
tags: ["checklists", "payments-setup"]
updated: 2026-05-28
---
# Payments Setup Checklist

Every time I set up Stripe. Designed to prevent the mistakes I've already made.

---

## Planning

- [ ] Payment model decided: one-time, subscription, usage-based, or hybrid?
- [ ] Pricing tiers designed and approved
- [ ] Free trial? If yes: trial period, what happens at end of trial?
- [ ] Will users manage billing themselves (customer portal)?
- [ ] Currency and tax requirements understood

---

## Stripe configuration

- [ ] Stripe account created (or existing account confirmed)
- [ ] Products and prices created in Stripe dashboard
- [ ] Test mode: all products and prices created and IDs noted
- [ ] Production mode: mirror of test prices created
- [ ] Customer Portal enabled in Stripe dashboard (if using subscription management)
- [ ] Webhook endpoint registered in Stripe dashboard (both test and production)
- [ ] Webhook events selected — at minimum:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

---

## Environment variables

- [ ] `STRIPE_SECRET_KEY` (server-side only — never expose to client)
- [ ] `STRIPE_PUBLISHABLE_KEY` (safe for client)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Separate keys for test and production environments

---

## Database

- [ ] `stripeCustomerId` field on user model
- [ ] Subscription status tracked in your DB (`active`, `trialing`, `past_due`, `canceled`)
- [ ] Plan/tier information stored

---

## Implementation

- [ ] Stripe Customer created at user account creation (not at payment time)
- [ ] `stripeCustomerId` stored in your DB at account creation
- [ ] Checkout Session creation endpoint implemented
- [ ] Webhook endpoint implemented
- [ ] **Webhook signature verification with raw request body** (this is where most webhook bugs come from)
- [ ] Webhook handler is idempotent (handles duplicate/retried events without double-applying)
- [ ] Subscription status updated on relevant webhook events
- [ ] Customer Portal session endpoint implemented (if self-service billing)
- [ ] Success redirect page does NOT treat the redirect as authoritative — user sees a "processing" state until webhook confirms

---

## Testing (test mode)

- [ ] Stripe CLI installed and running locally (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- [ ] Complete checkout flow tested with Stripe test card (`4242 4242 4242 4242`)
- [ ] Failed payment tested (`4000 0000 0000 9995`)
- [ ] Webhook events received and processed in local dev
- [ ] Subscription cancellation flow tested
- [ ] Subscription renewal event handled
- [ ] Customer portal works end to end

---

## Going live

- [ ] Switch to production Stripe keys in production env
- [ ] Production webhook endpoint verified in Stripe dashboard
- [ ] Test a real payment in production with a real card (then refund it)
- [ ] Production mode Stripe prices used in production code

---

## Post-setup

- [ ] Stripe dashboard notifications configured (failed payments, disputes)
- [ ] Failed payment handling in place (email notification, grace period, feature restriction)
- [ ] Refund process documented

---

## Common mistakes (from real experience)

| Mistake | Fix |
|---------|-----|
| Treating success redirect as payment confirmation | Use webhook `checkout.session.completed` instead |
| Parsing request body as JSON before signature verification | Use raw body (`req.text()` in Next.js App Router) |
| Not handling idempotency | Check if event already processed before applying changes |
| Creating Stripe Customer at payment time | Create at account creation, store ID |
| Only handling `checkout.session.completed` | Also handle subscription lifecycle events |

---

*See also: [Stripe Integration](../integrations/stripe.md)*
