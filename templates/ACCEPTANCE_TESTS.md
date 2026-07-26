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

### Scenario 1: _Create account and Sign in are distinct_
**Goal:** a new user can create an account and a returning user can sign in
through separate, clear flows using the app's enabled methods.
**Runners:** web `e2e/acceptance/01-auth.spec.ts` · mobile
`.maestro/acceptance/01-auth.yaml`

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Open authentication | Separate "Create account" and "Sign in" intents are visible; only the methods specified in `docs/features/authentication.md` appear |
| 2 | Open Create account; complete any required unchecked 13+ affirmation; use each enabled creation method | Each method creates and verifies one account, then reaches the specified onboarding/destination; Sign in never inherits signup-only proof |
| 3 | Log out; open Sign in; use each enabled method for its matching test account | Each method signs into the existing account without creating a duplicate and returns to the intended destination |
| 4 | Attempt Sign in with wrong/nonexistent credentials or a failed method | No access; safe actionable response does not identify whether the account, password, or linkage exists |
| 5 | Attempt Create account with an existing identifier | Public response does not confirm registration; it offers the safe next step to Sign in, with account-specific guidance only out of band when supported |

**Pass criteria:** every enabled method passes on every supported surface,
failure behavior matches the safe response contract, and no Create account /
Sign in intent or signup-only state crosses over.

### Scenario 2: _Recovery and optional sign-in-method lifecycle_
**Goal:** a user can recover access and, only when the app specifies
self-service management, safely manage supported sign-in methods without losing
the last usable method or creating another user.
**Runners:** _web/mobile auth specs; mark real inbox/provider/device checks
`[manual]` where they cannot be automated honestly_

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Request recovery for existing and nonexistent identifiers | Both public responses are equivalent; existing-account instructions arrive out of band and use a single-use expiring artifact |
| 2 | If passwords are supported, use Forgot password and change/reset password; add a password only when specified | New password works, superseded password does not, add is available only when specified, and password controls are absent if the app is passwordless |
| 3 | If self-service method management is supported, add and verify each supported method, then sign in with it; otherwise attempt to reach the absent management UI/API | Supported methods resolve to the same canonical user without duplication; or unsupported self-service surfaces are unavailable |
| 4 | If supported, disconnect a method while another verified usable method remains | Method is removed, notification is sent, and remaining method still signs in |
| 5 | If supported, try to disconnect the last verified usable method | Removal is blocked with an actionable explanation; the user retains access |

**Pass criteria:** recovery is non-enumerating and replay-safe; the specified
account-management posture is honored; any supported
add/link/use/disconnect works without takeover or duplicate accounts and the
last-usable-method invariant holds.

### Scenario 3: _Fresh authentication for a dangerous action_
**Goal:** step-up is easy to complete in context and returns the user safely to
the action they intended.
**Runners:** _web/mobile auth specs_

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Begin each action listed as step-up protected | In-context fresh-auth screen offers eligible methods and preserves a validated short-lived action context |
| 2 | Complete fresh authentication | Returns to the intended action's confirmation point; the dangerous action has not auto-executed |
| 3 | Cancel, fail, expire, tamper with, or replay the step-up context | No state change; safe return and useful error; no open redirect or replay |

**Pass criteria:** every specified step-up action passes success and
failure/cancel/expiry/replay paths without stranding the user.

### Scenario 4 (if specified): _Role, permission, and organization access_
**Goal:** every account role or policy can perform exactly its allowed actions,
and no role, ownership, or tenant boundary can be bypassed through a direct
request.
**Runners:** _web/mobile UI journeys plus direct endpoint assertions_

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Sign in as each role/policy subject and perform each allowed operation | Allowed operation succeeds within the correct resource and tenant scope |
| 2 | As each role, call a disallowed operation directly even if its UI control is hidden | Server denies the request and leaks no protected data or side effect |
| 3 | Attempt wrong-owner, stale-role/session, and cross-tenant access | Every attempt is denied by the server-side policy |
| 4 | Invite, grant, revoke, or elevate access using authorized and unauthorized actors | Only authorized administration succeeds; self-elevation and invalid transitions fail; active access and audit evidence update as specified |
| 5 | If applicable, attempt to remove the last required owner/admin | Operation is blocked without leaving the account or organization unmanageable |

**Pass criteria:** the complete matrix in `docs/features/authentication.md` has
an allow and deny assertion for every protected operation; privilege changes
take effect as specified.

### Scenario 5: _<Core job>_
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
