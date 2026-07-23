# {{APP_NAME}}: Staging Acceptance Tests

> Written by `/launch-acceptance`. The scenario spec for the automated staging
> acceptance pass: **Playwright** executes the web scenarios, **Maestro**
> executes the iOS/Android scenarios. The per-feature golden-path flows were
> accreted by the feature loop's e2e gate as each feature was built; this doc
> maps them to scenarios and adds the backfilled gaps (cross-feature
> journeys, pre-gate features). Every expected result is stated
> explicitly and maps to an assertion in the runner (or an explicit
> `[manual]` marker): assume no insider knowledge.

**Target:** {{STAGING_URL}}
**Updated:** {{DATE}}

## Runners

| Surface | Runner | Location | Run command |
|---------|--------|----------|-------------|
| Web | Playwright | `e2e/acceptance/` | `STAGING_URL=… pnpm test:acceptance:web` |
| iOS / Android | Maestro | `.maestro/acceptance/` | `maestro test .maestro/acceptance/ -e STAGING_API_URL=…` |

## Preconditions

- **Environment:** staging at the URL above; runners read it from env vars
  (`STAGING_URL` / `STAGING_API_URL`) they must refuse to run if unset.
- **Test accounts:** _e.g. `tester+acceptance@example.com` / `<placeholder>`,
  never put real secrets here; pass credentials via env vars and note where
  the runner gets them._
- **Seed data:** _what must exist before the run._
- **Reset:** _how to return staging to a clean state between runs._

## Scenarios

### Scenario 1: _Sign up & log in_
**Goal:** a new user can create an account and reach the app.
**Runners:** web `e2e/acceptance/01-auth.spec.ts` · mobile `.maestro/acceptance/01-auth.yaml`

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Go to `{{STAGING_URL}}` | Landing page loads; "Sign up" is visible |
| 2 | Click "Sign up", enter a new email + password, submit | Account created; redirected to onboarding/dashboard |
| 3 | Log out, then log back in with the same credentials | Returns to the dashboard |
| 4 | Attempt login with a wrong password | Clear error; no access granted |

**Pass criteria:** steps 1–3 succeed; step 4 is correctly rejected.

### Scenario 2: _<Core job>_
**Goal:** _…_
**Runners:** _web spec / mobile flow / `[manual]`_

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | _…_ | _…_ |

**Pass criteria:** _…_

<!-- one scenario per critical flow; include key failure paths and
authorization checks (a user cannot access another user's data).
Steps that cannot be automated (DB row inspection, third-party dashboards,
real SMS/email inboxes) are marked [manual] in the Action column and excluded
from the runner suites: do not fake coverage. -->

## Teardown

- _Delete accounts/data created during the run (automated teardown in the
  runner where possible; otherwise listed here as `[manual]`)._

## Overall go / no-go

- **GO** only if every scenario's runner suite passes and all `[manual]` steps
  are verified. Otherwise record which scenario failed, with the observed
  result, as a no-go.
