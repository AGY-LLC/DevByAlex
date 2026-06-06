# {{APP_NAME}} — Staging Acceptance Tests

> Written by `/launch-acceptance`. A manual pass through the critical features,
> structured so a **computer-use-capable agent** can execute it against the
> **staging** environment and report pass/fail. Every expected result is stated
> explicitly — assume no insider knowledge.

**Target:** {{STAGING_URL}}
**Updated:** {{DATE}}

## Preconditions

- **Environment:** staging at the URL above.
- **Test accounts:** _e.g. `tester+acceptance@example.com` / `<placeholder>` —
  never put real secrets here; reference where the runner gets them._
- **Seed data:** _what must exist before the run._
- **Reset:** _how to return staging to a clean state between runs._

## Scenarios

### Scenario 1 — _Sign up & log in_
**Goal:** a new user can create an account and reach the app.

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Go to `{{STAGING_URL}}` | Landing page loads; "Sign up" is visible |
| 2 | Click "Sign up", enter a new email + password, submit | Account created; redirected to onboarding/dashboard |
| 3 | Log out, then log back in with the same credentials | Returns to the dashboard |
| 4 | Attempt login with a wrong password | Clear error; no access granted |

**Pass criteria:** steps 1–3 succeed; step 4 is correctly rejected.

### Scenario 2 — _<Core job>_
**Goal:** _…_

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | _…_ | _…_ |

**Pass criteria:** _…_

<!-- one scenario per critical flow; include key failure paths and
authorization checks (a user cannot access another user's data). -->

## Teardown

- _Delete accounts/data created during the run._

## Overall go / no-go

- **GO** only if every scenario's pass criteria are met. Otherwise record which
  scenario failed, with the observed result, as a no-go.
