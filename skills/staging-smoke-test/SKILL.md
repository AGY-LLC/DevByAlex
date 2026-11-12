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

## Goal

A human operator has a checklist, tailored to this app, that catches anything
that compiles and deploys but isn't wired up correctly in staging: wrong env
vars or credentials, unpromoted migrations, unconnected services, staging
quietly talking to production. This skill writes the checklist; walking it is
the operator's job.

## Done when

- The repo was mapped first: stack and deploy target; surfaces (web, mobile,
  API, CLI, admin, docs site); roles (anonymous, user, admin, tenant admin, API
  consumer, service account); every third-party SDK by name; async paths (jobs,
  queues, cron, webhooks in and out, pub/sub); configuration-gated features;
  and everything `.env.example`, config, infra and deploy files say differs
  between staging and prod (keys, webhook, callback and OAuth redirect URLs,
  database URLs, CDN and sender domains, allowed origins, flag values).
- `docs/staging-smoke-test.md` exists with run metadata (operator, time,
  staging SHA, release link), sections in the order below, `- [ ]` items each
  ending "→ Expected: ..." with an outcome the operator can observe (UI,
  dashboard, DB row, log line, inbox), and a sign-off block: every item checked
  or ticketed, no new staging errors beyond deliberate ones, no traffic hit
  production, and a GO / GO WITH FOLLOW-UPS / NO-GO verdict with signature
  and time.
- Sections cover whatever applies, dropped only when truly absent, plus named
  sections for anything app-specific (domain workflows, regulated data, LLM
  safety, bookings, devices):
  1. **Preflight:** staging URL and visible environment badge (its absence is
     a finding), `robots.txt` disallows, build SHA matches, staging DB is not
     prod.
  2. **Auth**, from `docs/features/authentication.md` (password is optional):
     Create account and Sign in separately for each enabled method (signup-only
     13+ affirmation, no silent sign-in or mutation of an existing account),
     logout invalidation, recovery and password lifecycle only where specified,
     each OAuth provider against staging's app and callback, magic link or
     OTP expiry, the safe-response contract (no account enumeration), account
     management and last-method protection if specified, every role,
     ownership and tenant denial, fresh-auth step-up, MFA, session expiry and
     refresh, deletion and export actually purging or exporting.
  3. **Core flows**, one per real journey, named for it.
  4. **Role-based access:** anonymous, wrong role, admin, cross-tenant.
  5. **Persistence:** create, reload, re-login, second browser, delete.
  6. **Uploads and media:** served from staging's bucket or CDN, type and
     size limits, signed URL expiry, transforms.
  7. **One block per integration actually shipped**, proving it lands in the
     staging or test project, never live (payments in test mode, email,
     SMS, analytics, error reporting, search, AI, storage, auth provider,
     flags, push, CDN).
  8. **Webhooks:** outbound signed to staging, inbound with signature
     enforced.
  9. **Jobs, queues and cron:** processed on the staging worker, no
     unexpected dead letters, recent last runs.
  10. **Realtime**, where it exists.
  11. **Search, filters, pagination, sorting**, including empty and
      past-the-end.
  12. **Error and edge states:** branded 404 and 500 (reported to
      monitoring), form errors with focus, offline if claimed, 429s.
  13. **Performance sniff:** cold load, heaviest view, no requests to
      localhost, prod or 404ing assets.
  14. **Observability:** the run's requests, errors and events appear in the
      staging projects; uptime green.
  15. **Legal and plumbing:** policy links, consent banner persists,
      unsubscribe works, support routes to staging.
  16. **Mobile:** about 375px web, and the mobile build pointing at the
      staging API.
  17. **Accessibility sniff:** keyboard focus and order, landmarks and labels
      announced, 200% zoom.
  18. **Rollback readiness:** the rollback path and migration recovery are
      known (not exercised unless asked).
- The user is told in one sentence where the file is and how many items it
  holds.

## Decisions (and why)

- **Assume misconfiguration, and prove the wire.** "Log in, then see the new
  session in the staging auth dashboard", not "log in". Why: the code
  probably works; the environment is the suspect.
- **Every surface, role and integration by name.** Why: "check third-party
  services work" catches nothing; a checklist that doesn't name the app's
  actual integrations has failed.
- **Include the boring items** (health, favicon, robots, 404, logout
  redirect, deliverability, signatures, cron timestamps). Why: they catch the
  biggest configuration mistakes.
- **Complements `launch-readiness`,** which audits the code; this verifies
  the deployed environment. Run both before launch.

## Hard rules

- Write the document only: never run the checks, open a browser, log in or
  call staging or production.
- Read an existing `docs/staging-smoke-test.md` first and keep operator notes
  outside the generated structure; a clean rewrite only when asked.
- A smoke test that touches production data has failed.
