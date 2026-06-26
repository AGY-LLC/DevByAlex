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
  codebase readiness — data migration and environment-variable setup are
  explicitly out of scope. Use when the user asks whether a project is ready
  to launch, wants a pre-launch audit, or requests a launch checklist,
  go/no-go review, or ship-readiness assessment.
---

# Launch readiness

A structured, adversarial audit that treats the codebase as a launch
candidate and asks: *what is still unsafe, non-compliant, or fragile enough
to block shipping?*

This skill only reviews code, config that lives in the repo, and
documentation checked in alongside it. It does **not** perform or advise on:

- Data migrations or backfills.
- Provisioning or editing environment variables / secrets in hosting
  platforms.
- Anything that requires production credentials or live infrastructure
  access.

If the user asks for those things inside a launch-readiness run, flag them
as out of scope and continue with the codebase audit.

## Mindset

- **Default not-ready.** The codebase is assumed unfit to launch until
  each checklist area produces either a clean pass or an explicit
  accepted-risk note.
- **Legal and privacy copy must match behavior.** A privacy policy that
  undersells data collection or a ToS that contradicts actual feature
  behavior is a finding, not a nit.
- **Untrusted input is everywhere.** Every request body, query param,
  webhook, uploaded file, and third-party API response is hostile until
  validated.
- **Silent failure is worse than loud failure at launch.** Swallowed
  errors, missing logs, and unbounded retries all count as findings.
- **Specific beats generic.** Tie every finding to a file, symbol, route,
  or config key — never "review the auth layer carefully."
- **Earn the slot.** Comprehensiveness is not the goal — actionable signal
  is. A finding must connect to a real consequence: a user notices, a law
  is implicated, an attacker gains something, a request fails, money leaks,
  or the next change gets materially riskier. Internal tidiness with no
  observable effect is *not* a launch finding. See **Materiality bar**.

## Scope

### In scope

- Source code, templates, SQL, infrastructure-as-code and config files
  committed to the repo.
- Checked-in legal/policy documents (e.g. `PRIVACY.md`,
  `privacy-policy.tsx`, `terms.mdx`, cookie banners, consent UIs).
- Checked-in docs that make public promises users could rely on (feature
  docs, marketing copy in the repo, in-app disclosures).
- Tests, to the extent they reveal gaps in behavior the launch depends on.

### Out of scope (call out but do not act on)

- Running data migrations, seeding, or backfilling production data.
- Creating, rotating, or setting environment variables / secrets in a
  hosting provider.
- Manual production smoke tests that require live credentials.
- Anything requiring external-system access the user has not authorized.

