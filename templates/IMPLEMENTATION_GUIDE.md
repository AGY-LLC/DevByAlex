# {{APP_NAME}} — Implementation Guide

> Written by `/plan-guide` from the approved spec. The dev stage builds and
> validates against this. **Needs Alex's approval** (gate in `docs/STATUS.md`)
> before dev. Per-feature detail lives in `docs/features/`.

**Status:** draft <!-- draft | approved -->
**Updated:** {{DATE}}

## Stack decisions

- _Language/framework, package manager, ORM, test runners, CI. Default to Alex's
  stack: TypeScript `strict`, Zod at boundaries, thin handlers + `services/`,
  Prisma (reviewed migrations), Jest + Playwright, ESLint/Biome._

## Build order (dependencies first)

1. **Scaffold** — baseline (`/dev-scaffold`).
2. **Authentication** — `/dev-auth`.
3. _Feature — `docs/features/03-…md`_
4. _…_

> Rationale: _why this order — highest-risk / most-depended-on first._

## Features

| # | Feature | Card | Depends on | One-line purpose |
|---|---------|------|------------|------------------|
| 3 | _…_ | `docs/features/03-….md` | auth | _…_ |

## Cross-cutting concerns

- **Auth/authz model:** _default-deny, where checks live._
- **Error handling:** _shape of errors, user-facing vs. logged._
- **Validation:** _Zod at every boundary._
- **Logging/observability:** _logger, what gets logged (never secrets)._
- **Env/config:** _Zod-validated env, `.env.example`, secrets handling._
- **Testing strategy:** _what's unit vs. integration vs. E2E; high-risk areas
  that must be covered (auth, permissions, billing, validation, critical flows)._
- **CI:** _install → lint → typecheck → test → build._

## Notes / decisions

- _Material decisions and their rationale (also record via
  `mcp__buildsbyalex__record_decision` for tracked projects)._
