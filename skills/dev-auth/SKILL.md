---
name: dev-auth
description: "The most important DevByAlex dev stage. Builds authentication as the first feature after scaffold, then exhaustively validates the identity and access foundation every later feature must preserve. Implements the app-specific password or passwordless methods, distinct Create account and Sign in, signup-only age affirmation, optional account management, simple or complex role/permission/tenant authorization, safe errors and recovery, session/access control, and in-context fresh-auth step-up. Also audits and hardens existing auth in validate-existing mode. Use after scaffold, when asked to build/add/set up authentication or login, validate existing auth, or when dev-goal reaches unvalidated auth."
argument-hint: "[optional: auth provider/constraints, or 'validate' to audit+harden existing auth]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# dev-auth: Build authentication first (security & privacy first)

## Goal

A correct, secure identity and access foundation that every later feature can
rely on, proven by an auth regression suite future work reruns. Authentication
is the most important feature in the app, so it is built right after scaffold
and gets deeper coverage than any other. Security and privacy win over speed
and convenience in every tradeoff here.

Before starting: approval gates met and **Dev → Scaffold** done (else run
`/dev-scaffold`). Read `../../knowledge/practices/auth.yaml` (its build face),
the spec's auth and privacy decisions, `docs/DECISIONS.md` and
`docs/features/authentication.md`. The card must already decide the methods,
whether passwords exist, account creation vs. sign-in, age or consent,
recovery, account management, the authorization and tenant model, user-safe
messages and step-up. If it is missing or leaves one open, stop and route to
`/plan-guide`: never invent the identity contract while coding.

## Done when

- `docs/features/authentication.md` holds the approach (build mode) or the map
  of what exists (provider, enabled methods, where sessions live, how
  identities link to users, how routes are protected, the user and session
  schema), and `docs/adr/auth.md` records provider, session strategy, threat
  model, enabled methods, linking policy and step-up contract as `D`-entries
  and anything not built as `O`-entries, with a pointer in `docs/DECISIONS.md`.
- Every hard rule below holds in the code.
- An auth regression suite, tested from the card rather than the code, has a
  stable command or tag recorded in the card, and covers:
  - every enabled method on every supported platform: separate Create account
    and Sign in, verification, logout, expiry and refresh, recovery,
    cancel and retry, return-to-origin;
  - account management as specified: add, sign in with, link without
    duplicating the user, disconnect, and refuse removal of the last usable
    method; or proof that no self-service UI or endpoint exists. Password
    change, forgot and reset only where passwords are enabled;
  - safe messages and abuse paths: nonexistent account, existing account at
    Create account, wrong password or provider, expired or replayed links and
    codes, equivalent responses against enumeration, throttling, CSRF, session
    fixation, privilege escalation, IDOR, cross-tenant access;
  - signup-only affirmation never reaching Sign in, and step-up that succeeds,
    fails, expires, can't open-redirect or replay, and returns to the action
    without running it;
  - allow and deny tests from the role, permission or policy matrix for every
    protected operation: unauthenticated, wrong role, wrong owner, direct
    endpoint, stale session, privilege change, cross tenant.
  Real provider, email or device checks that can't be automated are marked
  manual and verified, never faked.
- `feature-validator` (with a security-focused review) and
  `integration-validator` pass.
- The E2E gate (`../../knowledge/workflow/e2e-gate.md`) is green against the
  running app: Create account, Sign in, logout, recovery, any account
  management, each role journey and step-up, in `e2e/acceptance/` (web) and
  `.maestro/acceptance/` (native), parameterized to run against staging later.
- The implementation matches the spec and any wireframed auth screens.
- **Dev → Authentication** is checked with a log line (branch, commit, one-line
  decision summary), `## Next action` is `/dev-goal` or the first feature, and
  the work is pushed green to the working branch (no PR, no auth branch).

A failure anywhere loops back: capture it as a test, fix, re-run.

## Decisions (and why)

- **Two modes.** Build mode implements auth from scratch. Validate-existing
  mode (auth exists, or `validate` was passed) maps what's there and hardens it
  in place, using the hard rules as the audit checklist and letting the test
  findings decide the fixes. Replace wholesale only when validation proves the
  approach unsafe. Why: existing unvalidated auth is the riskiest code in the
  app, but rewriting working auth adds risk of its own.
- **Auth existing is not auth validated.** Check the STATUS row only once the
  code has passed the loop. Why: `init-ai` often finds auth that was never
  security-tested.
- **A well-audited provider over hand-rolled crypto.** Why: fewer ways to get
  hashing, sessions or token handling wrong.
- **One canonical user with several verified authenticators.** A password is
  one optional authenticator; passwordless is valid. Why: linking and recovery
  stay sound as methods are added.
- **Auth runs through the feature loop's independent validators** with a wider
  test matrix, using `test-suite-developer` for breadth and a real test
  datastore for identity, linking and session tests where available. Why: it's
  the code you most want double-checked.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus these for auth:

- **Create account and Sign in are distinct intents.** Tabs are a default look,
  not a requirement. Never turn a sign-in into account creation or the reverse.
- **Signup affirmation (13+ or consent)** appears only on Create account,
  unchecked, explicit and bound to that signup.
- **Only the methods the app selected.** No password UI in a passwordless app.
  Where passwords exist: change and forgot/reset always, add-password only when
  method management allows it, and paste and password managers work.
- **Link a method only after proof** from both the signed-in account and the
  new method; never because email strings match.
- **Account management as specified, no more.** Never remove the last usable
  method; require recent auth and notify out of band for method changes. No
  invented settings screen or hidden mutation endpoint.
- **No enumeration.** Copy, status, response shape and timing never reveal
  whether an account exists; responses still offer a safe next action.
- **Step-up returns to the action's confirmation point** through a validated,
  short-lived context; never a generic login page, an open redirect, or an
  action run just because reauthentication succeeded.
- **Default-deny authorization on every protected route and lookup,**
  enforced server-side; UI visibility is never the only guard. Access is
  rotated or revoked when a role or membership changes.
- Session cookies httpOnly, secure and sameSite, with sane expiry and
  rotation; credentials hashed properly if self-rolled.
- Zod at every auth boundary; rate limits on sensitive endpoints.
- Minimal PII; no secrets or tokens in logs or commits; the user and session
  schema goes through a reviewed migration.
- Every later feature reruns the auth regression suite; never weaken it to
  make another feature pass.
