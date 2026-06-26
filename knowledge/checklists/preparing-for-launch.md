---
id: checklists-preparing-for-launch
title: "Preparing for Launch"
summary: "Launching is not a moment. It's a sequence: build → stage → verify → flip the switch → watch. The middle two steps are where I used to cut corners, and every time I did it I paid for it later — usu…"
tags: ["checklists", "preparing-for-launch"]
updated: 2026-05-28
---
# Preparing for Launch

Launching is not a moment. It's a sequence: build → stage → verify → flip the switch → watch. The middle two steps are where I used to cut corners, and every time I did it I paid for it later — usually in public.

This document is the process I now run before I let real users near a project. The existing checklists ([before-launch](./checklists/before-launch.md), [production-readiness](./checklists/production-readiness.md), [security-basics](./checklists/security-basics.md)) are the *what*. This is the *how* — the order I do things in, and the pieces I keep forgetting unless I write them down.

---

## The three artifacts I want before launch

Every serious project should have three living documents by the time I'm ready to flip prod on:

1. **A launch-readiness checklist** — the go/no-go doc. Section per concern (auth, payments, data, deploy). Each item has a rule like "no launch if billing and entitlement state can disagree without detection." Not aspirational. Not "nice to have." Blocking.
2. **A staging smoke test** — a human-walkable manual checklist that covers every user-facing surface, every third-party integration, every persistence path, every cron, every webhook. Run against staging before every promotion to prod.
3. **A launch playbook** — step-by-step, dependency-ordered provisioning and deploy instructions. Written so future-me (or a teammate) can execute without re-deriving the ordering.

If any of the three is missing, I'm not ready — I'm just confident.

---

## Staging environment — non-negotiable

I used to skip staging on smaller projects and test in prod with a "beta" flag. Every time, the same thing happened: some config value that was fine locally was wrong in prod, and I found out because a user did.

**A staging environment is a full, separate deployment of the app that mirrors production configuration as closely as possible, but with its own isolated third-party state.**

The non-negotiables:

- **Separate domain.** `staging.myapp.com` or `myapp-staging.vercel.app`. Never share the prod domain.
- **Separate database.** Never point staging at the prod DB. This is the most dangerous shortcut in the toolbox — one careless migration wipes real users.
- **Separate third-party projects.** Staging Stripe in test mode, staging Stytch/Firebase/Auth0 project, staging Sentry project, staging OpenAI key with its own spend cap, staging Upstash, staging push-notification credentials. Every external service gets its own account/project/key. This is the whole point of staging — catch misconfiguration *here*, not in prod.
- **A visible "STAGING" indicator.** Banner, badge, or color strip in the UI. Without it I *will* eventually confuse staging for prod and file a bug report against myself. Ask me how I know.
- **`robots.txt` disallowing indexing.** `Disallow: /`. Otherwise Google starts ranking your half-built staging pages, which is both embarrassing and hard to undo.
- **A commit SHA visible somewhere.** Footer, `/version` endpoint, response header. So I can tell which build I'm actually testing.
- **Dev-flag sanity.** Any env flag that unlocks unlimited usage, skips auth, or bypasses billing in dev *must* be unset on staging. If one of those ever slips through to staging, treat it as a launch blocker — it's a dress rehearsal for the same mistake in prod.

Staging is also the environment where I verify my **rollback path** works: deploy a dummy change, hit the hosting provider's one-click rollback, confirm it restored. I don't want to learn how rollback works at 2am during an incident.

### When to set it up

Early. Not right before launch. The recurring regret I captured in [how-i-start-projects](./how-i-start-projects.md) — "not setting up staging early, ends up testing against production longer than intended" — is the single most consistent mistake I make. Now I set it up as soon as the app has real auth and a real database, even if the app itself is still half-built.

---

## The manual smoke test

This is the artifact I undervalued for the longest time. A **staging smoke test** is a human-walkable markdown document with GitHub-style checkboxes that I physically click through in my browser (and the mobile app, if applicable) against staging before I promote to prod.

Not automated end-to-end tests. Those are great and I write them. But they don't catch:

- A misconfigured env var pointing staging at prod by accident.
- A missing secret that causes a silent fallback to a local in-memory stub.
- A DNS record that propagated but still resolves to the wrong origin on some networks.
- A Stripe webhook endpoint that was never registered.
- A magic-link email whose callback URL is still set to `localhost`.
- An Apple Sign-In services ID that points at the dev bundle.
- A cron job whose secret doesn't match between scheduler and handler.

