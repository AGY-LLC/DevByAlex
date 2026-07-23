---
name: dev-scaffold
description: "First dev stage of the DevByAlex workflow: a one-time pass that stands up the project baseline so every later feature has solid ground to build on. Decides the repo topology (for a user-facing product: a monorepo with marketing/ on the apex domain, web/ as the full-stack Next.js app on app.domain, and an optional app/ Expo mobile client), initializes the branch model (intentional protected main = production; staging = the working line all dev happens on until prod-ready), and creates the skeleton: dependencies, TypeScript-strict config, linting/formatting, the test runner + a green example test, the Prisma data layer in web/ wired to env via Zod, env handling, the design baseline, and the CI + deploy pipeline via Pipeline by Alex (pba.yml + a thin caller). Defaults to Alex's stack but adapts to whatever the spec/guide chose. Runs only once per project. Use after the implementation guide and wireframes are approved, when the user says 'scaffold the app', 'set up the project baseline', or the goal run reaches an unscaffolded repo."
argument-hint: "[optional: stack overrides]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# dev-scaffold: Stand up the project baseline (once)

The first thing the dev stage does, exactly once. It produces a runnable,
linted, test-ready skeleton: with the right repo topology, branch model, and
deploy pipeline already in place, so authentication and features build on solid
foundations instead of bootstrapping structure mid-feature.

> **Gate check.** Do not run until the spec, implementation guide, and
> wireframes approval gates are checked in `docs/STATUS.md`. If they aren't,
> stop and tell the user the dev stage is blocked.

## When to activate

- Approval gates are met and **Dev → Scaffold** is unchecked in STATUS.
- The user says "scaffold the app" / "set up the baseline."
- `dev-goal` reaches a repo whose scaffold step isn't done.

## Workflow

### Step 1: Read the plan; decide topology and stack
Read `docs/IMPLEMENTATION_GUIDE.md` (stack decisions, cross-cutting concerns),
`docs/SPEC.md` (is this user-facing? is there a mobile client?), and
`docs/STATUS.md`. Read `../../knowledge/practices/data-modeling.yaml` plus
`../../knowledge/practices/project-kickoff.yaml` and
`../../knowledge/practices/testing.yaml`.

Decide the **repo topology** from the spec:

- **User-facing product → a monorepo with separate surfaces:**
  | Workspace | What it is | Domain |
  |---|---|---|
  | `marketing/` | Next.js marketing site (lighter profile: landing, SEO, legal) | `{{domain}}` (apex) |
  | `web/` | Next.js **full-stack** app: UI **and** API/server/route handlers | `app.{{domain}}` |
  | `app/` | Expo/RN mobile client (**only if** the spec calls for mobile); consumes web/'s API | app stores |

  `web/` **is the server**: Vercel runs its API routes next to the UI, so the
  Prisma schema and migrations live in `web/`, and the mobile `app/` talks to
  `app.{{domain}}/api`. Do **not** stand up a separate `server/` workspace unless
  the spec demands it (mobile must ship/scale independently of web deploys, or
  non-serverless workloads, websockets, queues, long jobs, that fit Fly better
  than Vercel functions). Splitting a `server/` out later is additive.
- **Web-app-only (user-facing, no mobile):** `marketing/` + `web/`.
- **Not user-facing** (internal tool, API, CLI, library): skip `marketing/`; a
  single root project or `web/` is fine. Use judgement and note the choice.

Default stack unless the guide says otherwise: TypeScript `strict: true`, Next.js
(web + marketing) / Expo (mobile), Zod at boundaries, thin route handlers with a
`services/` layer, Prisma (review migration SQL before prod), Jest for
unit/integration, Playwright for E2E, ESLint/Biome. pnpm workspaces tie the
monorepo together.

### Step 2: Initialize the branch model
Two long-lived branches, distinct roles:

- **`main` = production.** Protected, intentional. Only production-ready code
  lands here, and only via PR from `staging`. The scaffold's initial commit
  establishes `main`.
- **`staging` = the working line.** Cut `staging` from `main` immediately
  (`git switch -c staging`). **All development happens on `staging`** (or on
  short feature branches cut from it that merge back to `staging`). `staging`
  deploys to the staging environment; it's promoted to `main` only when the app
  is production-ready.

So: scaffold establishes `main`, then does its work on `staging`. The dev stage
and the feature loop run on `staging`/feature branches: never commit dev work
straight to `main`. If `dev-goal` passed a working branch, honor it; default
to `staging`.

### Step 3: Scaffold the structure
Stand up, in dependency order. For a monorepo, set up the pnpm workspace root
first, then each surface; shared config (tsconfig base, lint/format, editorconfig)
lives at the root and each workspace extends it.

1. Workspace root: `package.json` + `pnpm-workspace.yaml` listing `marketing`,
   `web`, and `app` (as applicable); base `tsconfig` with `strict: true`; lint +
   format + editorconfig; `.gitignore`.
