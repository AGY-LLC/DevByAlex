---
name: init-ai
description: "Initialize or integrate the DevByAlex autonomous build workflow into an app repo. Takes a path to the app folder (or uses cwd), detects the repo's current state (blank, scaffolded, partway, or mature), stamps the docs/ workflow files (SPEC, IMPLEMENTATION_GUIDE, STATUS, feature cards, wireframes, acceptance tests) without clobbering existing work, then reconciles STATUS.md and the TODO/next-action queue against what is actually already done versus not. Routes to the correct next stage. Works on brand-new empty repos and existing codebases alike. Use when the user says 'init-ai', 'set up the DevByAlex workflow', 'initialize this app for the workflow', or points at a folder to bring under the autonomous build process."
argument-hint: "[path to the app folder — defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# init-ai — Bootstrap or integrate the DevByAlex workflow

The entry point for every project. Given a path to an app folder, this skill
makes the repo workflow-ready: it writes the `docs/` control files the rest of
the workflow reads, then sets each stage's status and the next-action queue
**from what the repo has actually done**, so it works the same on a blank repo
or a half-built one.

It does **not** build anything. It sets up state and routes you (or the
autopilot) to the right next stage. Respect the approval gates — never advance
into the dev stage on your own.

## When to activate

- The user runs `/init-ai <path>` or says "set this app up for the workflow."
- A new folder needs to come under the autonomous build process.
- An existing repo should be integrated (backfill spec/status from code).
- Re-run safely any time to re-reconcile STATUS against the current code.

## Inputs and prerequisites

- **Target path**: the first argument, else the current working directory.
  Confirm it with the user if it's ambiguous.
- The DevByAlex **templates** live next to this skill at `../../templates/`
  (relative to this skill dir). Read them from there; copy, don't symlink.
- If the project is one of Alex's tracked projects, pull context from the
  BuildsByAlex MCP (`mcp__buildsbyalex__start_here`, `get_projects`,
  `get_project_context`) to seed the spec and stack assumptions.

## Workflow

### Step 1 — Resolve and confirm the target
Resolve the path. If it doesn't exist, ask whether to create it. State plainly
which absolute folder you're about to initialize and that you will not
overwrite existing files without asking.

### Step 2 — Detect repo state (read-only pass)
Inventory the target without changing anything. Capture:
- **VCS**: is it a git repo? current branch, has commits?
- **Stack**: `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` /
  `Gemfile`; framework (Next.js, Expo, Vite, Astro…); package manager;
  TypeScript; ORM (Prisma/Drizzle); test runner; lint/format config; CI under
  `.github/workflows`.
- **Surfaces already built**: `src/`/`app/` routes, components, API handlers,
  a database schema/migrations, an **auth** implementation (look for
  next-auth/Clerk/Lucia/Supabase/session/jwt/middleware), payments (Stripe).
- **Existing tests**: unit/integration/e2e, and whether they pass if cheap to
  check.
- **Existing DevByAlex docs**: `docs/STATUS.md`, `docs/SPEC.md`,
  `docs/IMPLEMENTATION_GUIDE.md`, `docs/features/`, `docs/wireframes/`,
  `docs/ACCEPTANCE_TESTS.md`. If present, you are **integrating**, not
  bootstrapping — read them and preserve their content.
- A `CLAUDE.md` / `README.md` — read for declared conventions and intent.

### Step 3 — Classify maturity
Pick one and record it in the summary:
- **blank** — empty or only config/readme, no app code.
- **scaffolded** — project skeleton + tooling exist, no real features yet.
- **partial** — some features/auth built; others missing.
- **mature** — broad feature coverage; mostly needs validation/launch work.

