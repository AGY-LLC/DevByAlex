---
name: dev-auth
description: "The most important dev stage of the DevByAlex workflow — build authentication first, with security and privacy prioritized above everything else, so the rest of the app has a solid foundation. Chooses/implements the auth approach from the spec (provider or self-rolled), sign-up/login/logout, session handling, password/credential security, access control and route protection, and the user/session data model. Then runs the build through the same validate loop every feature uses (feature + integration validation) before marking it done. Leans on the BuildsByAlex auth best practice. Use after scaffold, when the user says 'build auth', 'add login', 'set up authentication', or the autopilot reaches a scaffolded repo without auth."
argument-hint: "[optional: auth provider or constraints]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-auth — Build authentication first (security & privacy first)

Authentication is the single most important feature in the app. It's built
right after scaffold and before any other feature, because everything else
depends on a correct, secure identity and access foundation. Security and
privacy take priority over speed and convenience here.

> **Gate + order check.** Requires approval gates met and **Dev → Scaffold**
> done. If scaffold isn't done, run `/dev-scaffold` first.

## When to activate

- Scaffold is done and **Dev → Authentication** is unchecked in STATUS.
- The user says "build auth," "add login," "set up authentication."
- `dev-autopilot` reaches a scaffolded repo without auth.

## Workflow

### Step 1 — Load the auth playbook and requirements
Load `mcp__buildsbyalex__get_best_practice("auth")` and read the auth/privacy
requirements captured in `docs/SPEC.md` (who logs in, how, what they can access,
multi-tenant, compliance) and any auth feature card. Follow the playbook's
build face.

### Step 2 — Decide the approach
Pick provider vs. self-rolled per the spec and playbook, favoring well-audited
solutions over hand-rolled crypto. Decide session strategy (cookies/JWT),
storage, and the threat model. Write the decision into the auth feature card and
record it via `mcp__buildsbyalex__record_decision` if it's a tracked project.

### Step 3 — Implement (security-first)
On a branch (`feat/auth`). Implement sign-up, login, logout, session lifecycle,
and route/middleware protection. Hold the line on the non-negotiables:
- Secure session cookies (httpOnly, secure, sameSite); sane expiry + rotation.
- Proper credential hashing if self-rolled (never store plaintext/secrets);
  rely on the provider otherwise.
- Authorization checks on every protected route/handler — default-deny.
- Zod-validated inputs at every auth boundary; rate-limit sensitive endpoints.
- Minimal PII; privacy-respecting defaults; no secrets in logs.
- The user/session data model via the ORM (reviewed migration).

### Step 4 — Validate through the standard loop
Auth runs through the **same validation the feature loop uses**, because it's
the highest-stakes code in the app:
- **Tests** for auth flows and access control — happy paths **and** failure/
  abuse paths (wrong password, expired session, privilege escalation, IDOR,
  CSRF). Use `test-suite-developer` for breadth.
- **Feature validation** — spawn the `feature-validator` agent (tests + a
  security-focused review of the auth code; `scout`/`issue-checker`).
- **Integration validation** — spawn the `integration-validator` agent (full
  suite + whole-codebase review for how auth wires into everything).
- On any failure: write a test that captures the issue, fix the code, re-run.
  Loop until clean.

### Step 5 — Align, update STATUS, route
- Confirm the auth implementation matches the spec's auth/privacy requirements
  and any wireframed auth screens.
- Check **Dev → Authentication**; log branch + commit + a one-line decision
  summary.
- Set `## Next action` to `/dev-autopilot` (or `/feature-loop <first feature>`).

## Rules

- **Security and privacy win** over convenience in every tradeoff here.
- Test the abuse paths, not just the happy path.
- Don't skip the validation loop — auth is the one feature you most want
  double-checked.
- Never log or commit secrets/tokens.

## Output

A validated authentication foundation on a branch, STATUS auth checked, next
action into the feature loop.
