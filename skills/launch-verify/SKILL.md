---
name: launch-verify
description: "Launch-readiness stage of the DevByAlex workflow — actually RUN the acceptance suite against the live staging environment and drive failures to green. This is the runner half of the author/run split: `launch-acceptance` writes the Playwright (web) + Maestro (iOS/Android) suites; this executes them against staging, triages every failure into an IDed ACC-xxx fix queue routed to fix-errors, re-runs until the suite is green (or remaining failures are explicit blockers), and only then checks the 'Acceptance suite passed against staging' STATUS row that `launch-submit` gates on. Closes the loop most builders leave open — a written-but-never-run acceptance suite proves nothing. Detects the run commands wired into package.json (`test:acceptance:web`, `test:acceptance:mobile`) and the Maestro flows under `.maestro/acceptance/`, resolves the staging target from env, and refuses to run against a production-looking URL. Read-and-run + route; remediation is fix-errors. Use once `launch-acceptance` has written the suites and staging is deployed, when the user says 'run the acceptance tests', 'run the acceptance suite against staging', 'is the acceptance suite green', or 'verify staging'."
argument-hint: "[optional: staging URL, or a surface to focus on — web | mobile | both (default both)]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-verify — Run the acceptance suite against staging and drive it green

A written acceptance suite proves nothing until it runs. `launch-acceptance`
authors the Playwright + Maestro suites and only verifies they *compile*; this
skill **executes** them against the live staging environment, triages every
failure, drives the fixes to green, and produces the single fact `launch-submit`
gates on: **the acceptance suite passed against staging.**

It is the runner to `launch-acceptance`'s author — kept separate for the same
reason `test-author` and `feature-validator` are: writing the suite and proving
it passes are different jobs, and merging them lets a green-looking suite that
was never run slip through. This skill **runs and routes — it does not write new
scenarios** (gaps go back to `launch-acceptance`) and **does not fix**
(remediation is `fix-errors`).

## When to activate

- `launch-acceptance` has written `docs/ACCEPTANCE_TESTS.md` and the suites, and
  the app is deployed to staging (Pipeline by Alex deploys on push to `staging`).
- The user says "run the acceptance tests," "run the acceptance suite against
  staging," "is the acceptance suite green," or "verify staging."

## Prerequisites

- **The suites exist.** Playwright specs under the repo's e2e dir and/or Maestro
  flows under `.maestro/acceptance/`, with `test:acceptance:web` /
  `test:acceptance:mobile` wired into package.json (all produced by
  `launch-acceptance`). If they're missing, stop and route to `/launch-acceptance`
  first — this skill runs suites, it doesn't invent them.