2. **`web/`** (the full-stack app):
   - Next.js app, directory conventions (`app/` routes, `components/`,
     `services/`, `lib/`, `tests/`); thin route handlers over a `services/` layer.
   - Zod-validated `env` module; `.env.example` (names only, never values);
     `.env*` gitignored. Secrets are provisioned through passworder
     (`knowledge/stack/secrets-passworder.md`): fill `docs/secrets.manifest.json`
     with the real entries, `generate_secret` every `generated` one,
     `request_secret` the `provided` ones (with obtain hints), and
     `write_env_file` the local tier so the scaffold boots without Alex
     touching a dashboard.
   - Prisma init + an empty schema + first migration plumbing (don't model
     features yet, that's per-feature work). A healthcheck route (`/api/health`).
   - Test runner wired with **one green example test**.
   - **App-wide design resources** (per `docs/design/RESOURCES.md`): the custom
     **app loader**: **required**, wired to initial load / route transitions /
     Suspense, built to the chosen approach (logo-based / theme-derived /
     generated) from `docs/BRAND.md` and the committed style in `docs/DESIGN.md`
     (the loader's motion + shape language should read as the picked
     PRIMARY × SECONDARY, not a generic spinner), honoring `prefers-reduced-motion`
     (static fallback). Build it **or** record an override in `RESOURCES.md`,
     never skip silently. Then check the **Custom app loader** row in STATUS.
3. **`marketing/`** (if user-facing): a minimal Next.js site that boots: a home
   route, brand tokens from `docs/BRAND.md`, and a link/CTA to `app.{{domain}}`.
   Keep it light; landing-page content is built later in its feature, not here.
4. **`app/`** (if mobile): Expo init that boots to a screen and points at
   `app.{{domain}}/api`. One green example test.
5. **OG preview image** on every web surface (`marketing/` and `web/`): dynamic
   generation from brand tokens (`opengraph-image.tsx` via `@vercel/og` / Satori,
   1200×630), wiring `og:image` + `twitter:image` (absolute URL) into base
   metadata.
6. Document the workspace layout and conventions in `CLAUDE.md`.

### Step 4: Wire CI + deploy via Pipeline by Alex
Do **not** hand-roll workflow YAML. Use PBA central runtime mode:

1. Copy `../../templates/pba.yml` to the repo root as `pba.yml` and tailor it:
   set `name`, the real `components` (`marketing`, `web`, and `app` if mobile),
   per-component `dir`, the `web` test env vars the suite needs, and the deploy
   `targets` + per-branch `deploy` chains for the surfaces in play (two Vercel
   projects, marketing on the apex, web on `app.{{domain}}`, plus `web`'s
   `prisma-migrate`, and `eas` if mobile). Leave a `target`/chain commented only
   while its secrets/environment don't exist yet; fill in domains and health URLs.
2. Copy `../../templates/ci-caller.yml` to `.github/workflows/ci.yml` (the thin
   caller delegating to `AGY-LLC/pipelinebyalex/.github/workflows/pipeline.yml@v1`,
   triggering on `main` + `staging`). All pipeline logic stays in `pba.yml`.
3. The deploy chains encode the branch model: `staging` → staging environment,
   `main` → production. `order` IS the `needs` chain (migrate before web deploy).
4. Register the app with passworder (`register_project`), components mirroring
   the `pba.yml` targets (each Vercel project, each Fly app per env, the GitHub
   repo for CI secrets), then `sync_secrets` staging once targets exist and
   `verify_secrets` before the first staging deploy. The CI secrets the central
   pipeline needs (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, …) are
   manifest entries with component `ci` and exactly one env. If the passworder
   MCP isn't connected, record secret provisioning as a blocker instead.

Reference: `AGY-LLC/pipelinebyalex` `docs/usage.md`. Each Vercel project's own git
integration must be OFF (`vercel.json` `deploymentEnabled:false`) so CI owns the
gated deploy; the central pipeline needs `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and a
per-project `VERCEL_PROJECT_ID`.

### Step 5: Verify
Run install, lint, typecheck, test, and build across all workspaces. They must
all pass. Validate `pba.yml` if the interpreter's check is available
(`pba check`). Fix until green: a scaffold that doesn't boot is not done.

### Step 6: Update STATUS and route
- Check **Dev → Scaffold**; add a log line with branch + commit and the topology
  chosen (workspaces created).
- Record the scaffold decisions in `docs/adr/scaffold.md` (from
  `docs/adr/_TEMPLATE.md`): topology choice and what it ruled out (e.g. no
  separate `server/` workspace and why), branch model, stack picks that diverged
  from the defaults, `D`-entries, plus anything consciously skipped as
  `O`-entries. This is the governing record later structural changes are
  checked against; append a one-line pointer to `docs/DECISIONS.md`.
- Set `## Next action` to `/dev-auth`.
- Commit and **push to `staging`** (`git push -u origin staging`); ensure `main`
  exists on the remote too. No PR: `staging → main` happens at production-ready.

## Rules

- **Once only.** If scaffold is already checked, don't redo it: route to
  `/dev-auth` or the feature loop.
- **`main` is production, `staging` is where work happens.** Never commit dev
  work straight to `main`; it only receives PRs from `staging` when prod-ready.
- **Separate marketing from app** for user-facing products: `marketing/` (apex)
  and `web/` (app.domain) are distinct surfaces/Vercel projects in the monorepo.
  `web/` is full-stack (UI + API); no separate `server/` unless the spec demands it.
- **Pipeline by Alex owns CI + deploy.** Edit `pba.yml`, never the generated
  workflow YAML. Don't hand-roll `.github/workflows/*` beyond the thin caller.
- Don't build feature data models or feature UI here: only the baseline.
- Never commit secrets; `.env*` stays gitignored with an `.env.example` (names
  only). Secret values live in 1Password via passworder and are never read,
  printed, or pasted by an agent (`knowledge/stack/secrets-passworder.md`).
- Leave the suite **green** before marking done.

## Output

A runnable, linted, tested monorepo skeleton: `marketing/` + `web/` (full-stack)
+ optional `app/`: on `staging` (with `main` established as protected
production), the design baseline (custom app loader or recorded override, OG
images) in place, CI + deploy wired through `pba.yml` + the thin caller, STATUS
scaffold + loader rows checked, next action `/dev-auth`.
