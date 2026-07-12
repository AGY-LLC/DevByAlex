---
id: checklists-how-i-start-projects
title: "How I Start Projects"
summary: "My default approach to kicking off a new project. This is the thing I wish I'd written down years ago: the mental checklist that lives in my head and occasionally leads me astray when I skip steps."
tags: ["checklists", "how-i-start-projects"]
updated: 2026-05-28
---
# How I Start Projects

My default approach to kicking off a new project. This is the thing I wish I'd written down years ago: the mental checklist that lives in my head and occasionally leads me astray when I skip steps.

Not every project follows this exactly. Small prototypes skip most of it. Client work with existing constraints skips the stack decisions. But for a new SaaS or app I'm building from scratch, this is roughly the order of operations.

---

## Step 1: Write the spec before touching code

Before a repo exists, I write down what I'm building. Not a 20-page doc: a few paragraphs:

- What problem does this solve, and for who?
- What are the 3-5 core things a user needs to be able to do?
- What does success look like at launch?
- What am I explicitly NOT building in v1?

The "not building" list is the most valuable part. Scope creep usually starts with things that feel small and aren't.

This spec becomes the foundation for everything downstream: the data model, the routes, the AI prompts when generating code.

---

## Step 2: Decide the stack

My defaults for a new web SaaS (updated 2026):

| Layer | Default | Alternative |
|-------|---------|-------------|
| Framework | Next.js (App Router) | Not applicable |
| Language | TypeScript strict | Not applicable |
| Styling | Tailwind CSS + shadcn/ui | Not applicable |
| Database | Postgres + Prisma | Drizzle ORM if migration flexibility matters |
| Auth | Stytch (web + mobile) or Firebase Auth (web-only) | Auth.js if you want full control |
| Payments | Stripe | Not applicable |
| Email | Resend | Not applicable |
| Deployment | Vercel (web), Railway (standalone services) | Not applicable |
| Error tracking | Sentry | Not applicable |
| Validation | Zod everywhere | Not applicable |

If it's web-only (no mobile app), I might reach for Firebase Auth for speed. If there's a mobile app, Stytch. See [Auth Decision](./integrations/auth-decision.md).

If it's a mobile app, Expo managed workflow + the same Next.js backend. See the [Monorepo file tree](../templates/file-tree-monorepo.md).

**Why these defaults?** I've shipped with all of them. I know their failure modes. I can move fast without re-learning the tooling. Novelty is a cost, not a feature.

---

## Step 3: Design the data model first

Before writing any API routes or UI, I sketch the Prisma schema. Usually with AI help: give it the spec and ask for a draft, then revise.

This step is worth spending time on. Retrofitting a data model once you have business logic built on top of it is expensive. Changing a column type or renaming a table early is cheap.

Things I always include:
- `createdAt` / `updatedAt` on every model
- A proper user model with `id` and `email`, even if the provider handles auth
- If using an external auth provider: `providerUid` field to link records
- `status` or `state` enums for anything with a lifecycle (subscriptions, content, orders)

Things I check before writing the first migration:
- Are there any many-to-many relationships I'll need join tables for?
- What indexes will I need for the queries I'm about to write?
- Is this model going to need soft deletes? (Decide now, not later.)

---

## Step 4: Set up the project structure

### Top-level scaffolding

Before the framework-specific layout, I settle the top-level shape of the repo. Most projects fall into one of three patterns:

- **Single app**: one framework, everything colocated. Next.js SaaS, Expo mobile app. Default for solo projects.
- **Split server + client**: `server/` (API + backend) and `client/` or `app/` (web or mobile UI) as sibling folders under one repo. Reach for this when the backend has meaningful shape outside the framework's API routes, or when one backend serves multiple frontends (web + mobile). The `server/` + `app/` naming reads oddly at first but makes sense once you internalize that the web surface is also the mobile app's backend.
- **Monorepo with packages**: `apps/` + `packages/` managed by pnpm workspaces or Turborepo. Overkill for most small projects. The right call when you need to share typed code across 3+ deployables.

See [Monorepo file tree](../templates/file-tree-monorepo.md), [Backend service file tree](../templates/file-tree-backend-service.md), and [React Native file tree](../templates/file-tree-react-native.md) for starting points on each shape.

Regardless of which pattern I pick, every project gets the same top-level cast of folders and root files:

```
my-project/
├── README.md            ← how to run it locally, links to key docs
├── CLAUDE.md            ← AI collaboration instructions for this project
├── docs/                ← project documentation, not code
├── tests/               ← integration / e2e tests, if not colocated
├── scripts/             ← one-off maintenance scripts
├── .env.example         ← committed; real values live in the hosting provider
├── .github/workflows/   ← CI pipelines
└── [framework files]    ← src/, app/, server/, client/, etc.
```

A few opinions on these:

