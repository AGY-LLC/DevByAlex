---
name: dev-scaffold
description: "First dev stage of the DevByAlex workflow — a one-time pass that stands up the project baseline so every later feature has solid ground to build on. Creates the app skeleton, dependencies, TypeScript-strict config, linting/formatting, the test runner + a green example test, the data layer (Prisma/Drizzle) wired to env via Zod, env handling, a basic CI workflow, and the folder conventions (thin route handlers, services, shared utils). Defaults to Alex's stack but adapts to whatever the spec/guide chose. Runs only once per project. Use after the implementation guide and wireframes are approved, when the user says 'scaffold the app', 'set up the project baseline', or the autopilot reaches an unscaffolded repo."
argument-hint: "[optional: stack overrides]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-scaffold — Stand up the project baseline (once)

The first thing the dev stage does, exactly once. It produces a runnable,
linted, test-ready skeleton so authentication and features build on a solid
foundation instead of bootstrapping tooling mid-feature.

> **Gate check.** Do not run until the spec, implementation guide, and
> wireframes approval gates are checked in `docs/STATUS.md`. If they aren't,
> stop and tell the user the dev stage is blocked.

## When to activate

- Approval gates are met and **Dev → Scaffold** is unchecked in STATUS.
- The user says "scaffold the app" / "set up the baseline."
- `dev-autopilot` reaches a repo whose scaffold step isn't done.

## Workflow

### Step 1 — Read the plan and pick the stack
Read `docs/IMPLEMENTATION_GUIDE.md` (stack decisions, cross-cutting concerns)
and `docs/STATUS.md`. Pull `mcp__buildsbyalex__get_best_practice("data-modeling")`
and the kickoff/testing practices. Default to Alex's stack unless the guide says
otherwise: TypeScript `strict: true`, framework per the guide (Next.js for web,
Expo for native), Zod at boundaries, thin route handlers with a `services/`
layer, Prisma (review migration SQL before prod), Jest for unit/integration,
Playwright for E2E, ESLint/Biome, structured directories.

### Step 2 — Confirm the working branch
Work on the **working branch** — the branch you're on, or the one `dev-autopilot`
passed down. Don't create a separate scaffold branch; the dev stage commits and
pushes straight to the working branch.

### Step 3 — Scaffold
Stand up, in dependency order:
1. Project init + package manager + base dependencies.
2. `tsconfig` with `strict: true`; lint + format config; editorconfig.
3. Directory conventions: `app/` or `src/` routes, `components/`, `services/`,
   `lib/`, `server/`, `tests/`. Add a short note to `CLAUDE.md` documenting them.
4. Env handling: a Zod-validated `env` module; `.env.example` (never commit
   secrets); ensure `.env*` is gitignored.
5. Data layer: ORM init + an empty schema + the first migration plumbing
   (don't model features yet — that's per-feature work).
6. Test runner wired with **one green example test** so the suite runs.
7. A basic CI workflow (`.github/workflows/ci.yml`) running install → lint →
   typecheck → test → build.
8. A minimal app entry/home route that boots, plus a healthcheck.

### Step 4 — Verify
Run install, lint, typecheck, test, and build. They must all pass. Fix until
green — a scaffold that doesn't boot is not done.

### Step 5 — Update STATUS and route
- Check **Dev → Scaffold**; add a log line with branch + commit.
- Set `## Next action` to `/dev-auth`.
- Commit and **push to the working branch** (`git push origin HEAD:<branch>`) —
  no PR.

## Rules

- **Once only.** If scaffold is already checked, don't redo it — route to
  `/dev-auth` or the feature loop.
- Don't build feature data models or feature UI here — only the baseline.
- Never commit secrets; `.env*` stays gitignored with an `.env.example`.
- Leave the suite **green** before marking done.

## Output

A runnable, linted, tested skeleton pushed to the working branch, STATUS scaffold
checked, next action `/dev-auth`.