If the audit surfaces items in these areas (e.g. "this env var must be set
before launch", "this migration needs to run first"), record them in the
**Out-of-scope launch prerequisites** section of the report so the user has
a single handoff list — but do not execute them.

## Workflow

The five checklist sections are **independent** — none of them depends on
the output of another. Run them as **parallel subagents** (fan-out +
aggregate), not as a sequential pipeline. The orchestrator does steps 1–2
itself to produce a shared briefing, fans out one subagent per section in
step 3, then merges their outputs in steps 4–5.

1. **Map the app.** Identify what the app does, who its users are, what
   data it handles, what surfaces it exposes (web, mobile, API, jobs,
   webhooks), and which third parties it integrates with. Note the stack
   and framework so checks can be framed in its idioms. Also derive any
   **app-specific concerns** worth an extra subagent (e.g. a fintech app
   needs idempotent payment handlers; a health app needs HIPAA-flavored
   handling; an AI app needs prompt-injection and cost-runaway checks).
2. **Locate the launch-relevant artifacts.** Find legal/policy copy,
   auth/session code, data-access layers, payment/PII handling, logging
   and telemetry, rate limiting, error handling, cron/queue workers, and
   any feature flags gating the launch. This becomes part of the shared
   briefing in step 3.
3. **Fan out parallel subagents.** Spawn one Agent per checklist section
   via the Agent tool (`subagent_type: general-purpose`), all in a single
   message so they run concurrently. See **Subagent orchestration** below
   for the exact briefs and required return shape. Wait for all subagents
   to return before proceeding.
4. **Merge findings.** Collect every subagent's findings into one queue.
   Reassign stable `LR-xxx` IDs in final order (severity first, then
   dependency), deduplicate issues surfaced by more than one subagent,
   and resolve cross-section `Depends on` references. Also merge each
   subagent's **pass notes**, **out-of-scope prerequisites**, and
   **coverage gaps** into the aggregate lists.
5. **Emit the report** using the structure in **Output**. Lead with a
   go/no-go verdict, then the fix queue, then the out-of-scope
   prerequisites, then passes, then coverage gaps.

## Subagent orchestration

Each of the five checklist sections below runs in its **own subagent**
via the Agent tool (`subagent_type: general-purpose`), launched in
parallel from a single message. This keeps the main conversation context
clean — each subagent audits its section inside its own context window
and returns only a structured summary. Never run the checklist sections
inline from the launch-readiness skill itself; the orchestrator's job is
briefing, merging, and reporting.

Spawn one subagent per section:

1. Legal & policy compliance
2. Data-protection & regional law compliance
3. Security
4. Performance & reliability
5. App-specific considerations (brief from the concerns derived in step 1
   of the workflow — skip this subagent only if step 1 surfaced none)
6. Grammar, spelling & copy quality

### Shared briefing

Every subagent must be able to pick up cold. Paste the following into
each subagent's prompt verbatim so they share context:

- **Target**: the repo / path / diff the user pointed the audit at (or
  "the whole repo" if unscoped).
- **App map** from workflow step 1: product, users, data handled,
  surfaces, third parties, stack.
- **Launch-relevant artifacts** from workflow step 2: file paths for
  legal copy, auth, data access, media pipeline, cron, etc.
- **Scope rules** (copied from the top of this skill): in-scope
  artifacts, out-of-scope items to flag but not act on.
- **Materiality bar** (copied from below) so subagents apply the same
  impact test and do not file findings that change nothing that matters.
- **Severity rubric** (copied from below) so severities are assigned
  consistently across subagents.
- **Output contract** (below) so the merge in workflow step 4 is
  mechanical.

### Section-specific brief

Additionally, tell each subagent:

- **Which section** it owns (one of the five in **Checklist sections**
  below) and paste that section's bullet list verbatim as its
  authoritative coverage scope.
- That it **must not** audit the other four sections — if it spots an
  issue that belongs elsewhere, it should note it as a cross-reference in
  its return but not file a finding.
- That it is forbidden from fixing anything. Output is findings only.

### Required return shape

Require each subagent to return a single structured response:

- **Findings**: list of items using the finding template from **Output
  format § Fix queue**, but with **placeholder IDs** of the form
  `<section-prefix>-001`, `<section-prefix>-002`, … (e.g. `SEC-001` for
  the security subagent, `LEG-001` for legal, `DATA-001` for data-law,
  `PERF-001` for performance/reliability, `APP-001` for app-specific,
  `COPY-001` for grammar/spelling/copy quality).
  The orchestrator reassigns stable `LR-xxx` IDs during merge.
- **Passes**: bullet list of sub-checks within the section that passed
  cleanly, each with a one-line justification.
- **Non-blocking observations**: real-but-immaterial items the subagent
  chose not to file (failed the **Materiality bar**), one line each. Keeps
  them on the record without putting them in the queue.
- **Out-of-scope prerequisites** surfaced while auditing (env vars to
  set, migrations to run, external setup needed), if any.
- **Coverage gaps**: sub-checks the subagent could not meaningfully
  assess, with what would be needed to assess them.
- **Cross-references**: one-line notes pointing at issues that belong in
  a sibling section, so the orchestrator can verify the responsible
  subagent caught them.

### Merge rules

- Assign final `LR-xxx` IDs in severity order (Blocker → High → Medium →
  Low → Note), breaking ties by dependency (a finding another depends on
  gets the lower ID).
- When two subagents surface the same underlying issue, keep the one
  with more specific **Location** / **Suggested approach** and cite the
  other subagent's placeholder ID in **Notes for implementer**.
- If a subagent's cross-reference is not covered by the responsible
  subagent, either file it as a finding yourself (cheap cases) or record
  it as a **coverage gap** (anything requiring real investigation).
- Never silently drop a finding during merge. If you disagree with a
  subagent's severity, downgrade with a one-line note rather than
  omitting.

## Checklist sections

### 1. Legal & policy compliance

Verify that user-facing legal copy is present, reachable, and **matches
the code's actual behavior**. Discrepancies between policy and code are
findings.

- **Privacy policy** exists, is linked from signup / footer / relevant
  consent flows, and accurately describes:
  - Categories of data collected (including anything collected implicitly
    — analytics, device info, IP, cookies, session replay).
  - Purposes of processing.
  - Third parties data is shared with (cross-check against SDKs, analytics
    libs, error reporters, payment processors, AI providers actually
    imported in the codebase).
  - Retention periods, if claimed, matching any deletion/archival logic.
- **Terms of service / EULA** exist, are linked, and are consistent with
  actual product behavior (e.g. ToS does not forbid something the app
  actively encourages, or vice versa).
- **Cookie / tracking consent**: if the app sets non-essential cookies or
  loads trackers, there is a consent mechanism, and trackers are gated
  behind consent in code (not just in copy).
- **Age gating / restricted content**: if the app targets or excludes a
  user age group, check the flow enforces it.
- **Marketing / feature claims** committed to the repo (landing pages,
  docs) are truthful relative to what ships.
- **Open-source license compliance**: repo has a license file if required;
  bundled third-party code retains its license/attribution.
- **Accessibility statement** if promised.

### 2. Data-protection & regional law compliance

Framework-agnostic checks against common data-protection regimes. Apply
those relevant to the app's audience; flag the rest as "verify
applicability."

- **GDPR / UK GDPR (EU/UK users):**
  - Lawful basis implied or stated for each processing purpose.
  - Data-subject rights endpoints/flows: access (export), rectification,
    deletion, portability, objection. Flag if missing or if deletion is
    soft-delete that never actually purges.
  - Consent is freely given, specific, and revocable where it is the
    basis — check the UI and the server side both honor revocation.
  - DPA / sub-processor list is discoverable if claimed.
  - International transfer mechanism acknowledged if data leaves the EU.
- **CCPA / CPRA (California users):** "Do Not Sell or Share My Personal
  Information" link/flow, opt-out honored in code paths that share data
  with advertising/analytics partners, sensitive-data handling.
- **COPPA (children under 13):** if the app could be used by children,
  verify age gate and parental consent flow, or an explicit exclusion.
- **HIPAA-adjacent (health data):** if PHI-like data is handled, check
  access logs, encryption at rest/in transit assertions in code,
  minimum-necessary access patterns. Flag if the app handles health data
  without any of these.
- **PCI-adjacent (payments):** verify card data is tokenized via the
  processor's SDK and never stored or logged in plaintext; verify the app
  is not inadvertently in scope (e.g. card fields posted to own server).
- **Data residency / localization**: if claimed, check storage and
  third-party routing actually respect it.
- **Breach-notification readiness**: some path for detecting and logging
  unauthorized access; an owner/contact for security reports in the repo
  (`SECURITY.md` or equivalent).

### 3. Security

Follow the same rigor as a pre-merge security review, but framed as
"would I be comfortable exposing this to the open internet tomorrow?"

- **Authentication**: password hashing algorithm and cost, account
  lockout/throttling, session rotation on privilege change, secure cookie
  flags (`HttpOnly`, `Secure`, `SameSite`), token expiry and revocation.
- **Authorization**: every sensitive route has an explicit check; IDOR
  risks on any resource lookup that takes a user-supplied ID; admin
  routes gated; feature-flagged admin tooling not reachable by default.
- **Input handling**: parameterized queries everywhere (no string-built
  SQL); HTML escaping / template autoescape on; file uploads validated
  for type/size and stored outside the web root; redirects use an
  allowlist; deserialization is safe.
- **Output handling**: no PII or secrets in logs, error responses,
  analytics events; stack traces not exposed to end users in production
  builds.
- **Secrets**: no hardcoded keys, tokens, or credentials in the repo or
  in committed config; `.env.example` contains placeholders only;
  `.gitignore` covers real env files.
- **Transport**: HTTPS enforced (HSTS, redirects); cookies not sent over
  HTTP; mixed-content audit on any rendered HTML.
- **Headers**: CSP, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy set for browser-served responses.
- **CSRF**: state-changing requests protected (token, same-site cookie,
  or equivalent).
- **Rate limiting / abuse**: on auth, password reset, signup, expensive
  endpoints, and any path that costs money to serve (LLM calls, outbound
  APIs, email sends).
- **Dependencies**: lockfile present and up to date; no known-critical
  advisories against pinned versions; no abandoned packages on the
  critical path.
- **Crypto**: no homegrown crypto; algorithms and modes appropriate; IVs
  / nonces not reused; constant-time comparison where relevant.
- **Webhook / third-party callbacks**: signatures verified; replay
  protection present.

### 4. Performance & reliability

- **Obvious hot-path inefficiencies**: N+1 queries, full-table scans on
  user-facing requests, synchronous external calls inside tight loops,
  unbounded pagination, heavy work on the request thread that should be
  a background job.
- **Resource leaks**: file handles, DB connections, HTTP clients, event
  listeners, timers — all released on every path including errors.
- **Timeouts everywhere**: every outbound network call has an explicit
  timeout; no `await fetch(...)` without one on critical paths.
- **Retries & idempotency**: retries exist where they make sense and are
  bounded; handlers that can be retried (webhooks, jobs, payment events)
  are idempotent.
- **Caching**: cache keys include every varying dimension; invalidation
  triggers exist for mutations; stale-while-revalidate behavior is
  intentional.
- **Error handling**: failures are surfaced (not silently swallowed),
  user-facing errors are actionable, server logs are structured enough
  to debug post-launch.
- **Frontend performance**: bundle size sane, no giant libraries pulled
  in for tiny uses, images optimized or lazy-loaded, no layout-thrashing
  patterns in critical paths.
- **Startup & health**: the app fails fast on invalid required config
  rather than silently booting in a broken state; a health/readiness
  endpoint exists if the deploy target expects one.
- **Observability**: structured logs on meaningful events, errors
  reported to something (even `console.error` wired to a reporter),
  metrics or traces if the stack supports them trivially.
- **Concurrency**: no obvious races on shared state; DB transactions
  wrap multi-step writes that must be atomic.

### 5. App-specific considerations

Derive from step 1 of the workflow. Examples — not exhaustive:

- **Payments / billing**: idempotency keys on charge creation; webhooks
  verified; refund path; prorations; tax handling if claimed.
- **AI / LLM features**: cost guardrails (max tokens, rate limits per
  user), prompt-injection handling on user-supplied content, PII in
  prompts, system-prompt leakage via model output, content filtering on
  output if user-visible.
- **User-generated content**: moderation or at least a report flow;
  storage quotas; malicious-file handling on uploads.
- **Multi-tenant SaaS**: tenant isolation on every query; no tenant ID
  trusted from the client.
- **Real-time (websockets, SSE)**: auth on connect, authorization per
  message, backpressure.
- **Mobile / offline**: conflict resolution on sync; local DB migration
  correctness; secure storage of auth tokens.
- **Jobs / crons**: at-least-once vs at-most-once semantics matched to
  handler behavior; visible failure alerting; drift if the job is late.
- **Email / SMS / push**: unsubscribe links where required by law; send
  rate limits; templates do not leak unintended data via mail-merge
  variables.
- **Analytics / telemetry**: respects consent; does not capture raw
  PII; events match what the privacy policy promises.

### 6. Grammar, spelling & copy quality

Audit all **user-facing text** committed to the repo for spelling errors,
grammar mistakes, awkward phrasing, broken interpolation, and
inconsistent voice. Typos in shipped copy erode trust on day one — treat
them as launch findings, not nits.

Cover every surface where users (or their inboxes) will see text:

- **UI strings**: page copy, button labels, form labels, placeholders,
  empty states, tooltips, modal text, navigation, settings descriptions —
  including strings inside i18n/translation files (`en.json`,
  `locales/*`, `messages.po`, etc.).
- **Error & validation messages**: thrown errors, toast messages, inline
  field errors, 4xx/5xx pages, fallback states. These are read under
  stress — typos and unclear wording hurt most here.
- **Emails & notifications**: transactional email templates (welcome,
  password reset, receipts), push-notification copy, SMS templates,
  in-app notifications.
- **Legal & policy documents**: privacy policy, terms of service, cookie
  banner copy, consent screens, EULA. Grammar/typo only — substantive
  legal accuracy is owned by the Legal & policy compliance subagent.
- **Marketing & landing copy** committed to the repo: hero text, feature
  descriptions, pricing pages, FAQ, testimonials.
- **In-repo user-facing docs**: README sections users see, help-center
  articles, onboarding walkthrough copy, changelogs that ship to users.
- **Meta & SEO**: page titles, meta descriptions, OG tags, alt text on
  shipped images.

What to flag:

- **Spelling errors** in any of the above (including misspelled product
  names, brand names, third-party service names).
- **Grammar errors**: subject-verb disagreement, wrong tense, dangling
  modifiers, comma splices in customer-visible copy, incorrect homophones
  (its/it's, your/you're, their/there/they're).
- **Punctuation & typography**: missing terminal punctuation in
  sentences, stray double spaces, mismatched quotes/brackets,
  inconsistent curly vs straight quotes within the same surface.
- **Broken interpolation**: unbalanced braces (`Hello {{ name }`), missing
  format args (`Hello %s` with no matching arg), ICU message-format
  errors, missing pluralization branches.
- **Placeholder leakage**: shipped strings containing `TODO`, `FIXME`,
  `Lorem ipsum`, `Click here`, `xxx`, dummy emails (`test@test.com`), or
  developer-only debug copy.
- **Inconsistent voice / casing**: `Sign up` vs `Sign Up` across
  buttons; product referred to as "Acme", "ACME", and "acme" across
  surfaces; tone flipping between formal and casual within the same flow.
- **Numbers, units, dates**: inconsistent date format (`MM/DD/YYYY` vs
  `DD/MM/YYYY`) within the same product; missing units; currency symbols
  hardcoded where locale should drive them.
- **Untranslated strings** in apps that ship multiple locales — keys
  present in `en` but missing in other locale files, or vice versa.
- **Accessibility-adjacent copy**: `alt=""` on meaningful images,
  generic `aria-label="button"`, link text that says only "here" or
  "read more" without context. (Full a11y audit is its own skill; flag
  only the copy-quality angle.)

Out of scope for this subagent (cross-reference, don't file):

- Whether the legal copy is *substantively* accurate vs the code — that
  belongs to the Legal & policy compliance subagent.
- Visual hierarchy, font choice, color, spacing — that's design review.
- Code comments, internal-only docs, commit messages, test fixtures,
  developer-only logs. Audit only what a user could see.

Severity guidance for this section:

- **Blocker**: typos or broken interpolation in legal copy, in payment
  flows, or any placeholder/Lorem ipsum about to ship to users.
- **High**: spelling/grammar errors in high-visibility surfaces (landing
  hero, signup flow, transactional emails, error pages).
- **Medium**: errors in less-trafficked but still user-facing copy
  (settings descriptions, secondary tooltips).
- **Low**: inconsistent capitalization or voice that does not change
  meaning; minor stylistic preferences.
- **Note**: stylistic choices the user should confirm (e.g. British vs
  American spelling — flag the inconsistency, not the choice).

## Materiality bar

Before a finding enters the fix queue it must clear this bar: a competent
engineer, told only the finding, would agree it is worth someone's time to
fix before (or shortly after) launch. Concretely, it must plausibly connect
to at least one real consequence:

- **A user notices or is harmed** — broken or confusing UX, wrong output,
  data loss, a visible copy/typo error, an accessibility barrier. Trust
  damage counts, so **user-visible copy errors and policy-vs-code
  mismatches always clear the bar** — this section never downgrades them.
- **Legal / privacy / compliance exposure** — a policy that misrepresents
  behavior, a missing required disclosure, an unmet data-subject right.
- **Security** — something an attacker can actually exploit, or that
  meaningfully widens the attack surface.
- **Correctness** — a bug that produces a wrong result, corrupts state or
  money, or a race / edge case with a realistic trigger.
- **Cost or reliability at realistic load** — a *measurable* regression, a
  resource leak, an unbounded retry, a guaranteed-to-page failure mode.
- **Future-change risk** — a genuine maintainability hazard that makes the
  next change materially riskier (not merely "could be tidier").

### Do not file (these waste triage budget)

Skip — or at most roll into the **Non-blocking observations** list — any
item that is *technically true but changes nothing that matters*:

- Micro-optimizations with no measurable impact at realistic scale (saving
  one cheap cache write, one DB read off a non-hot path, sub-millisecond
  work, a checkpoint write that is already cheap).
- Redundant-but-correct work whose redundancy has no observable cost.
- Pure style / structure refactors with identical behavior and no
  maintainability hazard.
- Re-litigating a mitigation that is already adequate just because a
  marginally nicer alternative exists.
- Hardening against a threat the architecture already precludes, or a
  "could theoretically" issue with no realistic trigger.
- Any item whose own fix note has to argue the impact is negligible — if
  you cannot state a concrete consequence, it does not earn a queue slot.

When genuinely unsure, file it at the lowest severity with **Confidence:
hypothesis** plus a one-line impact statement — but never manufacture a
consequence to justify a finding.

## Severity rubric

Severity is assigned **only after** a finding clears the **Materiality
bar**. It grades how urgent a real consequence is — it is not a way to
admit impact-free items as "just a Low."

| Level          | Meaning                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **Blocker**    | Must be fixed before launch. Legal exposure, exploitable security issue, guaranteed outage, policy lies. |
| **High**       | Should be fixed before launch. Likely to cause incident, complaint, or rework shortly after shipping.    |
| **Medium**     | Fix before launch if cheap; otherwise track and fix in the first week.                                   |
| **Low**        | Real but minor consequence (user-visible polish, hardening with a concrete payoff). Post-launch is fine. |
| **Note**       | Observation, question, or something the user should confirm rather than the skill guessing.             |

Items that fail the Materiality bar are **not** a severity level — they do
not enter the fix queue at all; they go to **Non-blocking observations**.

## Output format

Emit a single report in this order.

### 1. Go/no-go verdict

One of:

- **GO** — no Blockers, no unresolved Highs.
- **GO WITH CAVEATS** — no Blockers, but one or more Highs the user must
  explicitly accept.
- **NO-GO** — at least one Blocker, or the codebase cannot be
  meaningfully assessed (state why).

Follow with 2–4 sentences: overall risk, main themes, counts of
Blocker/High, and anything particularly load-bearing the user should know
before reading the queue.

### 2. Fix queue

Ordered list of findings. Use stable IDs `LR-001`, `LR-002`, … ordered by
severity then dependency. Use this template per finding:

```markdown
### LR-XXX — [one-line title]

| Field                  | Value                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| **Severity**           | Blocker \| High \| Medium \| Low \| Note                                                            |
| **Area**               | legal \| data-law \| security \| performance \| reliability \| app-specific \| copy                 |
| **Confidence**         | confirmed \| likely \| hypothesis                                                                   |
| **Location**           | `path/to/file.ext` — lines or symbol, or "repo-wide" when structural. Cite the narrowest anchor.    |
| **Symptom**            | What is wrong today (observable behavior, code, or missing artifact).                               |
| **Launch impact**      | What breaks, who is at risk, or what obligation is unmet if this ships as-is.                       |
| **Fix intent**         | One sentence: the desired end state or invariant.                                                   |
| **Suggested approach** | Concrete steps, patterns, APIs, or copy changes — enough to start editing without re-auditing.      |
| **Verify**             | How to prove the fix (test, grep, manual check, policy-vs-code diff).                               |
| **Depends on**         | None \| LR-YYY                                                                                      |
| **Out of scope**       | Optional: adjacent issues explicitly not covered.                                                   |
```

Rules:

- Lead with Blockers. Never bury one in an appendix.
- Every finding must be actionable inside the repo. If a finding
  fundamentally requires env-var or data-migration work, move it to
  **Out-of-scope launch prerequisites** instead.
- Every finding must clear the **Materiality bar**. An item that is true
  but changes nothing that matters does not belong here — send it to
  **Non-blocking observations** (§6) instead of filing a Low.
- Mark **Confidence: hypothesis** rather than dropping a shaky finding —
  the user can still triage it. (Low *confidence* is fine in the queue; low
  *materiality* is not — those are different axes.)

### 3. Out-of-scope launch prerequisites

Bulleted list of things the user must handle outside this skill's
authority before launch. Group as:

- **Environment variables / secrets to set** (names only, with purpose).
- **Data migrations / backfills to run** (what and why, not how).
- **External setup** (DNS, TLS certs, third-party dashboard config,
  webhook endpoints to register, app-store submissions, etc.).

Keep each item one line. This section is a handoff list, not a tutorial.

### 4. Passes

Short bulleted list of checklist sections that passed cleanly, each with
a one-line justification so the user can see what was actually checked
(not just what failed). Example:

- **Secrets hygiene** — no credentials found in repo; `.env.example`
  contains placeholders only; real env files gitignored.

### 5. Coverage gaps

If any section could not be meaningfully audited (missing source,
unfamiliar stack, legal copy not checked into the repo, etc.), list it
explicitly with what would be needed to assess it. Do **not** silently
skip.

### 6. Non-blocking observations

Real-but-immaterial items that failed the **Materiality bar** — surfaced
so nothing is silently dropped, but kept out of the fix queue so they don't
compete with work that matters. One line each, **no `LR-xxx` IDs, no
severity, excluded from all counts in the verdict**, and explicitly "no
action expected." If there are none, omit the section. Resist the urge to
promote anything here into the queue without a concrete consequence.

## When depth is limited

If the user points the skill at a subset (a single feature, a single
service in a monorepo, a diff), scope the audit to that subset but still
fan out every checklist-section subagent against it — narrow the target
in each subagent's brief, don't drop subagents. Note in the verdict that
the audit was scoped and that a full-repo pass is still needed before
launch.

## What this skill does not do

- Fix anything. Output is a report + fix queue; remediation is a
  follow-up pass (e.g. via `fix-errors` or the user directly).
- Make legal determinations. It flags mismatches between code and
  policy, and flags missing artifacts, but does not replace counsel on
  jurisdiction-specific questions. Say so when relevant.
- Touch production systems, secrets, or data.
