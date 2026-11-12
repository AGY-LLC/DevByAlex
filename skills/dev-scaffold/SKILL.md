---
name: dev-scaffold
description: "One-time DevByAlex project baseline. Use when the user says 'scaffold the app' or 'set up the project baseline', after the guide and wireframes are approved, or when a goal run reaches an unscaffolded repo. Sets the monorepo topology (marketing/, web/ Next.js on app.domain, optional app/ Expo), the branch model (protected main = production, staging = working line), deps, strict TypeScript, lint, a green test, Prisma 7, Zod env, design baseline, and CI + deploy via Pipeline by Alex. Runs once per project."
argument-hint: "[optional: stack overrides]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.3.0"
---

# dev-scaffold: Stand up the project baseline (once)

## Goal

A runnable, linted, tested skeleton with the right topology, branch model and
deploy pipeline, so authentication and features build on solid ground instead
of bootstrapping structure mid-feature. Runs once: if **Dev → Scaffold** is
checked, route to `/dev-auth` or the feature loop instead.

Before starting: the spec, guide and wireframe gates are checked in
`docs/STATUS.md` (else stop: the dev stage is blocked). Read the guide's stack
decisions, the spec (user-facing? mobile?), `docs/DECISIONS.md`, and
`../../knowledge/practices/data-modeling.yaml`, `project-kickoff.yaml` and
`testing.yaml`.

## Done when

- The repo has the topology below, with shared config (tsconfig base with
  `strict: true`, `eslint.config.js`, format, editorconfig, `.gitignore`) at
  the pnpm workspace root and each workspace extending it.
- `main` exists on the remote as production and the work sits on `staging`.
- `web/` boots with its directory conventions (`app/` routes, `components/`,
  `services/`, `lib/`, `tests/`), a Zod-validated env module, `.env.example`
  (names only), Prisma 7 with an empty schema and first-migration plumbing, a
  `/api/health` route, and one green example test.
- `marketing/` (user-facing) boots with a home route, brand tokens from
  `docs/BRAND.md` and a CTA to `app.{{domain}}`; `app/` (mobile) boots to a
  screen against `app.{{domain}}/api` with one green test.
- The design baseline from `docs/design/RESOURCES.md` is in: the custom app
  loader (wired to initial load, route transitions and Suspense, reading as the
  `docs/DESIGN.md` style, with a `prefers-reduced-motion` fallback) or an
  override recorded in `RESOURCES.md`, and a 1200×630 OG image generated from
  brand tokens on every web surface (`opengraph-image.tsx` with `next/og`,
  `og:image` and `twitter:image` as absolute URLs). The **Custom app loader**
  row in STATUS is checked.
- Secrets are provisioned through passworder
  (`../../knowledge/stack/secrets-passworder.md`): `docs/secrets.manifest.json`
  filled, `generated` entries generated, `provided` ones requested with obtain
  hints, the local env file written, the project registered with components
  mirroring the `pba.yml` targets, staging synced and verified. Without the
  passworder MCP, provisioning is a STATUS blocker instead.
- CI and deploy run through Pipeline by Alex: `pba.yml` (from
  `../../templates/pba.yml`) tailored with the real components, dirs, test env
  vars, deploy targets and per-branch chains (`staging` to staging, `main` to
  production, migrate before the web deploy), and `.github/workflows/ci.yml`
  is the thin caller from `../../templates/ci-caller.yml`. Each Vercel project
  has `vercel.json` `"git": {"deploymentEnabled": false}`. `pba check` passes
  where available. A target whose secrets don't exist yet stays commented.
- Install, lint, typecheck, test and build pass in every workspace.
- `CLAUDE.md` documents the workspace layout and conventions. `web/` and
  `marketing/` keep Next's managed `AGENTS.md` block as generated, committed
  and imported from their `CLAUDE.md` (`@AGENTS.md`).
- `docs/adr/scaffold.md` records the topology and what it ruled out, the
  branch model, any stack pick that diverged from the defaults, and anything
  skipped as `O`-entries, with a one-line pointer in `docs/DECISIONS.md`.
- STATUS shows **Dev → Scaffold** checked with a log line (branch, commit,
  workspaces), `## Next action` is `/dev-auth`, and the work is pushed to
  `staging` (no PR).

## Decisions (and why)

- **Topology from the spec.**

  | Workspace | What it is | Domain |
  |---|---|---|
  | `marketing/` | Next.js marketing site (landing, SEO, legal) | `{{domain}}` (apex) |
  | `web/` | Next.js **full-stack** app: UI and route handlers | `app.{{domain}}` |
  | `app/` | Expo client, only if the spec calls for mobile | app stores |

  Web-only products drop `app/`; tools that aren't user-facing (API, CLI,
  library) drop `marketing/` and may be one root project. Why: marketing and
  app have different performance and SEO profiles and deploy separately.
- **`web/` is the server.** Prisma and migrations live there and mobile calls
  `app.{{domain}}/api`. A separate `server/` only when the spec needs it
  (mobile shipping independently of web, sockets, queues, long jobs that fit
  Fly better than Vercel functions). Why: one deployable is simpler, and
  splitting later is additive.
- **`main` is production, `staging` is the working line.** The initial commit
  establishes `main`; everything after happens on `staging` (or the branch
  `dev-goal` passed). Why: production only ever receives a reviewed promotion.
- **Default stack** unless the guide decides otherwise: TypeScript pinned to
  6.0.x (`typescript@~6.0`), Next.js 16 (latest patch, 16.4.5 at least), Expo
  SDK 58, Zod at boundaries, thin handlers over `services/`, Prisma ORM 7
  pinned per `../../knowledge/stack/prisma.md`, Jest and Playwright, ESLint 10
  flat config, Stripe, Resend, Sentry, auth per
  `../../knowledge/stack/auth-decision.md`, pnpm workspaces, Node 24 LTS
  (`"engines": { "node": "24.x" }` exactly, not an open range, plus `.nvmrc`;
  `app/`'s `eas.json` base build profile, which the others extend, sets
  `"node"` to an exact 24.x version). Why for the pins: npm `latest` is
  TypeScript 7, which typescript-eslint (`<6.1`) and ts-jest (`<7`) don't
  support yet; Vercel no longer deploys Node
  20 and resolves an open range to its newest Node; EAS `sdk-58` images
  default to Node 22 and take only an exact version; ESLint 10 ignores
  `.eslintrc.*`.
- **Pipeline by Alex owns CI and deploy;** edit `pba.yml`, never generated
  workflow YAML. Why: one pipeline across apps, and Vercel's own git deploys
  would bypass the gated chain.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply. For the scaffold in particular:

- Never commit dev work to `main`; it only receives promotions from `staging`.
- Secret values are never read, printed or pasted by an agent; `.env*` stays
  gitignored.
- No feature data models or feature UI: only the baseline.
- No hand-rolled `.github/workflows/*` beyond the thin caller.