- **Staging is up and reachable.** The staging URL/API target resolves from env
  (`STAGING_URL` / `BASE_URL` / `STAGING_API_URL`, per the doc's Preconditions).
  If staging isn't deployed or the target is unset, stop and say so — don't run
  against localhost or production.
- **Runners installed.** `npx playwright test` available for web; **Maestro** plus
  an **iOS simulator** and/or **Android emulator** for mobile. If a runner is
  missing, run the surface you can, mark the other `[skipped]` with the reason,
  and never imply full coverage.
- **Test credentials/seed** available as env vars (never real secrets), per the
  doc's Preconditions.

## Workflow

### Step 1 — Resolve the target and guard it
Read `docs/ACCEPTANCE_TESTS.md` Preconditions and confirm the staging target from
env. **Refuse to run against a production-looking URL** (the app's real apex/prod
host, or anything not clearly staging) — fail fast with a clear message, exactly
as the suites themselves are told to. Confirm the test accounts/seed are set.
Decide the surfaces in scope (default **both** web + mobile; honor a `web` /
`mobile` argument or a missing-runner skip).

### Step 2 — Run the suites against staging
- **Web → Playwright:** run the wired command (`pnpm test:acceptance:web` or
  `npx playwright test e2e/acceptance`) against the staging `BASE_URL`. Capture
  the full reporter output, the JUnit/JSON results, and the trace/screenshot
  artifacts Playwright emits on failure.
- **Mobile → Maestro:** boot the simulator/emulator, install the staging build,
  and run the acceptance flows (`maestro test .maestro/acceptance/` or
  `pnpm test:acceptance:mobile`) parameterized with the staging env. Capture each
  flow's pass/fail and the failure screenshots Maestro emits.
- Save run artifacts under `docs/acceptance-runs/<run-date>/` (or the repo's
  existing results dir), grouped by surface. Record which surfaces actually ran
  and which were `[skipped]` and why.

Drive every run from **seed/test accounts**, never real user data.

### Step 3 — Triage failures into an ACC-xxx queue
For each failing scenario, separate the two causes — they route differently:
- **Real app/staging defect** (the app behaves wrong, a flow is broken, an env is
  mis-wired): file an `ACC-xxx` finding with a severity (`blocker` / `high` /
  `medium` / `low`), the failing scenario + step, the expected-vs-actual from the
  doc, the artifact path (trace/screenshot), the surface(s), and the likely source
  file. When realness is ambiguous (flaky vs genuine), confirm with `issue-checker`
  before queueing — don't spend fixes on a phantom or a flake.
- **Stale/incorrect test** (the app is right, the assertion or selector drifted):
  note it as a `[suite-fix]` ACC item — the assertion/locator is corrected to match
  intended behavior, not the test deleted to force green. If a *scenario is
  missing* (a done feature with no coverage surfaced by the run), route that gap
  back to `/launch-acceptance` rather than writing it here.

Write the queue to `docs/acceptance-runs/<run-date>/FINDINGS.md` and surface the
top items inline.

### Step 4 — Drive to green and re-run
- Hand the `ACC-xxx` queue to `fix-errors` to drive to zero (app defects and
  `[suite-fix]` items alike).
- **Re-run the affected suites against staging after fixes** — a fix isn't done
  until the scenario passes against the live environment, not just until the code
  changed. Loop run → triage → fix → re-run until the suite is green or the
  remaining failures are explicit, reasoned STATUS blockers (e.g. a `[manual]`
  step or a `[skipped]` surface). Never edit a test purely to make it pass.
- Quarantining a genuinely flaky test is allowed only with a recorded reason and a
  follow-up blocker — not as a way to hide a real failure.

### Step 5 — Update STATUS and route
- Check **Launch → Acceptance suite passed against staging** only when every
  in-scope surface's suite is green (or remaining items are explicitly deferred
  with reasons + a skipped-surface note). This is the row `launch-submit` reads as
  "acceptance suite green."
- If failures remain, leave the row unchecked, list the open `ACC-xxx` items as
  blockers, and set `## Next action` to `/fix-errors`.
- Recommend the companions still pending: `launch-visual-qa` (proves the same
  flows *look* right), `launch-compliance` (legal/a11y/SEO/prose),
  `staging-smoke-test` (human config/integration check), and `launch-readiness`
  (codebase go/no-go) before `launch-store-assets` → `launch-submit`.
- Add a log line recording which surfaces ran, the pass/fail counts, and any skips.

## Rules

- **Run, don't author.** This executes the suites and routes failures; new
  scenarios are `launch-acceptance`'s job, fixes are `fix-errors`'.
- **Staging only, guarded.** Resolve the target from env and refuse a production-
  looking or unset URL — same guard the suites enforce.
- **Green means actually green.** Never weaken or delete an assertion to force a
  pass; a `[suite-fix]` corrects drift to match intended behavior, nothing more.
- **Both surfaces or say which you skipped.** Never imply full coverage when only
  web or only mobile ran; record the skip and why.
- **No real data or secrets** — seed/test accounts from env, documented.
- This proves flows *work* against staging; it doesn't replace the visual pass
  (`launch-visual-qa`), the config smoke test (`staging-smoke-test`), the codebase
  audit (`launch-readiness`), or the compliance scan (`launch-compliance`).

## Output

Run artifacts under `docs/acceptance-runs/<run-date>/` per surface, an `ACC-xxx`
fix queue in `FINDINGS.md` routed to `fix-errors`, re-run-to-green results, the
**Acceptance suite passed against staging** launch row in `docs/STATUS.md`
reconciled (the gate `launch-submit` reads), and pointers to the remaining launch
companions.