Automated tests run against whatever the automation was told to run against. The smoke test runs against the *real* deployed thing, with my actual eyes, through every flow a user would touch.

### What it should cover

Roughly these sections — the template I've arrived at after running smoke tests across a handful of projects:

1. **Preflight** — am I really on staging? URL, indicator banner, commit SHA, DB host, `robots.txt`, dev flags unset.
2. **Auth & account lifecycle** — every auth method in UI, rate limits trip, logout, session expiry, account deletion, data export.
3. **Core user flows** — onboarding, the top 3–5 things a user actually does, completion persists.
4. **Role-based access** — anonymous users can't reach authed routes, free users can't reach paid surfaces, user A can't read user B's private data by ID.
5. **Data persistence & reload** — create something, reload, it's still there.
6. **File uploads & media** — static assets, any user upload path.
7. **Third-party integrations, one block per service** — database, auth, payments, LLM/AI, Redis, error reporting, push, email. Each verifies *staging* credentials are in use and traffic lands on the staging dashboard, not prod.
8. **Webhooks, inbound and outbound** — signature verification, duplicate handling, bad-signature rejection, self-healing reconciliation if the webhook is broken.
9. **Background jobs, queues, crons** — every scheduled task fires with the right secret and does its job.
10. **Search, filtering, pagination, sorting** — no duplicates, no missing rows, rate limits trip.
11. **Error & edge states** — forced 404, forced 500, rate-limit trip, interrupted checkout.
12. **Performance sniff** — cold-load the key pages, no requests to localhost or prod origins in devtools.
13. **Observability** — after the run, every staging dashboard shows the traffic it should, and no prod dashboard shows traffic from the run.
14. **Legal & policy plumbing** — the compliance pages (below) actually load with real content, not placeholders.
15. **Mobile / responsive** — real phone at ~375px width, and if there's a native app, the full app against staging backend.
16. **Accessibility smoke** — keyboard tab through, screen reader, 200% zoom.
17. **Rollback readiness** — previous release still deployable, migrations have a recovery path.
18. **App-specific** — whatever this product's money-item and trust-item flows are.

Each item reads as **action → expected result**, so a tired operator at the end of a long week can follow the expected state without having to re-derive what "correct" looks like.

### The sign-off

Every smoke test ends with a **GO / GO WITH FOLLOW-UPS / NO-GO** verdict, operator signature, and timestamp. Unchecked items are only acceptable if they have a linked ticket. This forces an explicit decision instead of a vibe.

### Generating it with AI

I don't write smoke tests by hand anymore. I let Claude generate the first pass — pointed at the codebase, it can enumerate routes, integrations, cron jobs, auth providers, and visibility rules far more exhaustively than I will remember to. The [`staging-smoke-test` skill](https://docs.claude.com/en/docs/claude-code/skills) is the one I lean on most: one command, produces a tailored `docs/staging-smoke-test.md` for the specific app.

My workflow:

1. Run the generator against a clean main branch.
2. Read it top to bottom, correcting anything it got wrong about the app's actual behavior (AI is confident and occasionally hallucinatory — trust but verify).
3. Add app-specific sections for the money items the AI can't infer — the race conditions, the quota boundaries, the domain-specific cost guards only you know exist.
4. Commit it to `docs/staging-smoke-test.md`.
5. Regenerate whenever the product's surface area changes meaningfully. The doc rots fast.

The value isn't just the checklist — it's the list of *assumptions* the AI encoded while reading the code, which often surfaces routes or flows I forgot existed.

---

## Observability and monitoring — knowing when the app is broken

Launching without monitoring is flying blind. Users will hit errors you don't see, performance will degrade without warning, and you'll learn about outages from angry emails hours after they started. Alongside staging and the smoke test, this is the piece that used to be my launch-day regret most often.

Four things I want running before real traffic hits prod. They answer different questions:

- **Error tracking:** "What's broken?"
- **Analytics:** "What are users doing — or not doing?"
- **Uptime:** "Is the app even up?"
- **Logs:** "Why did this specific request fail?"

Missing any one of them leaves a class of problems you can't diagnose.

### Error tracking — Sentry

My default is Sentry: `@sentry/nextjs` for web, `@sentry/react-native` for Expo, plain `@sentry/node` for standalone backends.

