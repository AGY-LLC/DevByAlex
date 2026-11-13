---
name: launch-readiness
description: >-
  Runs a pre-launch checklist against the codebase to assess whether it is
  ready to ship to production users. Audits legal/policy compliance (privacy
  policy accuracy, terms of service, disclosures), data-protection law
  compliance (GDPR, CCPA, and similar), security posture (exploitable
  vulnerabilities, auth gaps, secret handling), performance and reliability
  (inefficient logic, obvious failure modes, resource leaks), copy quality
  (spelling, grammar, broken interpolation, placeholder leakage in
  user-facing text), and any app-specific launch concerns inferred from
  the code. Scope is strictly
  codebase readiness: data migration and environment-variable setup are
  explicitly out of scope. Use when the user asks whether a project is ready
  to launch, wants a pre-launch audit, or requests a launch checklist,
  go/no-go review, or ship-readiness assessment.
---

# Launch readiness

## Goal

A go/no-go verdict and a fix queue for the codebase as a launch candidate:
what is still unsafe, non-compliant or fragile enough to block shipping. It
reviews code, in-repo config and checked-in docs only; `staging-smoke-test`
covers the deployed environment.

## Done when

- **Mapped:** what the app does, its users, the data it handles, its surfaces
  (web, mobile, API, jobs, webhooks), its third parties and stack, and the
  launch-relevant files (legal copy, auth and session, data access, payments
  and PII, logging, rate limiting, error handling, workers, launch flags). The
  map also names app-specific concerns worth their own section.
