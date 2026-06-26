---
name: staging-smoke-test
description: >-
  Generates a human-walkable manual smoke-test checklist for verifying an app
  works end-to-end in a live staging environment before promoting to
  production. The checklist covers every user-facing surface, every
  third-party integration, every persistence path, every background worker,
  and every configuration-dependent wiring (auth, payments, email, storage,
  analytics, webhooks, cron, observability) so the user can catch anything
  broken by misconfigured env vars, wrong credentials, unpromoted
  migrations, or unconnected services. Output is a single markdown document
  with GitHub-flavored checkboxes written to `docs/staging-smoke-test.md`
  (creating the folder if needed) and is tailored to the specific app by
  inspecting the codebase first. Use when the user asks for a staging smoke
  test, pre-prod checklist, manual QA pass, "walk-through before we ship",
  or any variant of "make sure staging is actually working before prod".
---

# Staging smoke test

A **generator** skill. It does not run the test itself — it writes a
checklist that a human operator walks through against a live staging
deployment. The goal: catch anything that "compiles and deploys" but isn't
actually wired up correctly in the staging environment.

## What it produces

A single markdown file at `docs/staging-smoke-test.md` (create the `docs/`
folder if it doesn't exist) containing:

- A preflight section (am I really on staging?).
- One section per functional area of the app, each with checkbox items.
- An explicit "expected result" next to each checkbox so the operator
  never has to guess what "working" looks like.
- A sign-off block at the bottom for the operator to record the run.

**Do not run the checks.** Do not spin up a browser, call staging APIs, or
log in. This skill only writes the document. Executing the smoke test is
the human's job — that is the whole point.

**Do not overwrite blindly.** If `docs/staging-smoke-test.md` already
exists, read it first. Preserve any operator notes / hand-edited sections
that sit outside the generated structure, and regenerate the checklist
itself in place. If the user wants a clean rewrite, they will say so.

## Mindset

- **Assume misconfiguration.** The code probably works; the *environment*
  is the suspect. Every integration that depends on an env var, secret,
  DNS entry, or third-party dashboard toggle needs an item that proves
  it's wired up *in staging specifically*, not just "in theory".
- **Staging is not prod.** Call out items that depend on staging having
  its own isolated accounts (Stripe test mode, SendGrid sandbox,
  separate DB, separate S3 bucket, separate feature flags). A smoke
  test that accidentally hits prod data is a failure of the smoke test.
- **Every surface, every role.** If the app has admin, user, and guest
  views, every one of them gets covered. If there is a mobile app and a
  web app, both get sections. If there is a public API, it gets a
  section.
- **Every integration, explicitly.** Never write "check third-party
  services work". Enumerate each one by name (Stripe, Postmark, Algolia,
  Sentry, PostHog, Twilio, S3, OpenAI, etc.) and give it its own items.
- **Prove the wire, not just the code.** Prefer items that only pass if
  the staging-specific configuration is correct: "log in, then verify a
  new session appears in the staging Auth0 dashboard," not "log in."
- **Include the boring stuff.** Health endpoints, favicon, robots.txt for
  non-prod (should disallow), 404 page, error page, logout redirect,
  email deliverability, webhook signatures, cron last-run timestamps.
  Boring items catch the biggest configuration mistakes.
- **Specific, observable outcomes.** Every item ends with "→ Expected:
  …". If the expected result isn't observable from the user's side
  (dashboard, DB row, log line, email in inbox), rewrite the item.

## Workflow

1. **Map the app from the repo.**
   - What is the stack? (framework, runtime, deployment target)
   - What surfaces exist? (web, mobile, API, CLI, webhooks, workers,
     crons, admin panel, public docs site)
   - Who are the user roles? (anonymous, signed-in user, admin,
     tenant-admin, API consumer, service account)
   - Which third parties are integrated? (grep for SDK imports: Stripe,
     Postmark, SendGrid, Resend, Twilio, Segment, PostHog, Mixpanel,
     Amplitude, Sentry, Datadog, OpenAI/Anthropic, Algolia, Pinecone,
     Cloudinary, S3/GCS/R2, Auth0/Clerk/WorkOS, LaunchDarkly, etc.)
   - Which async paths exist? (job queues, cron, webhooks in, webhooks
     out, pub/sub, scheduled tasks)
   - Which features gate on configuration? (feature flags, env-gated
     routes, paid-plan features)
