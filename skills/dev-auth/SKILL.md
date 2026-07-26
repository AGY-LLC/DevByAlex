---
name: dev-auth
description: "The most important DevByAlex dev stage. Builds authentication as the first feature after scaffold, then exhaustively validates the identity and access foundation every later feature must preserve. Implements the app-specific password or passwordless methods, distinct Create account and Sign in, signup-only age affirmation, optional account management, simple or complex role/permission/tenant authorization, safe errors and recovery, session/access control, and in-context fresh-auth step-up. Also audits and hardens existing auth in validate-existing mode. Use after scaffold, when asked to build/add/set up authentication or login, validate existing auth, or when dev-goal reaches unvalidated auth."
argument-hint: "[optional: auth provider/constraints, or 'validate' to audit+harden existing auth]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-auth: Build authentication first (security & privacy first)

Authentication is the single most important feature in the app. It's built
right after scaffold and before any other feature, because everything else
depends on a correct, secure identity and access foundation. Security and
privacy take priority over speed and convenience here. Give it deeper coverage
than an ordinary feature, then keep its contract green throughout future
development.

> **Gate + order check.** Requires approval gates met and **Dev → Scaffold**
> done. If scaffold isn't done, run `/dev-scaffold` first.

## Two modes

Detect which one you're in before Step 3:

- **Build mode** (no real auth exists yet): implement auth from scratch, then
  validate. The default for a greenfield repo.
- **Validate-existing mode** (a real auth implementation is already present, or
  `validate` was passed): **do not re-implement or rip it out.** Audit the
  existing auth, run it through the same security validation loop, and harden it
  in place until it passes. This is the common case for an integrated/existing
  repo where `init-ai` found auth but left **Dev → Authentication** unchecked
  because it was never security-validated. Existing unvalidated auth is the
  highest-risk code in a not-launch-ready app: treat it accordingly.

## When to activate

- Scaffold is done and **Dev → Authentication** is unchecked in STATUS.
- The user says "build auth," "add login," "set up authentication," or
  "validate the existing auth."
- `dev-goal` reaches a scaffolded repo without **validated** auth: whether
  no auth exists (build) or auth exists but is unvalidated (validate-existing).

## Workflow

### Step 1: Load the auth playbook and requirements
Read the auth playbook at `../../knowledge/practices/auth.yaml`, the auth/privacy
requirements in `docs/SPEC.md`, and the required detailed auth card at
`docs/features/authentication.md`. Follow the playbook's build face. The card
must decide which methods exist, whether passwords exist at all, account
creation vs. sign-in UX, age/consent, recovery, whether account management
exists, the authorization/role/tenant model, user-safe messages, and step-up
behavior. If the card is missing or leaves a security/product decision open,
stop and route to `/plan-guide`: do not invent the identity contract while
coding.

### Step 2: Decide the approach (or map the existing one)
- **Build mode:** pick provider vs. self-rolled per the spec and playbook,
  favoring well-audited solutions over hand-rolled crypto. Decide session
  strategy (cookies/JWT), storage, the threat model, and the canonical
  user-to-authenticator/identity model. A password is one optional
  authenticator, not a universal requirement.
- **Validate-existing mode:** instead of deciding, **map what's there**, which
  library/provider, enabled methods, where sessions live, how identities link
  to users, how routes are protected, and the user/session schema. Reconcile
  that map and the threat model with the auth card. Note any risky approach,
  but don't rewrite it wholesale unless validation proves it unsafe.

Write the decision/map into `docs/features/authentication.md`, record it in
`docs/adr/auth.md` (from `docs/adr/_TEMPLATE.md`: provider/session/threat-model
choices, enabled methods, linking policy, and step-up contract as `D`-entries;
anything consciously not built as `O`-entries). This is the governing record
future auth changes are checked against. Append a one-line pointer to
`docs/DECISIONS.md`.

### Step 3: Implement or harden (security-first)
On the working branch (the one you're on, or the one `dev-goal` passed down;
do not create a separate auth branch).
- **Build mode:** implement separate Create account and Sign in flows, logout,
  session lifecycle, account recovery, any specified account/sign-in-method
  management, step-up, and the specified ownership/role/permission/tenant
  protection exactly as specified.
- **Validate-existing mode:** do **not** re-implement. Read the existing auth and
  close only the gaps validation surfaces (Step 4): add missing protections,
  fix weaknesses, fill holes: keeping the working behavior intact.

Either way, hold the line on the non-negotiables, and in validate-existing mode
these double as the **audit checklist** for the existing code:
- Keep **Create account** and **Sign in** as distinct user intents and routes or
  modes. Tabs are a default presentation, not a requirement. Never silently
  turn a sign-in attempt into account creation or vice versa.
- Require any 13+ affirmation or signup consent only on Create account. Keep it
  unchecked, explicit, and bound to that signup transaction so it cannot leak
  into a later Sign in flow.
- Use only the sign-in methods selected for this app. Passwordless is valid.
  If passwords are enabled, always support change and forgot/reset, plus add
  password when the spec allows method management; support paste and password
  managers. Never make password UI appear in a passwordless app.
- Model one canonical user with multiple verified authenticators/identities.
  Link a new method only after proof from an authenticated account and the new
  method; never auto-link solely because email strings match.
- Treat account management as app-specific. If self-service method management
  is specified, let users add and disconnect methods smoothly, but never remove
  the last currently usable method; require recent authentication and notify
  the user out of band. If it is not specified, do not invent a settings screen
  or leave hidden mutation endpoints exposed.