- **Every section below was audited** by its own `general-purpose` subagent, all
  launched in one message, each given the target (whole repo, or the subset or
  diff the user named), the map, the Goal's scope line and, verbatim, the Out of
  scope, Materiality bar, Documented decisions and Severity bullets, the finding
  fields and its own section's coverage list. Each one audits only its section
  (issues elsewhere come back as cross-references), fixes nothing, and returns
  findings with placeholder ids (`LEG-`, `DATA-`, `SEC-`, `PERF-`, `APP-`,
  `COPY-`), passes with a one-line why, non-blocking observations, out-of-scope
  prerequisites, coverage gaps and cross-references. A scoped run still runs
  every section against the subset and its verdict says a full pass is still
  needed before launch.
  1. **Legal and policy:** the privacy policy exists, is linked from signup,
     footer and consent flows, and matches the code on data collected
     (including analytics, device info, IP, cookies, session replay),
     purposes, third parties (checked against the SDKs, analytics, error
     reporting, payment and AI providers actually imported) and retention
     (against deletion logic); terms are linked and consistent with what the
     product does; non-essential cookies and trackers are gated on consent in
     code, not just copy; age gating is enforced where the app targets or
     excludes an age group; marketing claims in the repo match what ships;
     open-source licenses and attribution kept; an accessibility statement if
     promised.
  2. **Data-protection law,** for the regimes that apply (others flagged "verify
     applicability"): GDPR and UK GDPR (lawful basis per purpose; access,
     rectification, deletion that actually purges, portability and objection;
     consent freely given and revocable on server and UI; a sub-processor list
     if claimed; the transfer mechanism if data leaves the EU); CCPA and CPRA (a
     Do Not Sell or Share link whose opt-out every code path sharing data with
     ad or analytics partners honors; sensitive-data limits); COPPA (age gate
     and parental consent, or an explicit exclusion); health data (access logs,
     encryption, least access); payments (card data tokenized by the processor,
     never on the app's server or in logs); data residency if claimed; a
     `SECURITY.md` or equivalent contact and some way to detect and log
     unauthorized access.
  3. **Security**, as "exposed to the open internet tomorrow": authentication
     against `docs/features/authentication.md` and `docs/adr/auth.md` and the
     current auth regression evidence (only the specified methods; Create
     account and Sign in separate; signup-only age or consent can't bleed;
     optional account management as specified; linking needs proof and keeps the
     last usable method; roles, ownership and tenant rules deny by default on
     every request; public failures resist enumeration; recovery and step-up
     replay-safe and returning in context; where passwords exist, hashing
     algorithm and cost and complete add, change and reset; always throttling,
     session rotation, `HttpOnly`, `Secure`, `SameSite`, token expiry and
     revocation); an explicit authorization check on every sensitive route, no
     IDOR on user-supplied ids, admin and flagged admin tooling gated;
     parameterized queries, autoescaping, uploads validated and stored outside
     the web root, allowlisted redirects, safe deserialization; no PII or
     secrets in logs, errors or analytics, no production stack traces; no
     committed secrets, `.env.example` names only, real env files gitignored;
     HTTPS with HSTS, no mixed content; CSP, `X-Content-Type-Options`,
     `Referrer-Policy`, `Permissions-Policy`; CSRF protection on state changes;
     rate limits on auth, reset, signup, expensive endpoints and anything that
     costs money (LLM, outbound APIs, email); a current lockfile with no
     critical advisories or abandoned critical-path packages; no homegrown
     crypto or weak algorithms and modes, no reused nonces, constant-time
     comparison; verified, replay-protected webhooks.
  4. **Performance and reliability:** no N+1, full scans, sync calls in loops,
     unbounded pagination or request-thread work that belongs in a job; no
     leaked handles, connections, listeners or timers on any path; a timeout on
     every outbound call; bounded retries and idempotent retried handlers
     (webhooks, jobs, payments); cache keys cover every varying dimension and
     mutations invalidate; failures surfaced and user errors actionable; sane
     bundles and lazy or optimized images; fail fast on invalid config and a
     health endpoint where the host expects one; structured logs and error
     reporting; no races on shared state, transactions around multi-step writes.
  5. **App-specific,** from the map (skipped only when the map found none): for
     example payment idempotency, refunds and tax; LLM cost caps, prompt
     injection, PII in prompts, system-prompt leakage and output filtering where
     the output is user-visible; UGC moderation or a report flow, quotas,
     malicious files; tenant isolation with no client-trusted tenant id;
     realtime auth on connect and per message, backpressure; offline sync
     conflicts, local migrations, secure token storage; job delivery semantics,
     failure alerts, lateness; email, SMS and push unsubscribe, send limits, no
     leaking merge variables; analytics that respects consent, captures no raw
     PII and matches the policy.
  6. **Copy quality** of everything a user can see (UI and i18n strings, errors
     and validation, emails, push and SMS, legal copy for grammar only,
     marketing, user-facing docs, titles, meta, OG and alt text): spelling
     (product, brand and service names too), grammar and homophones, punctuation
     and quote consistency, broken interpolation (unbalanced braces, missing
     args, ICU and plural branches), placeholder leakage (`TODO`, `FIXME`, Lorem
     ipsum, `test@test.com`, debug copy), inconsistent casing, naming and tone,
     dates, units and currency, untranslated keys, and the copy side of
     accessibility (meaningful `alt`, real `aria-label`s, link text). Code
     comments, internal docs, fixtures and design are out of scope. Severity:
     Blocker for errors in legal or payment copy and any shipping placeholder;
     High for the landing hero, signup, transactional email and error pages;
     Medium for secondary copy; Low for casing or voice; Note for a mixed
     convention like British and American spelling (flag the inconsistency, not
     the choice).
- **Merged:** findings deduplicated (the more specific one kept, the other's
  id cited), final `LR-001...` ids in severity then dependency order,
  `Depends on` resolved, every cross-reference either covered, filed or
  listed as a coverage gap, and nothing dropped (a severity disagreement is a
  downgrade with a one-line note).
- **Reported,** in this order:
  1. **Verdict:** GO (no Blockers or unresolved Highs), GO WITH CAVEATS (Highs
     the user must accept) or NO-GO (a Blocker, or the code can't be
     assessed, with why), plus 2 to 4 sentences on risk, themes and the
     Blocker and High counts.
  2. **Fix queue,** Blockers first, each `### LR-XXX: title` with Severity,
     Area (legal, data-law, security, performance, reliability,
     app-specific, copy), Confidence (confirmed, likely, hypothesis), the
     narrowest Location, Symptom, Launch impact, Fix intent (one sentence),
     Suggested approach (enough to start editing), Verify, Depends on, and
     optionally Out of scope.
  3. **Out-of-scope prerequisites,** one line each: env vars and secrets to
     set (names and purpose), migrations or backfills to run (what and why),
     external setup (DNS, TLS, dashboards, webhook registration, store
     submission).
  4. **Passes,** each with a one-line why, so the user sees what was
     checked.
  5. **Coverage gaps** and what would be needed to assess each; never a
     silent skip.
  6. **Non-blocking observations,** one line each, no ids or severity,
     outside every count, "no action expected"; omitted when empty.

## Decisions (and why)

- **Default not-ready.** A section counts only with a clean pass or an
  explicit accepted-risk note. Why: launch is where silent assumptions cost
  the most.
- **Legal and privacy copy must match behavior.** A policy that undersells
  collection or terms that contradict a feature is a finding, not a nit.
- **Untrusted input everywhere, and silent failure is worse than loud.** Every
  body, param, webhook, upload and third-party response is hostile until
  validated; swallowed errors, missing logs and unbounded retries are
  findings.
- **Parallel subagents, one per section.** Why: the sections are independent,
  and each audits in its own context and returns only a summary, so the
  orchestrator stays free to brief, merge and report.
- **Materiality bar: a finding must earn its slot.** A competent engineer told
  only the finding agrees it is worth fixing near launch because it connects to
  a real consequence: a user notices or is harmed (user-visible copy errors and
  policy-versus-code mismatches always qualify), legal or privacy exposure, an
  exploitable or meaningfully wider attack surface, a wrong result or corrupted
  state or money, a measurable cost or reliability problem at realistic load, or
  a next change made materially riskier. Not filed (at most a non-blocking
  observation): micro-optimizations, redundant-but-harmless work,
  behavior-identical refactors, re-arguing an adequate mitigation, threats the
  architecture precludes or that have no realistic trigger, and anything whose
  fix note has to argue the impact is negligible. When unsure, file at the
  lowest severity with Confidence hypothesis and a one-line impact; never
  manufacture a consequence. Why: actionable signal, not completeness, is the
  point.
- **Documented decisions are settled.** An `active` entry or deliberate omission
  in `docs/adr/` is cited, not refiled, except: legal, privacy, security and
  accessibility items are still filed tagged `ADR-conflict` (the two hard launch
  gates are never overridable by an ADR); concrete evidence a decision causes
  real harm is filed tagged `ADR-challenge`, citing the entry and the evidence,
  for Alex only; and code that contradicts an `active` entry with no
  supersession is a drift finding. Why: an ADR blocks blind change, not
  criticism.
- **Severity only after the bar.** Blocker: must be fixed before launch
  (legal exposure, exploitable security, guaranteed outage, policy that lies).
  High: should be fixed before launch, likely incident, complaint or rework.
  Medium: fix if cheap, else in week one. Low: real but minor, post-launch is
  fine. Note: something the user should confirm. Low confidence can sit in
  the queue; low materiality cannot.
- **Specific beats generic.** Every finding names a file, symbol, route or
  config key, never "review the auth layer".
- **Out of scope, handed off rather than done:** data migrations and
  backfills, setting env vars or secrets in a host, smoke tests needing live
  credentials, and anything needing access the user hasn't given. A finding
  that can only be fixed there moves to the prerequisites list.

## Hard rules

- Findings only: fix nothing (remediation is `fix-errors` or the user), and
  never touch production systems, secrets or data.
- No legal determinations: flag mismatches and missing artifacts, and say
  when a question needs counsel.
- Never run the sections inline in the orchestrator, and never drop a
  section from a scoped run.