2. **Identify the staging-specific risks.** Read any `.env.example`,
   `config/`, infra, or deploy files to note what must be set per env.
   Anything that differs prod↔staging is prime smoke-test material:
   API keys, webhook URLs, callback URLs, database URLs, CDN domains,
   allowed origins, OAuth redirect URIs, from-addresses, sender domains,
   feature flag values.
3. **Generate sections.** Produce the sections listed under **Checklist
   template** below, dropping any that truly don't apply (e.g. skip
   **Payments** if the app has no billing). Add app-specific sections
   for anything discovered in step 1 that doesn't fit the standard
   buckets.
4. **Write the file** to `docs/staging-smoke-test.md` using the format
   in **Output**. Create `docs/` if it doesn't exist. If the file
   already exists, preserve operator-added notes outside the standard
   sections where possible.
5. **Tell the user** one sentence: where the file was written and how
   many checklist items it contains.

## Checklist template

Use these sections as a starting point. Drop sections that don't apply
to this app. Add sections for anything app-specific the audit surfaces.

### 1. Preflight — am I really on staging?

Items that confirm the operator is hitting the staging environment, not
prod, before they do anything destructive.

- Staging URL loads (`https://staging.example.com` or equivalent). →
  Expected: page renders, URL bar shows staging domain.
- Staging banner / environment indicator visible. → Expected: a visible
  "STAGING" badge, colored header, or similar. If none exists, flag it
  as a finding to add before the next smoke test.
- `robots.txt` disallows indexing on staging. → Expected: `Disallow: /`
  or equivalent.
- Build/commit SHA visible somewhere (footer, `/version`, response
  header). → Expected: matches the SHA you intended to deploy.
- Staging DB is not prod DB. → Expected: a known staging-only record
  exists, or a prod-only record is absent.

### 2. Auth & account lifecycle

Cover every auth path the app supports.

- Sign up with a new email. → Expected: account created, verification
  email delivered to a real inbox, verification link works.
- Log in with the new account. → Expected: redirected to the
  post-login surface; session cookie set with correct flags.
- Log out. → Expected: session invalidated; protected routes now
  redirect to login.
- Password reset. → Expected: email delivered, link resets password,
  old password no longer works.
- SSO / OAuth providers (Google, GitHub, Apple, Microsoft, etc. —
  whichever are enabled). → Expected: redirect to provider, consent
  screen on staging's OAuth app, return to staging callback, account
  linked.
- Magic link / OTP if supported. → Expected: email / SMS delivered,
  code works, expires correctly.
- MFA enrollment and challenge if supported. → Expected: enroll, log
  out, log in, prompted for second factor.
- Session expiry / refresh. → Expected: stale session is rejected;
  refresh token rotates if used.
- Account deletion / data export (if shipped). → Expected: actually
  purges or exports — check DB/storage to confirm.

### 3. Core user flows