- **`docs/`** is the canonical home for project documentation. Always that name, never `documentation/` or `wiki/`. Holds the data model, architecture sketch, feature spec, and the launch artifacts (readiness checklist, staging smoke test, launch playbook) once the project gets close to shipping. See [Preparing for Launch](./preparing-for-launch.md).
- **`tests/`** holds integration and end-to-end tests. Unit tests I colocate next to the code they test (`foo.ts` + `foo.test.ts`). A dedicated folder keeps e2e tests discoverable and makes it easy for CI to run unit and integration tests as separate jobs.
- **`CLAUDE.md`** at the project root is where I write the AI collaboration instructions for *this specific project*: the stack, the conventions, the patterns to follow, the things never to do. Claude Code reads it automatically on every session, so it's the single highest-leverage doc in the project for AI-assisted development. Per-project customization lives here; the general philosophy lives in [AI Directives](./ai/directives.md).
- **`scripts/`** is for one-off tasks: data backfills, one-time migrations, throwaway data dumps. Clearly separated from the app so they don't accidentally ship with the production bundle.

### Framework-specific layout

My standard layout for a Next.js SaaS (the single-app pattern):

```
my-app/
├── app/
│   ├── (auth)/               ← auth pages (login, signup, reset)
│   ├── (dashboard)/          ← protected routes + layout with auth guard
│   ├── (marketing)/          ← public pages (home, pricing, about)
│   └── api/
│       ├── webhooks/stripe/  ← webhook endpoints
│       └── [feature]/        ← other API routes
├── components/
│   ├── ui/                   ← shadcn/ui primitives
│   ├── forms/                ← form components
│   └── [feature]/            ← feature-specific components
├── lib/
│   ├── prisma.ts             ← Prisma singleton
│   ├── auth.ts               ← auth helpers (getSession, etc.)
│   ├── stripe.ts             ← Stripe client
│   ├── env.ts                ← Zod-validated env vars
│   └── utils.ts              ← cn() and other shared utils
├── services/                 ← business logic, called by routes
└── prisma/schema.prisma
```

See the full [Next.js SaaS file tree](../templates/file-tree-nextjs-saas.md) for the detailed version.

---

## Step 5: Set up the non-negotiables before writing features

Before any feature code, I set up:

**Environment variable validation:**
```ts
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  // etc.
})

export const env = envSchema.parse(process.env)
```

If a required env var is missing, the app explodes at startup with a clear message. This is infinitely better than mysterious undefined behavior at runtime.

**Prisma singleton:**
```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Auth middleware** (protecting dashboard routes before any feature exists).

**`.env.example`** committed to the repo with all required keys documented, no real values.

**CLAUDE.md at the project root:**

Write down the stack, the conventions, the patterns to follow, and the things never to do for this specific project. Encode non-obvious preferences ("don't mock the database in tests", "all API responses return an `{ ok, data, error }` envelope", "prefer server actions over API routes for mutations") so I don't have to repeat them every conversation. See [AI Directives](./ai/directives.md) for my default template and the directives I reuse across projects.

**Husky + lint-staged for pre-commit hooks:**

Git hooks run lint + format on staged files before each commit. CI catches the full set of bugs. The hooks fail *fast*, before a bad commit becomes a PR and burns two minutes in CI. I install Husky, add a `pre-commit` hook that runs `lint-staged`, and configure `lint-staged` to run `eslint --fix` + `prettier --write` on JS/TS files. A `pre-push` hook runs `pnpm typecheck`; it is too slow for every commit but appropriate before push.

Done early, done once. Retrofitting this later is an afternoon of cleaning up "fix lint" commits you never needed to make.

**GitHub Actions CI:**

A baseline workflow on every PR and every push to `main`: install, typecheck, lint, test, build. Block merge on failure via branch protection rules.

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

Branch protection with "require status checks to pass" is the lock that makes the check matter. Without it, CI is decorative.

Deploy workflows (Vercel, EAS, etc.) come later, once the deploy targets are real. Don't write deploy CI against environments that don't exist yet.

---

## Step 6: Skeleton routes before feature logic

I build the route structure first, pages that render but don't do much, before I build the feature logic. This makes the app navigable early, which is useful for checking that layouts and auth guards work before there's anything to test on the pages themselves.

For a SaaS: homepage → signup → login → dashboard (empty) → settings/billing shell. All navigable. Nothing breaks. Then I fill in features.

---

## Step 7: Feature loop

Once the skeleton is up:

1. Pick a feature from the spec
2. Write a short description of what it should do (given/when/then)
3. Write the data access layer (Prisma query) and service function
4. Write the API route or server action
5. Build the UI
6. Manual smoke test
7. If it's critical, write at least a unit test for the service function

Repeat.

---

## What I skip in prototypes

If something is a quick prototype or I'm testing an idea before committing:

- No Prisma migrations yet: schema push only
- No CI/CD
- No tests
- Minimal error handling
- Hard-coded values instead of config

These are shortcuts I take knowingly. The rule is: if it graduates from prototype to "real project," all of this gets addressed before shipping anything to users. A conscious shortcut is fine; an unconscious one is a debt you'll forget about.

---

## Common mistakes I've made starting projects

- Skipping the spec step and going straight to code: leads to discovering a month in that the data model is wrong
- Not setting up staging early: ends up testing against production longer than intended
- Choosing a new tool because it seemed interesting: novelty has a learning-curve cost that compresses your early momentum
- Not writing down the "not in v1" list: scope creep is almost guaranteed without it

---

*See also: [Principles](./principles/index.md) | [Architecture Patterns](./architecture-patterns/index.md) | [Checklists](./checklists/before-launch.md) | [Templates](../templates/)*
