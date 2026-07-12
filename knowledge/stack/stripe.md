---
id: stack-stripe
title: "Stripe"
summary: "Payment processing. I've used it for subscriptions across multiple projects and have patterns well established at this point. The API is genuinely good; the webhook handling is where most bugs live."
tags: ["stack", "stripe"]
updated: 2026-05-28
---
# Stripe

Payment processing. I've used it for subscriptions across multiple projects and have patterns well established at this point. The API is genuinely good; the webhook handling is where most bugs live.

---

## What it solves

Accepting money from users without building your own payment processing. Cards, wallets, billing management, tax calculation, invoicing: Stripe handles the hard parts of payments so you don't have to.

## Why I used it

It's the default choice for a reason. The API is well-documented, the DX is good, the test mode is thorough, and there's a massive ecosystem of guides for common patterns. Also: clients expect it.

## Setup shape

**Core pieces:**

1. `stripe` npm package (server-side only: never expose secret key)
2. Stripe Customer per user: store `stripeCustomerId` on your user model
3. Stripe Webhook endpoint for async event handling
4. Checkout Session for the payment flow

**Subscription flow:**
```
User clicks Subscribe
→ Create Checkout Session (server)
→ Redirect to Stripe Checkout
→ User completes payment
→ Stripe redirects to success URL
→ Webhook fires `checkout.session.completed`
→ Update user subscription status in DB
```

**Environment variables needed:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Subscription-specific notes

A few things I've landed on after setting up Stripe subscriptions across multiple projects:

- **Create the Stripe Customer at account creation time**, before any payment. Store the `stripeCustomerId` on your user model immediately. This means when the user goes to subscribe, you're looking up an existing customer, not creating one on the fly: simpler flow, cleaner billing history.
- **The success redirect is not reliable.** A user can hit the success URL without completing payment (back button, tab close, link manipulation). The webhook is the authoritative signal.
- **Stripe CLI is mandatory for local webhook development.** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`: have this running whenever you're touching billing.

## Pitfalls

- **Don't trust the redirect.** The success URL redirect is not a reliable signal. Use webhooks for authoritative state.
- **Webhook signature verification is mandatory.** Use `stripe.webhooks.constructEvent()` with the raw body. If you parse the body through Next.js or Express JSON middleware first, the signature check fails, and this failure mode is subtle.
- **Idempotency keys** for critical mutations: Stripe can retry webhooks, your handler needs to handle duplicate events without double-applying them.
- **Checkout Session vs Payment Intent**: know which you're using. Checkout Session is the hosted page; Payment Intent is for custom UI (Stripe Elements). Default to Checkout Session.
- **Stripe Customer vs Stripe Subscription**: you need both. Don't conflate them in your data model.
- **Test mode webhooks**: use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) for local development.

## Webhook handler pattern (Next.js App Router)

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text() // must be raw text: not JSON.parse'd
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature invalid', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(sub)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(sub)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`)
  }

  return new Response(null, { status: 200 })
}
```

## Security notes

- Secret key is server-side only. Never in client code, never in env vars that get bundled to the browser.
- Validate webhook signatures. Always.
- Don't store raw card data. Ever. Let Stripe handle it.
- Restrict your Stripe API key permissions in production: use restricted keys (read what you need, write what you need, nothing else).

## Testing notes

- Stripe's test card numbers are well documented: use them.
- `4242 4242 4242 4242` for success, `4000 0000 0000 9995` for decline.
- Test all webhook events, not just the happy path.
- Use `stripe listen --forward-to ...` for local webhook testing: don't skip this.
- Replay events from the Stripe Dashboard when debugging webhook handler behavior.

## What I'd repeat

- Creating the Stripe Customer at account creation, not at payment time
- Stripe Checkout for the initial payment flow
- Stripe CLI for local development
- Idempotency check in webhook handlers (check if the event has already been processed)

## What I'd avoid

- Building custom payment UI before trying Stripe Checkout
- Trusting redirect URLs as payment confirmation
- Forgetting subscription lifecycle events (`renewal`, `cancellation`, `failure`): these are the events that keep your DB in sync with Stripe

---

## Rules

- Never trust payment state from the redirect. Webhooks are the source of truth.
- Always verify webhook signatures with the raw request body.
- Webhook handlers must be idempotent: Stripe will retry on failure.
- Store `stripeCustomerId` on the user model from account creation.

## Preferences

- Stripe Checkout over custom payment UI unless there's a specific UX requirement
- Handle webhook event types with a switch/case and log unhandled events
- Keep a `stripeCustomerId` on the user model, `stripeSubscriptionId` on a subscription record: don't conflate

## AI notes

AI knows Stripe's API well but sometimes generates outdated patterns (e.g., deprecated Charges API instead of Payment Intents, old `createPaymentIntent` signatures).

What AI consistently forgets:
- Raw body requirement for webhook signature verification
- Idempotency handling in webhook handlers
- That the success redirect is not authoritative

Useful prompt: *"Write a Next.js App Router API route that handles a Stripe webhook. Use `req.text()` for the raw body. Verify the signature with `stripe.webhooks.constructEvent`. Handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`."*