Setup checklist:

- **Separate projects (or at least separate environment tags) for staging and prod.** Mixing traffic makes it impossible to tell whether a new error is shipping or pre-existing.
- **Release tags pinned to the commit SHA.** Otherwise every error comes through as "unknown release" and you can't correlate regressions to deploys.
- **Source maps uploaded at build time.** Stack traces without source maps are minified gibberish. On Vercel + Next.js this is one env var (`SENTRY_AUTH_TOKEN`) and one plugin config.
- **Scope tags on every `captureException`.** Tag each call with a scope like `stories.post`, `pay.webhook.handler`. Turns "40 errors overnight" into "38 in webhook, 2 in stories" — different on-call responses.
- **Sampled performance tracing** — 10–20% of traffic so you can see p95 latency distributions without blowing your event quota.
- **Alerts routed to a destination you actually check.** Sentry email alerts land in a folder and die. Push them to Slack, PagerDuty, a Discord webhook, or phone push. Your first real incident is where the difference between alerted and silent becomes concrete.
- **PII scrubbing verified.** Sentry captures request bodies by default. Confirm passwords, tokens, and user data aren't ending up in the dashboard before prod opens.

### Product / web analytics — Vercel Analytics, PostHog, or Plausible

Error tracking tells you what broke. Analytics tells you what users are doing. You need both; they don't overlap.

- **Vercel Analytics** — zero-config if you're already on Vercel. Gives Core Web Vitals (LCP, INP, CLS) broken down by page and device, which is the baseline for caring about frontend performance. Turn it on before launch, not after.
- **Vercel Speed Insights** — the server-side companion. Real-user performance data, not synthetic.
- **PostHog** — my default for product analytics (funnels, retention, feature flags, session replay). Self-hostable if you care; the cloud is fine for most projects.
- **Plausible / Fathom** — cookieless, privacy-first, simpler. Right call when you want aggregate traffic numbers without the GDPR consent-banner dance. Lighter on features than PostHog.

Regardless of tool, define the events that matter **before** launch. At minimum: `signup_completed`, `first_value` (whatever the first real use looks like for your app), `upgrade_completed`, `churn_event`. Launching without these wired means launching without a baseline — which means you can't tell whether week-two numbers are good or bad.

Avoid vanity metrics. Page views are almost never the thing you actually care about.

### Uptime monitoring

At least one external service pinging your homepage and one critical authenticated API route. Options:

- **BetterUptime (BetterStack)** — my current default. Good status page, incident management, phone/push alerts on the free tier.
- **UptimeRobot** — free, limited, fine for prototypes.
- **Pingdom** — overkill for most indie projects.

The alert destination matters more than the tool. If the alert lands in a Slack channel nobody checks at 3am, the monitor is useless. Route critical alerts to phone push, SMS, or a dedicated status-only channel you keep open.

One thing I've started doing: an uptime check that hits a `/api/health` endpoint which *actually executes* a DB query and a third-party ping (Stripe, Stytch). A homepage 200 doesn't mean the app works — it means the CDN served a cached HTML file. A health endpoint that proves the critical dependencies respond is a much stronger signal.

### Structured logging

Sentry catches exceptions. Logs catch everything else — slow queries, unusual traffic patterns, webhook retries, cron runs, the breadcrumbs around an error that Sentry alone doesn't provide.

- **Log to stdout in JSON format**, not unstructured text. Every modern hosting platform (Vercel, Railway, Fly, Cloudflare) ingests JSON logs natively and lets you filter on fields.
- **Correlate by request ID.** A `requestId` field on every log line for a given request lets you pull the full trail when something fails.
- **Never log secrets or PII.** Passwords, auth tokens, full credit card numbers, and personally identifiable user fields (email, phone, address) get redacted at the log layer. Cheap to set up early, expensive to retrofit.
- **Structured logs around expensive operations.** LLM calls, payment operations, email sends — each gets a log line with timing, user ID, outcome. Becomes the first place to look when costs spike or users complain.

For anything more serious than a solo project, centralize logs to a queryable service (BetterStack, Axiom, Datadog). Vercel's built-in log viewer is fine for a while; it doesn't scale to "find all 500s in the last 24h grouped by endpoint."

### Alerts worth wiring before launch

Monitoring without alerts is a dashboard nobody checks. The critical pre-launch alerts:

