---
id: stack-ci-cd
title: "CI/CD"
summary: "Continuous integration and deployment. The thing that lets you ship confidently without manually running checks before every push."
tags: ["stack", "ci-cd"]
updated: 2026-05-28
---
# CI/CD

Continuous integration and deployment. The thing that lets you ship confidently without manually running checks before every push.

My default is GitHub Actions. Simple, well-documented, free for most use cases, integrates directly with the repo.

---

## What I want from a CI/CD pipeline

1. **Fast feedback**: if something is broken, I want to know before it reaches main
2. **Type checking**: TypeScript errors caught automatically
3. **Linting**: consistent code style without arguing about it in code review
4. **Tests**: at minimum, a smoke test or unit tests on core logic
5. **Preview deploys**: Vercel handles this for Next.js projects automatically
6. **Deployment**: automated deploys on merge to main (not manual)

---

## Branch model: develop on main until you ship

The branch model I use depends on whether the project has real users yet. Two phases.

### Pre-deploy: develop directly on main

Before anyone is using the app, I commit straight to `main`. No feature branches for in-scope work. No PR ceremony when the reviewer is me. The only exception: break off a branch when I'm trying something I might throw away: a "might add" feature I want to explore without committing to the main line yet.

What counts as a "might add" branch:

- An experimental feature I'm not sure will stay in the product
- A refactor I want to try but might revert
- A spike on a third-party integration before committing to it

Everything else lands on `main` directly. A dirty `main` that gets cleaned up is fine when nobody depends on it; PR ceremony is overhead when the point is velocity and the reviewer is me.

### Post-deploy: main / staging / dev

The day the first external user signs up, the calculus changes. A bad commit is now a real outage and a reputational cost. The working branch moves off `main`:

- **`main`**: production. Always deployable. No direct commits; only promotion from `staging` once it's been verified there.
- **`staging`**: what deploys to the staging environment. Mirrors what's about to go to prod. Runs through the [staging smoke test](../preparing-for-launch.md#the-manual-smoke-test) before promotion.
- **`dev`**: the working branch. Feature branches merge into `dev`. `dev` promotes to `staging` when a batch of changes is ready for pre-prod verification.

Flow: `feature/foo → dev → staging → main`.

The promotion direction matters. Changes don't merge up the chain automatically: each promotion is a deliberate call that the work is ready for the next environment.

### When to switch

My rule: the first external user is the trigger. Before that, the three-branch model is ritual without purpose: you're doing merge ceremony to yourself. After that, direct commits to `main` are playing with fire.

Don't introduce the three-branch model too early, and don't stay on "develop on main" after you've shipped.

---

## Branch model matters for CI

Whatever branch model you're on, CI needs to match it:

- If the working branch is `dev`, PRs target `dev`, not `main`
- Merges to `main` become a promotion step (dev → staging → main), not the primary integration point
- If you set up CI targeting `main` only and the team works on `dev`, CI won't run on most work

Be explicit about which branches CI runs on. Don't inherit a template that assumes `main` is the working branch if it isn't.

---

## GitHub Actions: Basic Next.js Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test -- --passWithNoTests
```

## Monorepo: scoping CI to a subdirectory

In a monorepo where, say, a Next.js app is under `server/` and an Expo app is under `app/`, you often want CI to only run web checks on web changes (and vice versa). Use path filters:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'server/**'
  pull_request:
    paths:
      - 'server/**'
```

Run the commands from the right working directory:

```yaml
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      - run: npm ci
        working-directory: server
      - run: npx tsc --noEmit
        working-directory: server
```

## Deployment

For Vercel projects: Vercel's GitHub integration handles deployment automatically. No workflow needed for the standard case.

For other platforms (Railway, EC2, Docker Hub):
```yaml
  deploy:
    needs: check
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      # Platform-specific deploy steps here
```

---

## Secrets Management

- Store sensitive values in GitHub repository secrets (Settings → Secrets and variables → Actions)
- Reference with `${{ secrets.MY_SECRET }}`
- Never log secrets, even accidentally (GitHub masks known secrets but don't rely on it)
- Use environment-specific secrets for staging vs production

---

## Rules

- CI must pass before merging. Don't bypass it.
- Secrets live in GitHub Actions secrets: not hardcoded, not in `.env` files committed to the repo
- Deployments to production only from main, not feature branches
- Keep CI fast: if it takes > 5 minutes, something is wrong (or you have a good reason)
- Match CI branch targets to your actual branch model: don't inherit templates blindly
- Pre-deploy: develop on `main`, branches only for "might add" experiments. Post-deploy (first real user): switch to `main` / `staging` / `dev` with an explicit promotion flow.

## Preferences

- Cache `node_modules` or npm cache to speed up runs
- Fail fast: run type check and lint before tests (faster feedback on common errors)
- Add a status badge to the README once CI is set up
- Split long workflows into parallel jobs when it makes sense
- For monorepos: use path filters to avoid running all CI on every change

## AI notes

AI generates GitHub Actions YAML well. Common mistakes: wrong action versions, missing `cache` config, incorrect `if` conditions for branch checks, forgetting `working-directory` in monorepo setups.

Useful prompt: *"Write a GitHub Actions workflow for a Next.js app under `server/` in a monorepo. Run TypeScript type checking, ESLint, and Jest on PRs targeting main or dev. Cache npm dependencies."*
