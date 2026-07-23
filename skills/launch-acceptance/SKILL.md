---
name: launch-acceptance
description: "Launch-readiness stage of the DevByAlex workflow: reconcile the staging acceptance pass into complete runnable suites: Playwright specs for every web surface and Maestro flows for iOS/Android, tied to a human-readable scenario doc. The feature loop's e2e gate accretes a golden-path flow per feature as features are built, so this stage audits that accreted suite against the critical flows, writes docs/ACCEPTANCE_TESTS.md as the scenario spec (ordered steps, explicit expected results, setup/teardown), and backfills only what is missing: cross-feature journeys, [manual] markers, staging parameterization, and coverage for features that predate the gate. Pairs with the launch-readiness and staging-smoke-test skills. Use once features are built and the app is staged, when the user says 'write the acceptance tests', 'create the staging acceptance pass', or 'prep launch verification'."
argument-hint: "[optional: staging URL or flows to focus on]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-acceptance: Write the staging acceptance suites

The launch-readiness stage. Staging deploys automatically via Pipeline by Alex
on push to `staging`; this skill produces the automated acceptance pass that runs
against that staging environment to confirm every critical flow actually works
before promoting to production: **Playwright** specs for every web surface
(`marketing/` and `web/`), **Maestro** flows for iOS and Android, both tied to
a single scenario document.

**This is a reconcile, not a from-scratch authoring pass.** The feature
loop's e2e gate (`../../knowledge/workflow/e2e-gate.md`) has been accreting a
golden-path flow per feature into `e2e/acceptance/` and
`.maestro/acceptance/` since each feature was built. Start from what exists:
map the accreted flows to scenarios, then author only the gaps
(cross-feature journeys, features that predate the gate, steps only staging
can exercise).

## When to activate

- Features are built and the app is (or is about to be) deployed to staging.
- The user says "write the acceptance tests," "staging acceptance pass," or
  "prep launch verification."

## Workflow

### Step 1: Enumerate the critical flows and surfaces
Read `docs/IMPLEMENTATION_GUIDE.md`, the feature cards, the wireframe flows, and
`docs/STATUS.md`. List the end-to-end flows a real user must be able to complete
(sign up / log in, the 3–5 core jobs, payment if any, account deletion/privacy
controls, key error paths). Prioritize critical-path over exhaustive.

Identify the app's surfaces: web (→ Playwright), iOS/Android (→ Maestro). A
flow that exists on both surfaces gets covered on both.

### Step 2: Write docs/ACCEPTANCE_TESTS.md (the scenario spec)
From `../../templates/ACCEPTANCE_TESTS.md`, write the document the runnable
suites are generated from:
- **Preconditions**: the staging URL, test accounts/credentials needed
  (placeholders, never real secrets), seed data, and how to reset between runs.
- **Per-flow scenarios**, each as ordered, unambiguous steps: the exact action
  ("click X", "enter Y"), and the **explicit expected result** after each step.
  Cover the non-happy paths too (bad input, unauthorized access).
- **Pass/fail criteria** per scenario, and an overall go/no-go.
- **Runner mapping**, which Playwright spec / Maestro flow executes each
  scenario, and which steps are `[manual]` (see Step 3).
- **Teardown**: clean up created data.

### Step 3: Reconcile and backfill the runnable suites
Inventory the flows the feature loop already accreted (`e2e/acceptance/`,
`.maestro/acceptance/`) and map each to its scenario in the doc; extend a
flow rather than duplicating it when a scenario is a superset of one. Then
translate every still-uncovered scenario into automated tests, respecting the
repo's existing conventions (reuse an existing Playwright config/e2e dir if
present):

**Web → Playwright** (e.g. `e2e/acceptance/*.spec.ts`):
- One spec file per scenario (or tightly related group), named after it
  (`01-auth.spec.ts` mirrors "Scenario 1: Sign in").
- Target staging via an env var (e.g. `STAGING_URL` / `BASE_URL`): never a
  hardcoded production URL; fail fast with a clear message if it's unset.
- Prefer user-facing locators (`getByRole`, `getByLabel`, visible text) over
  CSS internals. Use `expect` assertions that mirror the doc's expected
  results. Pure API steps (response envelopes, status codes, rate limits,
  CSRF/origin checks) use Playwright's `request` context.
- Credentials/secrets come from env vars; document them in the spec header.

**iOS/Android → Maestro** (`.maestro/acceptance/*.yaml`):
- One flow file per mobile scenario, same numbering as the doc.
- Parameterize with Maestro env vars (`${STAGING_API_URL}`, test phone
  numbers, OTP codes); reference `appId` from the app config.
- Use `assertVisible` with the exact user-facing copy the doc expects; add
  `runFlow`-able shared sub-flows for login/setup repeated across scenarios.
- Add a `config.yaml` (or flow tags) so the suite can run as one batch.

**Steps that can't be automated** (DB row inspection, third-party dashboard
checks, real SMS/email inboxes): mark them `[manual]` in the doc rather than
faking coverage. Where an API equivalent exists (e.g. verify via `GET` instead
of a DB query), automate that instead.

**Verify the suites are runnable**: `npx playwright test --list` (specs
compile and are discovered) and a Maestro syntax check on each flow. Wire the
run commands into package.json scripts (e.g. `test:acceptance:web`,
`test:acceptance:mobile`) and document them in the doc's Preconditions. Actually
**executing** them against staging is the companion `launch-verify` skill's job,
this skill authors and compile-checks the suites; `launch-verify` runs them
against the live staging environment and drives failures to green.

### Step 4: Cross-check coverage
Every critical feature in STATUS marked done must have at least one scenario,
and every scenario must map to a Playwright spec, a Maestro flow, or an
explicit `[manual]` marker. Backfill the flow for any done feature with no
acceptance coverage (features done before the e2e gate existed won't have
one); update its `E2E` cell in the STATUS features table once covered.

### Step 5: Update STATUS and route
- Check **Launch → Acceptance tests written**.
- **Next step is `launch-verify`**: it runs these suites against the live
  staging environment and drives failures to green, checking the **Acceptance
  suite passed against staging** row that `launch-submit` gates on. A written
  suite that's never run proves nothing; set `## Next action` to `/launch-verify`.
- Recommend the companion skills: `launch-visual-qa` (boots iOS + Android and
  screenshot-reviews these same flows: it reuses the Maestro flows written here),
  `staging-smoke-test` (human-walkable config/integration check), `launch-readiness`
  (codebase go/no-go audit), and `launch-compliance` (the legal / accessibility /
  SEO / prose scan that drives the two hard launch gates) before promoting to
  production. Once the app is clean, `launch-store-assets` generates the store
  listings and `launch-submit` (human-triggered) ships to TestFlight + Play internal.
- Add a log line; set `## Next action` accordingly.

## Rules

- The suites must run **without tribal knowledge**: every secret/URL is an
  env var documented in the doc's Preconditions; every expected result in the
  doc maps to an assertion or an explicit `[manual]` marker.
- Cover critical paths and key failure paths; don't try to cover everything.
- Never embed real secrets/credentials: env vars + a setup note.
- Tests target **staging**, never production; guard against an unset or
  production-looking target URL.
- This verifies staging behavior; it doesn't replace the codebase audit
  (`launch-readiness`), the config smoke test (`staging-smoke-test`), or the
  compliance scan (`launch-compliance`).

## Output

`docs/ACCEPTANCE_TESTS.md` (scenario spec + runner mapping), Playwright specs
under the repo's e2e dir, Maestro flows under `.maestro/acceptance/`, run
scripts wired into package.json, STATUS advanced, and pointers to the
launch-readiness companions.