### Step 4 — Stamp the workflow files (never clobber)
Copy each template from `../../templates/` into the target's `docs/`, **only if
the destination doesn't already exist**. If a file exists, leave it and note it
in the summary (offer to merge, don't overwrite silently):

| Template | Destination | Notes |
|----------|-------------|-------|
| `STATUS.md` | `docs/STATUS.md` | the control file the autopilot reads |
| `AI_WORKFLOW.md` | `docs/AI_WORKFLOW.md` | per-repo pointer to the process |
| `SPEC.md` | `docs/SPEC.md` | stub if blank; keep if it exists |
| `IMPLEMENTATION_GUIDE.md` | `docs/IMPLEMENTATION_GUIDE.md` | stub if blank |
| `feature-card.md` | `docs/features/_TEMPLATE.md` | copied per-feature later |
| `wireframes-README.md` | `docs/wireframes/README.md` | Figma index |
| `ACCEPTANCE_TESTS.md` | `docs/ACCEPTANCE_TESTS.md` | stub if blank |

Fill placeholders (`{{APP_NAME}}`, `{{DATE}}`, stack) from Step 2. Convert any
relative date to an absolute one.

### Step 5 — Reconcile STATUS from reality
This is the part that makes integration work. Walk what you found in Step 2 and
set each checkbox/row in `docs/STATUS.md` to match the code, not the template
defaults:

- **Stage**: choose `plan` / `dev` / `launch` based on maturity. A repo with
  real features sits in `dev`; an empty one sits in `plan`.
- **Gates**: leave approval gates (spec/guide/wireframes approved) **unchecked**
  unless an existing doc explicitly records Alex's approval. Never self-approve.
- **Plan rows**: check `SPEC.md` / `IMPLEMENTATION_GUIDE.md` / wireframes only
  if those docs exist with real content.
- **Dev rows**: check **Scaffold** if tooling/skeleton/CI exist; check
  **Authentication** only if a real auth implementation is present.
- **Feature table**: for an existing repo, enumerate the features you can
  identify from routes/modules/nav and add a row per feature with a
  best-effort per-step status (Spec/Wireframe/Tests/Impl/Feat-Valid/
  Integ-Valid/Aligned). Mark every inferred value `(needs review)` — observed
  facts and guesses must stay separated.
- **Launch rows**: check only if the corresponding artifact exists and passed.

For a blank repo this is trivial (almost everything unchecked). For an existing
repo, this backfills the board so the workflow can pick up mid-stream.

### Step 6 — Seed the next-action queue and TODO
Set the single `## Next action` line in `STATUS.md` to the correct next step
for this repo's state, and populate `## Blockers / open questions` with
anything that needs a human. The routing rules:

| Repo state | Next action |
|------------|-------------|
| blank, no spec | `/plan-spec` — run the interview |
| has spec, no guide | `/plan-guide` — expand the approved spec |
| has guide, no wireframes | `/plan-wireframes` — needs Figma MCP |
| guide + wireframes done, **gates unchecked** | Tell Alex to review & approve — dev is blocked |
| gates approved, no scaffold | `/dev-scaffold` |
| scaffolded, no auth | `/dev-auth` |
| auth done, features remain | `/dev-autopilot` (or `/feature-loop <feature>`) |
| existing code, no spec | backfill: `/plan-spec` in *reverse-engineer* mode, then `/plan-guide`, then reconcile |
| all features done | `/launch-acceptance`, then launch-readiness |

If integrating a code-first repo with no spec, recommend backfilling the spec
and guide **from the code** before any further building, so the autopilot has a
target to validate against.

### Step 7 — Optionally make the workflow live
If the user wants the workflow active in this repo:
- Offer to add a short `## DevByAlex workflow` section to the repo's
  `CLAUDE.md` pointing at `docs/AI_WORKFLOW.md` and `docs/STATUS.md`.
- If they want unattended runs, point them at `docs/SCHEDULING.md` in the
  DevByAlex repo (do **not** create cron jobs from here).

### Step 8 — Report
Print a tight summary:
- Absolute path initialized and detected stack + maturity.
- Which files were created vs. already present (and thus left alone).
- The reconciled stage and the **one** next action.
- Any blockers/open questions and anything marked `(needs review)`.

## Rules

- **Never overwrite** an existing `docs/*` file without explicit confirmation.
  Bootstrapping is additive.
- **Never check an approval gate** yourself. Gates are Alex's to set.
- **Never start building.** This skill only sets up state and routes.
- Keep `STATUS.md` short and current; push detail into feature cards and the
  log — mirror Alex's "status files stay short" rule.
- Separate observed facts from guesses; tag inferences `(needs review)`.
- Re-running must be **idempotent**: re-reconcile, don't duplicate rows or
  re-stamp existing files.

## Output

A workflow-ready `docs/` directory in the target repo with a reconciled
`STATUS.md`, plus a summary ending in the single recommended next command.
