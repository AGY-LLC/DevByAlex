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
  staging SHA, release link), an opening line that a failed item stops the
  run until it is ticketed, sections in the order below, `- [ ]` items each
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
     for each enabled method, Create account (one account, verification
     completes, any required 13+ affirmation unchecked and signup-only, never
     signs in or changes an existing account) and Sign in (never creates an
     account, lands on the post-login surface, session cookie flags correct)
     separately; logout invalidation; recovery as specified, and password
     reset and change whenever passwords exist (old password stops working),
     add only where specified; each OAuth provider against staging's app and
     callback; magic link or OTP delivery and expiry; the safe-response
     contract (nonexistent account, wrong credential or method,
     existing-account Create account and recovery reveal nothing through copy,
     status or response shape, and each offers a next action); account
     management as specified (one user per method, change notices, last usable
     method protected) and its UI and mutation endpoints absent when out of
     scope; each role allowed only its operations, with wrong-role,
     wrong-owner, direct-endpoint, stale-access and cross-tenant attempts
     denied and grants and revokes taking effect; fresh-auth step-up returning
     to the confirmation point without auto-executing, and rejecting cancel,
     failure, expiry, tampering and replay; MFA; session expiry and refresh
     rotation; deletion and export actually purging or exporting.
  3. **Core flows**, one per real journey, named for it.
  4. **Role-based access:** anonymous redirected with no data in HTML or
     JSON, wrong role gets 403 or 404 not a partial render, admin sees staging
     data, cross-tenant read by ID denied.
  5. **Persistence:** create, reload, re-login, second browser, delete.
  6. **Uploads and media:** served from staging's bucket or CDN, type and
     size limits, signed URL expiry, transforms.
  7. **One block per integration actually shipped**, proving it lands in the
     staging or test project, never live: payments in test mode end to end
     (webhook fires, order marked paid in the staging DB); email and SMS from
     staging's sender with every link pointing at staging; error reports
     tagged with the staging release; then analytics, search, AI, storage,
     auth provider, flags (prod unaffected), push (staging bundle), CDN.
  8. **Webhooks:** outbound signed to staging's receiver; inbound sent from
     the provider's staging dashboard returns 2xx with its side effect
     visible, and a bad signature is rejected.
  9. **Jobs, queues and cron:** processed on the staging worker, no
     unexpected dead letters, recent last runs.
  10. **Realtime**, where it exists: two browsers update each other; drop
      and reconnect reconciles.
  11. **Search, filters, pagination, sorting**, including empty and
      past-the-end.
  12. **Error and edge states:** branded 404 and 500 (reported to
      monitoring), form errors with focus, offline if claimed, 429s.
  13. **Performance sniff:** cold load, heaviest view, no requests to
      localhost, prod or 404ing assets.
  14. **Observability:** the run's requests, errors and events appear in the
      staging projects; uptime green.
  15. **Legal and plumbing:** policy links load real, current versions,
      consent banner persists, unsubscribe works, support routes to staging.
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
- No item points the operator at production or a live-mode account; every
  external account it names is the staging or test one.