- **Auth failure rate spike** — usually a bot attack or a real regression. Both need immediate attention.
- **Webhook handler failures** — Stripe, email, push. Silent webhook failures cause billing drift, delivery gaps, trust erosion.
- **Cost spikes on LLM / SMS / email APIs** — alert when usage hits 2–3x baseline. Combined with per-user daily caps enforced in code, this is how you don't wake up to a $5k OpenAI bill from a bad actor or a runaway cron.
- **Cron job last-run staleness** — fires when a scheduled job hasn't completed in the expected window. Easy to miss, nasty when missed.
- **Scoped error-rate spikes** — e.g. "if new errors in `pay.webhook.handler` exceed 5/min, page me." Scoped alerts catch real regressions without firing on background noise.

### A pre-launch baseline

Before launch day, take a baseline snapshot: error rate, p95 latency, Core Web Vitals, OpenAI spend per day, signup → first-value conversion on staging / internal testing. Pin these numbers somewhere you'll find them. Week one of launch, compare against them. Without a baseline, you can't tell whether "we're seeing 200 errors a day" is fine or on fire.

---

## Legal, policy, and compliance — the stuff that's boring until it isn't

Every launch has a list of compliance pieces I need to ship, and every launch I have to re-remember what they are. Here's the list so I stop re-googling it.

### Pages the app must have (and they must load real content, not placeholders)

- **Privacy policy** — what data is collected, why, how long it's kept, who it's shared with, how users exercise their rights, contact for data requests. Must accurately reflect the data the app *actually* collects — auth identities, payment records, AI prompts, push tokens, analytics events, anything cached or logged.
- **Terms of service** — acceptable use, refund and cancellation policy, limitation of liability, termination, governing law. For subscription products, the refund/cancellation terms need to match what the billing flow actually does.
- **Cookie policy** — if you use cookies at all (session cookies count), list them: name, purpose, duration, first/third-party. Link from the footer and from the consent banner.
- **Subprocessors list** — every third-party service that touches user data. Stytch/Firebase, Stripe, OpenAI/Anthropic, Neon/Postgres host, Upstash, Sentry, Expo, your hosting provider. Users (and auditors) want this; regulators require it for business-to-business SaaS.
- **Contact / support** — a real destination that routes to an inbox a human checks.
- **Accessibility statement** — required in more jurisdictions every year. What WCAG level you target, known gaps, how users report issues.

Common failure mode: the `/privacy`, `/terms`, etc. routes exist as directories in the app, but they're empty stubs. The smoke test should verify they load *substantive* content.

### Data-protection law obligations (GDPR / CCPA / similar)

These apply to almost any app with EU or California users, which is almost every app:

- **Lawful basis** for each category of data processing documented in the privacy policy.
- **Data export** — users can request a copy of their data. I implement this as a `POST /api/account/export` endpoint returning JSON of everything tied to the user.
- **Account deletion** — users can delete their account and their data. Define cascade policy explicitly (what gets hard-deleted, what gets anonymized, what gets retained for legal reasons like invoices). Test it end to end: deletion revokes sessions, removes the rows, and subsequent authenticated calls return 401.
- **Consent for analytics** — if you run analytics in EU regions, show a cookie banner that captures consent *before* loading the trackers. The "reject all" path must actually reject.
- **Data minimization** — don't log passwords, tokens, PII. Audit your logging before launch.
- **Breach notification plan** — not required to publish, but required to have. Know how you'd notify users if something went wrong.

### Payment and subscription specifics

- **Strong Customer Authentication (SCA)** in EU — Stripe handles this for you, but your flow has to support 3DS challenges without breaking.
- **Tax** — Stripe Tax or similar, configured before your first paying customer. Unwinding sales-tax obligations retroactively is miserable.
- **Refund policy** disclosed clearly before checkout, not buried.
- **Clear pricing** — for subscriptions, the renewal frequency and amount must be visible at checkout (multiple jurisdictions require this explicitly).

### App store obligations (if shipping a native app)

- **App Tracking Transparency** on iOS if you do any tracking.
- **App Privacy questionnaire** in App Store Connect — must match your privacy policy.
- **Data Safety section** in Google Play — same.
- **Content rating** appropriate for the app.
- **Review guidelines** — read them. Sign-in with Apple is required if you offer any third-party social login on iOS.

---

## Other things I keep having to search for

