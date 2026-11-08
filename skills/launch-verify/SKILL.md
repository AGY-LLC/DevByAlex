---
name: launch-verify
description: "Runs the acceptance suite against live staging and drives failures to green. Use when the user says 'run the acceptance tests', 'run the acceptance suite against staging', 'is the acceptance suite green' or 'verify staging', once launch-acceptance has written the suites and staging is deployed. Runs Playwright (web) and Maestro (mobile), triages failures into an IDed ACC-xxx queue for fix-errors, re-runs until green or blocked, then checks the STATUS row launch-submit gates on. Refuses production-looking URLs."
argument-hint: "[optional: staging URL, or a surface to focus on: web | mobile | both (default both)]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-verify: Run the acceptance suite against staging and drive it green

## Goal

The acceptance suites `launch-acceptance` wrote have actually run green
against live staging, which is the single fact `launch-submit` gates on: the
**Acceptance suite passed against staging** row in STATUS. A written suite
proves nothing until it runs.

Before starting: the suites exist (Playwright under the e2e dir, Maestro under
`.maestro/acceptance/`, `test:acceptance:web` / `test:acceptance:mobile` in
package.json; else route to `/launch-acceptance`), staging is deployed and its
target resolves from env (`STAGING_URL` / `BASE_URL` / `STAGING_API_URL` per
`docs/ACCEPTANCE_TESTS.md` Preconditions), and seed test accounts are set as
env vars.

## Done when

- Each in-scope surface (default web and mobile, or the one passed) ran
  against staging: Playwright for web, Maestro on a simulator or emulator with
  the staging build for mobile. A surface with no runner is marked
  `[skipped]` with the reason.
- Run artifacts (reporter output, results, traces, screenshots) are under
  `docs/acceptance-runs/<run-date>/` by surface.
- Every failure is triaged in `docs/acceptance-runs/<run-date>/FINDINGS.md`:
  - a real app or staging defect becomes an `ACC-xxx` finding with severity,
    scenario and step, expected vs. actual, artifact path, surface and likely
    source file (`issue-checker` first when it might be a flake);
  - a drifted assertion or selector becomes a `[suite-fix]` item that corrects
    it to the intended behavior;
  - a missing scenario goes back to `/launch-acceptance`.
- `fix-errors` drove the queue to zero and the affected suites re-ran green
  against staging, or the remaining items are explicit STATUS blockers.
- STATUS has the row checked only when every in-scope surface is green (with
  any skipped surface noted); otherwise the row stays unchecked, open `ACC-xxx`
  items are blockers and `## Next action` is `/fix-errors`. A log line records
  the surfaces run, pass and fail counts, and skips.
- The report names the launch companions still pending: `launch-visual-qa`,
  `launch-compliance`, `staging-smoke-test` and `launch-readiness`, before
  `launch-store-assets` and `launch-submit`.

## Decisions (and why)

- **Run and route; don't author or fix.** New scenarios belong to
  `launch-acceptance` and fixes to `fix-errors`. Why: writing a suite and
  proving it passes are different jobs; merged, a never-run suite can look
  green.
- **A fix counts only when the scenario passes against staging,** not when the
  code changed. Why: staging is what users will hit.
- **Flows working is not the whole launch check.** Visual QA, the config smoke
  test, the codebase audit and the compliance scan stay separate skills.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Staging only: refuse a production-looking or unset target.
- Never weaken or delete an assertion to force green. A genuinely flaky test
  may be quarantined only with a recorded reason and a blocker, and the row
  stays unchecked while it is.
- Never imply full coverage when a surface was skipped.
- Seed test accounts from env only; no real user data or secrets.
