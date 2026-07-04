---
name: dev-auth
description: "The most important dev stage of the DevByAlex workflow — build authentication first, with security and privacy prioritized above everything else, so the rest of the app has a solid foundation. Chooses/implements the auth approach from the spec (provider or self-rolled), sign-up/login/logout, session handling, password/credential security, access control and route protection, and the user/session data model. Then runs the build through the same validate loop every feature uses (feature + integration validation) before marking it done. Also runs in validate-existing mode: when an app already has auth (common in integrated/existing repos), it does NOT re-implement — it audits, security-validates, and hardens the existing auth before marking it done, because existing auth that was never put through the security loop is the highest-risk code in a not-launch-ready repo. Leans on the vendored auth best-practice playbook. Use after scaffold, when the user says 'build auth', 'add login', 'set up authentication', 'validate the existing auth', or the autopilot reaches a scaffolded repo without validated auth."
argument-hint: "[optional: auth provider/constraints, or 'validate' to audit+harden existing auth]"
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

## Two modes

Detect which one you're in before Step 3:

- **Build mode** (no real auth exists yet) — implement auth from scratch, then
  validate. The default for a greenfield repo.
- **Validate-existing mode** (a real auth implementation is already present, or
  `validate` was passed) — **do not re-implement or rip it out.** Audit the
  existing auth, run it through the same security validation loop, and harden it
  in place until it passes. This is the common case for an integrated/existing
  repo where `init-ai` found auth but left **Dev → Authentication** unchecked
  because it was never security-validated. Existing unvalidated auth is the
  highest-risk code in a not-launch-ready app — treat it accordingly.

## When to activate

- Scaffold is done and **Dev → Authentication** is unchecked in STATUS.
- The user says "build auth," "add login," "set up authentication," or
  "validate the existing auth."
- `dev-autopilot` reaches a scaffolded repo without **validated** auth — whether
  no auth exists (build) or auth exists but is unvalidated (validate-existing).

## Workflow

### Step 1 — Load the auth playbook and requirements
Read the auth playbook at `../../knowledge/practices/auth.yaml` and read the auth/privacy
requirements captured in `docs/SPEC.md` (who logs in, how, what they can access,
multi-tenant, compliance) and any auth feature card. Follow the playbook's
build face.

### Step 2 — Decide the approach (or map the existing one)
- **Build mode:** pick provider vs. self-rolled per the spec and playbook,
  favoring well-audited solutions over hand-rolled crypto. Decide session
  strategy (cookies/JWT), storage, and the threat model.
- **Validate-existing mode:** instead of deciding, **map what's there** — which
  library/provider, where sessions live, how routes are protected, the
  user/session schema — and write that map (plus the threat model) into the auth
  feature card. Note any approach you'd flag as risky, but don't rewrite it
  wholesale unless validation proves it unsafe.

Write the decision/map into the auth feature card, record it in
`docs/adr/auth.md` (from `docs/adr/_TEMPLATE.md` — provider/session/threat-model
choices as `D`-entries, anything consciously not built as `O`-entries; this is
the governing record future auth changes are checked against), and append a
one-line pointer to `docs/DECISIONS.md`.

### Step 3 — Implement or harden (security-first)
On the working branch (the one you're on, or the one `dev-autopilot` passed down
— no separate auth branch).
- **Build mode:** implement sign-up, login, logout, session lifecycle, and
  route/middleware protection.
- **Validate-existing mode:** do **not** re-implement. Read the existing auth and
  close only the gaps validation surfaces (Step 4) — add missing protections,
  fix weaknesses, fill holes — keeping the working behavior intact.

Either way, hold the line on the non-negotiables — and in validate-existing mode
these double as the **audit checklist** for the existing code:
- Secure session cookies (httpOnly, secure, sameSite); sane expiry + rotation.
- Proper credential hashing if self-rolled (never store plaintext/secrets);
  rely on the provider otherwise.
- Authorization checks on every protected route/handler — default-deny.
- Zod-validated inputs at every auth boundary; rate-limit sensitive endpoints.
- Minimal PII; privacy-respecting defaults; no secrets in logs.
- The user/session data model via the ORM (reviewed migration).

### Step 4 — Validate through the standard loop
Auth runs through the **same validation the feature loop uses**, because it's
the highest-stakes code in the app. This step is **identical in both modes** —
build-mode validates what you just wrote; validate-existing mode validates (and
drives the hardening of) what was already there. In validate-existing mode,
backfill tests against the current behavior **and** the abuse paths, then let the
findings dictate the fixes in Step 3:
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
- Commit and **push to the working branch** (`git push origin HEAD:<branch>`)
  once green — no PR.
- Set `## Next action` to `/dev-autopilot` (or `/feature-loop <first feature>`).

## Rules

- **Security and privacy win** over convenience in every tradeoff here.
- Test the abuse paths, not just the happy path.
- Don't skip the validation loop — auth is the one feature you most want
  double-checked.
- **Auth existing ≠ auth validated.** In validate-existing mode, only check
  **Dev → Authentication** done once the existing code has actually passed the
  security loop. Finding an auth implementation is not a reason to check the box.
- In validate-existing mode, preserve working behavior — harden, don't gratuitously
  rewrite. Replace wholesale only when validation proves the approach unsafe.
- Never log or commit secrets/tokens.

## Output

A validated authentication foundation pushed to the working branch, STATUS auth
checked, next action into the feature loop.
