---
id: stack-prisma
title: "Prisma"
summary: "Default ORM for Postgres projects. Pin ORM 7; read every migration's SQL; pool connections in serverless."
tags: ["stack", "prisma"]
updated: 2026-11-05
---
# Prisma

**Default ORM for Postgres projects.** Drop to `$queryRaw` (or Kysely) for complex aggregations, window functions, recursive CTEs, or hot paths where generated queries are too slow.

## Version: pin ORM 7

- Install `prisma@7` and `@prisma/client@7`, never unpinned. npm's `latest` tag for `prisma` is the ORM 8 release candidate, whose CLI doesn't read `schema.prisma` and has no `generate`, `migrate dev` or `db push`. Never pin 6: it stops getting security patches 2026-11-19.
- ORM 8 is a deliberate upgrade decision once it reaches GA, recorded in `docs/DECISIONS.md`, not something a fresh install picks up.

## ORM 7 setup (differs from 6)

- Generator is `prisma-client` with an explicit `output` path; import the client from that path, not from `@prisma/client`.
- The datasource URL lives in `prisma.config.ts`, not `schema.prisma`. `.env` is no longer loaded automatically: load it in the config or the env module.
- `new PrismaClient({ adapter })` needs a driver adapter (e.g. `@prisma/adapter-pg`, or Neon's adapter on Neon).
- `migrate dev` no longer runs `generate` or the seed: run them explicitly.
- ESM-only; needs Node 20.19+ and TypeScript 5.4+.

## Rules

- **Read the generated migration SQL before it runs in production.** Prisma can pick a destructive path (drop and recreate) for a change that looks additive.
- Pool connections in any serverless context: PgBouncer or the provider's pooled URL through the driver adapter. Prisma Accelerate retires 2026-12-01: don't use it.
- One client per process (a module-level singleton), never one per request.
- Never run `prisma migrate reset` against a database with real user data. Before that point, resetting history is fine; after it, migrations are tracked.
- Use `$transaction` for any multi-step write that must be atomic.
- Schema changes on large tables can lock in production; plan the migration, Prisma won't.
- Watch for N+1 queries in relation loops.

## Preferences

- One schema at `prisma/schema.prisma` unless it's genuinely huge.
- `select` over `include` when the full relation isn't needed.
- Data access in repository/service functions, not scattered through route handlers.
- `@map` / `@@map` so models stay JS-friendly while the DB uses snake_case.
- Give the agent the current `schema.prisma` before any migration work; it doesn't know out-of-band changes or reset history.
