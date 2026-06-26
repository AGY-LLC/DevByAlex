---
id: stack-prisma
title: "Prisma"
summary: "My ORM of choice for Node.js projects with a relational database. I've used it with Postgres across multiple projects. The DX is excellent; there are sharp edges worth knowing."
tags: ["stack", "prisma"]
updated: 2026-05-28
---
# Prisma

My ORM of choice for Node.js projects with a relational database. I've used it with Postgres across multiple projects. The DX is excellent; there are sharp edges worth knowing.

---

## Pros

- Schema-first workflow is clean and readable
- Generated TypeScript types mean your queries are type-safe end to end
- Migration system is solid for straightforward schema changes
- Prisma Studio is genuinely useful for quick data inspection during development
- `prisma generate` + `prisma migrate dev` is a tight local feedback loop
- Relation query ergonomics are good once you understand `include` and `select`

## Cons

- **Migration diffs can be destructive if you're not reading them.** This is the big one. Always read the generated SQL.
- Bundle size in serverless environments — Prisma Client can be chunky; configure the output path carefully
- Connection pooling in serverless requires `@prisma/accelerate` or PgBouncer — the naive approach will exhaust your DB connection limit
- Advanced queries (complex aggregations, window functions, recursive CTEs) often require `$queryRaw`
- Schema changes on large tables can lock in production — Prisma doesn't protect you from that
- N+1 query problems are easy to introduce and not always obvious in the generated queries

## Migration state during rapid development

Early in a project, when the schema is in flux and there's no production data to protect, I'll sometimes reset migrations rather than accumulate a long history of migrate-then-undo files. This is a known shortcut with a known cost. But there's a point where it needs to stabilize, and from that point the migration history needs to be clean and tracked properly.

The rule: once there's real user data in the database, migrations must be tracked. Reset is no longer an option.

## DB as source of truth for content

For content-heavy sites, Prisma works well as the runtime source of truth even when the content itself originates from structured files. The pattern: a `content/` directory holds authored files (Markdown, JSON) that seed the database, but the Prisma-managed DB is what the site reads at runtime.

The schema gives typed queries and a migration history. Content can be updated directly in the DB or re-seeded from files. The site only ever reads from the DB. Avoids the classic file-system-vs-database drift where the two disagree on what the current state is.

## When I'd use it again

- Any Node/TypeScript project with Postgres
- Projects where developer velocity matters and query complexity is manageable
- When I want generated types without writing them by hand

## When I'd avoid it

- Performance-critical queries at scale (drop to raw SQL or a thinner query builder like Kysely)
- Projects where the team is deeply Postgres-native and would prefer to write SQL
- When the schema is very dynamic or document-shaped (use a document DB instead)

## Alternatives

- **Drizzle ORM** — leaner, SQL-first, TypeScript-native. I've been watching it and it looks good for projects where migration flexibility matters.
- **Kysely** — type-safe query builder without the ORM layer. More control, more verbosity.
- **TypeORM** — I've used it. I'd rather use Prisma.
- **Raw `pg`** — sometimes the right answer for specific high-performance queries.

## Current stance

**Default ORM for Postgres projects.** Keeping an eye on Drizzle for new projects where schema migration flexibility matters more.

---

## Rules

- **Always read the generated migration SQL before running it in production.** Non-negotiable.
- Use connection pooling (PgBouncer or Prisma Accelerate) in any serverless context. Direct connections will bite you.
- Never run `prisma migrate reset` on a production database.
- Use `$transaction` for any operation that needs to be atomic.
- Once there's real user data, migrations must be tracked. No more resets.

## Preferences

- Keep Prisma schema in `prisma/schema.prisma` — don't split it across files unless the schema is genuinely huge
- Use `select` over `include` when you don't need the full relation — reduces over-fetching
- Put data access logic in repository functions, not scattered through route handlers
- Use `@map` and `@@map` to keep the Prisma model names JS-friendly while the DB uses snake_case

## AI notes

AI is very good at generating Prisma schemas from a description. It's also good at generating basic CRUD queries.

It tends to miss: connection pooling setup for serverless, the need for `$transaction` on multi-step writes, performance implications of certain relation patterns.

AI doesn't know your migration history. If you've reset migrations or made out-of-band schema changes, the AI's schema assumptions may be stale. Always give it the current `schema.prisma` content when asking for migration-related help.

Useful prompt: *"Generate a Prisma schema for [domain]. Use Postgres conventions (snake_case column names, `@@map`). Include appropriate indexes."*