One subsection per primary user journey discovered from the code. For
each, list the happy-path steps and the expected observable outcome.
Do not be generic — name the actual flows ("Create a project",
"Invite a teammate", "Publish a post", "Book a ride", "Start a
conversation").

### 4. Role-based access

- As an anonymous user, hit a protected route. → Expected: redirect to
  login, no data leak in HTML/JSON.
- As a regular user, hit an admin route. → Expected: 403/404, not a
  partial render.
- As an admin, hit the admin panel. → Expected: loads, shows staging
  data.
- Cross-tenant isolation (if multi-tenant): log in as Tenant A, try to
  read a Tenant B record by ID. → Expected: denied.

### 5. Data persistence & reload

- Create a record, reload the page. → Expected: record still there.
- Create a record, log out, log back in. → Expected: record still
  there.
- Update a record, open in a second browser. → Expected: change
  reflected (or sync path works as designed).
- Delete a record. → Expected: gone from UI; gone from DB (spot
  check).

### 6. File uploads & media

- Upload a supported file type at typical size. → Expected: appears in
  UI, served from staging's CDN/bucket (check URL), not prod's.
- Upload an unsupported type. → Expected: rejected with a clear
  error.
- Upload near the size limit. → Expected: accepted; oversized file
  rejected.
- Downloads / signed URLs work and expire. → Expected: link works
  within TTL, 403s after.
- Image transforms / thumbnails render. → Expected: correct sizes,
  not broken `img` tags.

### 7. Third-party integrations — one block per integration

For each integration discovered in step 1, produce a labeled block.
Examples (include only what actually ships):

- **Stripe (test mode on staging)**: complete a checkout with test
  card `4242 4242 4242 4242`. → Expected: payment succeeds, webhook
  fires, order marked paid in the app DB, event visible in the
  Stripe *test* dashboard (not live).
- **Email provider (Postmark/SendGrid/Resend/SES sandbox)**: trigger a
  transactional email. → Expected: delivered to inbox; From address
  matches staging sender; link domains point at staging; event visible
  in provider's staging project.
- **SMS / Twilio**: trigger a verification SMS to a real number. →
  Expected: message received; sender ID is the staging one.
- **Analytics (PostHog / Segment / Mixpanel / Amplitude / GA4)**:
  perform a tracked action. → Expected: event appears in the
  *staging* project/workspace, not prod.
- **Error reporting (Sentry / Rollbar / Bugsnag / Datadog)**: trigger
  a deliberate error (e.g. hidden debug route). → Expected: error
  appears in staging's project, with the staging release tag.
- **Search (Algolia / Elastic / Meilisearch / Typesense)**: create a
  searchable record, wait for index, search for it. → Expected:
  result appears from the staging index.
- **Vector / AI services (OpenAI / Anthropic / Pinecone / etc.)**:
  run a flow that hits the model. → Expected: response returns,
  usage recorded on the staging API key.
- **Storage (S3 / GCS / R2 / Cloudinary)**: upload, then verify the
  object exists in the staging bucket (not prod).
- **Auth provider (Auth0 / Clerk / WorkOS / Cognito)**: verify the
  user appears in the staging tenant, not prod.
- **Feature flags (LaunchDarkly / Unleash / Flagsmith / PostHog
  flags)**: toggle a flag in staging, refresh the app. → Expected:
  behavior changes; prod unaffected.
- **Push notifications (FCM / APNs / OneSignal)**: send a test push.
  → Expected: received on a registered device from the staging app
  bundle.
- **CDN / image optimizer**: hard-reload a static asset. → Expected:
  served from staging CDN host; cache headers sane.

### 8. Webhooks — inbound and outbound

- **Outbound**: trigger the event the app emits (e.g. order paid,
  user signed up). → Expected: receiver gets a signed request on the
  staging endpoint, signature verifies.
- **Inbound**: send a test webhook from the provider's staging
  dashboard (or replay a captured one). → Expected: 2xx, side effect
  visible in the app, signature enforced (bad signature returns
  4xx).

### 9. Background jobs, queues, and crons

- Trigger an async job (email, thumbnail, export, etc.). → Expected:
  job picked up by the staging worker, completes, side effect
  observable.
- Check queue dashboard (Sidekiq / Bull / Celery / Oban / Temporal).
  → Expected: processed counts increase; no unexpected dead-letter
  jobs.
- Cron / scheduled tasks. → Expected: last-run timestamp is recent
  per the schedule; logs show each scheduled task firing on staging.

### 10. Realtime / websockets / SSE (if applicable)

- Open the app in two browsers; perform an action in one. → Expected:
  the other updates within expected latency.
- Drop and reconnect. → Expected: reconnects; state reconciles.

### 11. Search, filtering, pagination, sorting

- Search for a known record. → Expected: returns it.
- Search for nothing. → Expected: empty-state UI, not an error.
- Paginate past the last page. → Expected: sensible empty page, no
  crash.
- Apply each filter individually, then in combination. → Expected:
  results match.

### 12. Error & edge states

- Force a 404. → Expected: branded 404 page, not a framework
  default.
- Force a 500 (debug route / toggled error). → Expected: branded
  500 page; error reported to monitoring.
- Submit an invalid form. → Expected: field-level errors, focus on
  first error, no silent failure.
- Go offline mid-action (if the app claims offline support). →
  Expected: defined behavior (queue, retry, clear message).
- Rate-limited endpoint hit rapidly. → Expected: 429 with a clear
  message, not a crash.

### 13. Performance sniff

Not a load test — just "does it feel obviously broken?"

- Cold-load the landing page. → Expected: renders within a few
  seconds on a normal connection.
- Largest list / dashboard view. → Expected: renders; no console
  errors; no infinite spinner.
- Open DevTools network tab on a key flow. → Expected: no
  unexpected requests to `localhost`, prod domains, or 404ing
  assets.

### 14. Observability — did the run show up where it should?

At the end of the smoke test, the operator should confirm traces of
the run in the monitoring stack.

- Recent requests visible in APM / logs dashboard for the staging
  service.
- Errors triggered during the run appear in the error reporter
  (staging project).
- Analytics events from the run appear in the analytics dashboard
  (staging project).
- Uptime monitor / health check endpoint reports green.

### 15. Legal, policy, and navigation plumbing

- Footer / signup links to privacy policy, terms, cookie policy all
  load and are the expected versions.
- Cookie / consent banner appears for non-consented users; selection
  persists.
- Unsubscribe link in any marketing email works and actually
  unsubscribes (verify in provider dashboard).
- Support / contact link points somewhere real; form submission
  delivers (don't send to prod support inbox — verify staging
  routing).

### 16. Mobile / responsive (if applicable)

- Critical flows on a real phone at ~375px width. → Expected: no
  overflow, no unreachable buttons, tap targets large enough.
- Mobile app build (if applicable) points at staging API. →
  Expected: sign in, perform one core flow, verify it hits staging
  backend (check logs or a staging-only record).

### 17. Accessibility smoke

Not a full audit — just "obviously broken?"

- Tab through a key form. → Expected: visible focus ring, logical
  order, every interactive element reachable.
- Screen-reader-announce a page landmark (VoiceOver / NVDA). →
  Expected: page title, headings, and form labels announce
  correctly.
- Zoom to 200%. → Expected: no content clipped or unreachable.

### 18. Rollback readiness

- Previous release is still deployable / reachable via one-click
  rollback. → Expected: rollback path verified at least to the
  point of "the button/command exists and the operator knows how to
  use it" — do not actually roll back unless asked.
- Migrations are reversible or have a documented recovery path. →
  Expected: note present in the run notes, even if not exercised.

### 19. App-specific section(s)

Add one or more sections for anything unique to this app: domain
workflows, regulated-data handling (HIPAA/PCI), LLM safety checks,
marketplace matching, booking calendars, device pairing, hardware
integrations, etc. Name them for the feature, not generically.

## Output format

Write the checklist to `docs/staging-smoke-test.md` using this
structure. Use GitHub-flavored checkboxes (`- [ ]`) so the operator
can check items off in a rendered view or directly in the file.

```markdown
# Staging smoke test

Manual walkthrough to verify the staging deployment is functional and
correctly wired before promoting to production. Walk through every
item. If an item fails, stop and file it before continuing — a failed
smoke test means staging is not ready, and neither is prod.

**Environment:** staging
**Generated for:** <app name inferred from repo>
**Last generated:** <YYYY-MM-DD by the skill>

> Tip: copy this file or duplicate it per run if you want to keep a
> history of sign-offs.

---

## 0. Run metadata (fill in before starting)

- **Operator:** ________________
- **Date / time started:** ________________
- **Staging commit SHA:** ________________
- **Ticket / release notes link:** ________________

---

## 1. Preflight — am I really on staging?

- [ ] Staging URL loads. → Expected: …
- [ ] Staging banner visible. → Expected: …
- [ ] …

## 2. Auth & account lifecycle

- [ ] …

<... every remaining section, in order ...>

---

## Sign-off

- [ ] Every item above is checked, **or** every unchecked item has a
      linked ticket.
- [ ] No new errors in the staging error reporter that weren't there
      before the run (excluding ones deliberately triggered).
- [ ] No unexpected traffic hit production during the run.

**Verdict:**
- [ ] GO — safe to promote to production.
- [ ] GO WITH FOLLOW-UPS — tickets filed: ________________
- [ ] NO-GO — blocking issues: ________________

**Operator signature:** ________________
**Completed at:** ________________
```

## What this skill does not do

- **Run the smoke test.** It only generates the document. Executing
  the checklist is the operator's job.
- **Hit staging or prod.** No network calls, no logins, no API
  requests from this skill.
- **Produce a generic template.** Every run should be tailored to the
  app by reading the repo first. A checklist that doesn't mention the
  app's actual integrations by name has failed.
- **Duplicate `launch-readiness`.** `launch-readiness` audits the
  codebase for ship-readiness; this skill produces a manual runbook
  for verifying a deployed staging environment. They are
  complementary — run both before a launch.