- Keep unauthenticated responses useful but non-enumerating. Sign-in, signup,
  and recovery must not reveal through copy, status, response shape, or timing
  whether an email/account exists. Give safe next actions such as trying Sign
  in, Create account, another enabled method, or recovery.
- For a sensitive action that needs fresh authentication, preserve a validated,
  short-lived return/action context; offer the user's eligible method(s), then
  return to the action's confirmation point. Never strand the user on a generic
  login page, trust an open redirect, or execute the dangerous action merely
  because reauthentication succeeded.
- Secure session cookies (httpOnly, secure, sameSite); sane expiry + rotation.
- Proper credential hashing if self-rolled (never store plaintext/secrets);
  rely on the provider otherwise.
- Authorization checks on every protected route/handler: default-deny.
- Implement the spec's authorization model, from simple ownership to
  roles/permissions, organizations, attributes, or relationships. Enforce it
  server-side on every request and resource lookup; UI visibility is never the
  only guard. Define privilege administration and rotate/revoke access when a
  role or membership changes.
- Zod-validated inputs at every auth boundary; rate-limit sensitive endpoints.
- Minimal PII; privacy-respecting defaults; no secrets in logs.
- The user/session data model via the ORM (reviewed migration).

### Step 4: Validate through the standard loop
Auth runs through the feature loop's independent validation structure, with a
broader test matrix because it's the highest-stakes code in the app. This step
is **identical in both modes**,
build-mode validates what you just wrote; validate-existing mode validates (and
drives the hardening of) what was already there. In validate-existing mode,
backfill tests against the current behavior **and** the abuse paths, then let the
findings dictate the fixes in Step 3:
- **Write an auth-specific regression suite** with a stable command/tag that
  future feature work can rerun. Test from `docs/features/authentication.md`,
  not from the implementation.
- **Exercise every enabled method** across every supported platform: separate
  Create account and Sign in, verification, logout, expiry/refresh, recovery,
  cancel/retry, and return-to-origin. Mark real provider/email/device checks
  manual when they cannot be automated; never fake coverage.
- **Exercise specified lifecycle combinations:** when account management is
  supported, add each method, sign in with it, link it without creating a
  duplicate user, disconnect it, and reject removal of the last usable method.
  When it is unsupported, prove that no self-service UI or endpoint exists.
  Change/forgot/reset a password only when passwords are enabled, and test
  adding one only when the management posture supports it.
- **Exercise safe messages and abuse paths:** nonexistent account, existing
  account at Create account, wrong password, wrong/failed provider, expired or
  replayed links/codes, equivalent response behavior against enumeration,
  throttling, CSRF, session fixation, privilege escalation, IDOR, and
  cross-tenant access.
- **Exercise signup-only and step-up state:** 13+ affirmation cannot bleed into
  Sign in; step-up succeeds, fails, expires, cannot open-redirect or replay,
  and returns to the intended action without auto-executing it.
- **Exercise authorization exhaustively:** generate allow and deny tests from
  the role/permission/policy matrix for every protected operation, including
  unauthenticated, wrong-role, wrong-owner, direct-endpoint, stale-session,
  privilege mutation, and cross-tenant attempts.
- Use `test-suite-developer` for breadth and a real test datastore for
  identity/linking/session integration whenever available.
- **Feature validation**: spawn the `feature-validator` agent (tests + a
  security-focused review of the auth code; `scout`/`issue-checker`).
- **Integration validation**: spawn the `integration-validator` agent (full
  suite + whole-codebase review for how auth wires into everything).
- **E2E gate**: auth is the canonical first journey
  (`../../knowledge/workflow/e2e-gate.md`). Run the app's actual Create
  account, Sign in, logout, recovery, any specified account management, each
  distinct role journey, and step-up critical paths against the running app.
  Use Playwright in `e2e/acceptance/`
  for web and Maestro in `.maestro/acceptance/` for native, parameterized so
  the same flows run against staging at launch. Scope cases to enabled methods
  and supported surfaces. Auth is not done until automated flows are green and
  every honest manual marker is verified.
- On any failure: write a test that captures the issue, fix the code, re-run.
  Loop until clean.

### Step 5: Align, update STATUS, route
- Confirm the auth implementation matches the spec's auth/privacy requirements
  and any wireframed auth screens.
- Record the stable auth regression command(s) in the auth card. Every later
  feature's integration validation reruns them and checks the auth card plus
  `docs/adr/auth.md`; an auth-touching change also reruns the affected auth E2E
  flows. Do not weaken auth coverage to make a later feature pass.
- Check **Dev → Authentication**; log branch + commit + a one-line decision
  summary.
- Commit and **push to the working branch** (`git push origin HEAD:<branch>`)
  once green: no PR.
- Set `## Next action` to `/dev-goal` (or `/feature-loop <first feature>`).

## Rules

- **Security and privacy win** over convenience in every tradeoff here.
- Passwords are app-specific and optional. Do not introduce one by default.
- Separate account creation from sign-in in behavior even when the visual
  design uses tabs on one screen.
- Test the full method/optional-management/authorization/message/step-up matrix,
  not just a happy path.
- Don't skip the validation loop: auth is the one feature you most want
  double-checked.
- Auth validation is continuous: every future feature must keep the auth
  regression suite and identity/access invariants green.
- **Auth existing ≠ auth validated.** In validate-existing mode, only check
  **Dev → Authentication** done once the existing code has actually passed the
  security loop. Finding an auth implementation is not a reason to check the box.
- In validate-existing mode, preserve working behavior: harden, don't gratuitously
  rewrite. Replace wholesale only when validation proves the approach unsafe.
- Never log or commit secrets/tokens.

## Output

A validated authentication foundation pushed to the working branch, STATUS auth
checked, next action into the feature loop.