These are the odd-lot items that don't fit any category but have burned me before:

- **Domain ownership verification** at all your third-party services (Google Workspace, Microsoft, email sender reputation). Do it before DNS propagates, not after.
- **Email deliverability** — SPF, DKIM, DMARC records for your sending domain. Warm up the domain if you'll send volume. Test with [mail-tester.com](https://www.mail-tester.com). Transactional email (Resend, Postmark) handles most of this but you still have to set the DNS records.
- **DNS TTLs** — drop them to something low (300s) a few days before launch so if you need to fail over, propagation is fast. Raise them back after launch stabilizes.
- **SSL cert** — verify it's valid and covers both `app.com` and `www.app.com`. Vercel handles this, but the smoke test should still check.
- **Favicon, Open Graph tags, Twitter card** — missing OG metadata makes every link you share look unprofessional. Test with the platform validators.
- **`sitemap.xml` and `robots.txt`** — prod should allow indexing, staging should disallow. It's easy to ship this inverted.
- **On-call / incident ownership** — even if it's a solo project, decide in advance *what* you check when things break. A 30-minute runbook saved on launch day is worth a week of recovery.
- **Rate limits on expensive endpoints** — anything that calls an LLM, sends SMS, or triggers a paid third-party API needs a per-user daily cap, not just per-minute. One bad actor can burn the monthly budget overnight without one.
- **Spend caps** — configure budget alerts and hard caps at every third-party (OpenAI, Twilio, SendGrid). Default-deny is better than default-bill.
- **Trademark and name availability** — if the product has a real name, run a quick USPTO / equivalent search before you spend on branding. Not legal advice, just a "don't build on sand" check.
- **Beta users queue** — have ~5–20 people lined up who'll actually use it in the first 48 hours. A launch with no users isn't a launch, it's a deploy.

---

## The order of operations

This is roughly the sequence I now follow, compressed:

1. **Weeks out:** Write the launch-readiness checklist. It is a living document. Every item is either green or has a linked ticket.
2. **Weeks out:** Stand up staging. Point all third-party integrations at staging versions. Verify the visible "STAGING" indicator.
3. **Weeks out:** Ship the compliance pages. Privacy, terms, cookies, subprocessors. Real content, reviewed against what the app actually does.
4. **Weeks out:** Configure monitoring (Sentry, analytics, uptime checks, structured logging), rate limits, and spend caps on staging. Deliberately trip each one and confirm the alerts route to a destination you'll actually see.
5. **Days out:** Generate the smoke test with Claude against the current codebase. Review, correct, commit.
6. **Days out:** Run the smoke test against staging end to end. Every item green or ticketed. File whatever needs fixing.
7. **Day of:** Follow the launch playbook to provision prod. Third-party accounts first, Vercel next, DNS last.
8. **Day of:** Deploy prod. Run an abbreviated smoke test against prod focused on the paid paths and the money items. Do not do the full run against prod — you'll create real users, real charges, real emails.
9. **Day of:** Flip public traffic on. Watch error tracking, billing, and uptime for a few hours.
10. **Day +1:** Debrief. Anything that was "fine on staging but surprised me in prod" becomes a new smoke-test item.

---

## Common mistakes I've made preparing for launch

- **Running the smoke test the same day as launch.** If the smoke test finds problems (it will), you can't ship. Run it days before, fix, re-run.
- **Trusting that "it worked on staging" means it'll work in prod.** Staging catches most things. It doesn't catch domain-specific config (OAuth callback URLs, webhook endpoints, DNS). Those have a dedicated prod-only smoke pass.
- **Shipping placeholder privacy/terms pages.** Real pages. Real content. Reviewed against the actual data flows. "Lorem ipsum" privacy pages are worse than no pages.
- **Not testing rollback.** The first time you need rollback is not the time to learn it.
- **Forgetting spend caps on LLM keys.** You will sleep worse knowing the cap is set than knowing it isn't. Set the cap.
- **Launching quietly "to see what happens."** If nobody's watching, bugs get discovered by users, not by you. Line up beta testers. Watch dashboards. Treat launch day as a live event, not a deploy.

---

*See also: [Before Launch Checklist](./checklists/before-launch.md) | [Production Readiness](./checklists/production-readiness.md) | [Security Basics](./checklists/security-basics.md) | [How I Start Projects](./how-i-start-projects.md)*
