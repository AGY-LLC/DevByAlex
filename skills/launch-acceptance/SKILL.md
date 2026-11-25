---
name: launch-acceptance
description: "Writes the staging acceptance suites: docs/ACCEPTANCE_TESTS.md as the scenario spec, Playwright specs for web and Maestro flows for iOS/Android. Reconciles the golden-path flows the feature loop already accreted and backfills only the gaps (cross-feature journeys, features that predate the e2e gate, the full auth matrix, [manual] steps). Use once features are built and the app is staged, when the user says 'write the acceptance tests', 'create the staging acceptance pass' or 'prep launch verification'. Running them is launch-verify."
argument-hint: "[optional: staging URL or flows to focus on]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-acceptance: Write the staging acceptance suites

## Goal

Every critical flow has an acceptance scenario that a runner can execute
against staging without tribal knowledge: Playwright for web (`marketing/` and
`web/`), Maestro for iOS and Android, both tied to one scenario document. It
starts from the golden-path flows the feature loop's e2e gate
(`../../knowledge/workflow/e2e-gate.md`) already accreted in `e2e/acceptance/`
and `.maestro/acceptance/`, and authors only the gaps.

Before starting: features are built and staging is deployed or about to be.
Read `docs/IMPLEMENTATION_GUIDE.md`, the feature cards, the wireframe flows,
`docs/STATUS.md` and `docs/features/authentication.md`.

## Done when

- `docs/ACCEPTANCE_TESTS.md` (from `../../templates/ACCEPTANCE_TESTS.md`)
  covers the 3 to 5 core jobs, payment if any, account deletion and privacy
  controls, and key error paths, each as ordered steps with an explicit
  expected result per step, non-happy paths included. It has Preconditions
  (staging target, test accounts as env-var placeholders, seed data, reset),
  pass/fail per scenario with an overall go/no-go, a runner mapping, and
  teardown.
- Authentication is covered exhaustively, not by one login flow: Create
  account and Sign in for every enabled method, recovery, the specified
  account-management posture, every role, ownership and tenant denial
  boundary, safe public failures and fresh-auth step-up. Every acceptance
  criterion in `docs/features/authentication.md` maps to automation or an
  honest `[manual]` marker.
- A flow on both web and mobile is covered on both. Every done feature in
  STATUS has at least one scenario, and its `E2E` cell is current.
- Every scenario maps to a Playwright spec, a Maestro flow, or `[manual]` (DB
  inspection, third-party dashboards, real inboxes), automated through an API
  equivalent where one exists, and every expected result in the doc maps to an
  assertion or an explicit `[manual]` marker.
- The suites are runnable: `npx playwright test --list` discovers every spec,
  each Maestro flow passes a syntax check, and `test:acceptance:web` /
  `test:acceptance:mobile` are in package.json and documented in
  Preconditions.
- STATUS has **Launch → Acceptance tests written** checked with a log line,
  and `## Next action` is `/launch-verify`.

## Decisions (and why)

- **Reconcile, don't re-author.** Map accreted flows to scenarios and extend a
  flow rather than duplicate it. Why: the gate's flows already pass against
  the built features; rewriting them adds risk, not coverage.
- **Critical paths and key failure paths only, except auth.** Why: broad
  acceptance suites go flaky and stop being trusted; auth is the deliberate
  exception because a missed boundary is a breach.
- **User-facing locators and copy** (`getByRole`, `getByLabel`, visible text;
  Maestro `assertVisible` with the doc's exact copy), shared sub-flows for
  repeated setup, and the repo's existing e2e config and conventions. Why:
  tests tied to CSS internals break on every redesign. Pure API steps use
  Playwright's `request` context.
- **Author and compile-check only; `launch-verify` runs them.** Why: writing a
  suite and proving it passes are different jobs.
- **Acceptance is one launch check among several:** `launch-visual-qa` (reuses
  these Maestro flows), `staging-smoke-test`, `launch-readiness` and
  `launch-compliance` stay separate, before `launch-store-assets` and
  `launch-submit`.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Staging only: every target comes from an env var (`STAGING_URL`,
  `BASE_URL`, `STAGING_API_URL`), and a spec fails fast on an unset or
  production-looking target.
- Secrets and test credentials come from env vars, documented in the spec
  header and Preconditions; never real secrets or user data.
- Never fake coverage: a step that can't be automated is `[manual]`.
