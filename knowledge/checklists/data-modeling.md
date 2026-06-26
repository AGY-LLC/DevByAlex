---
id: checklists-data-modeling
title: "Data Modeling"
summary: "Schema-design principles that sit above Prisma mechanics: design the model before the API, put audit/lifecycle fields on everything, index for the queries you're about to write, and decide soft-delete and many-to-many shape up front because retrofitting them is expensive."
tags: ["checklists", "data-modeling", "database", "prisma", "schema"]
updated: 2026-05-30
---
# Data Modeling

[Prisma](../stack/prisma.md) covers the tool. This is how to design the schema itself — the decisions that are cheap to make early and expensive to change once business logic sits on top of them. Pairs with Step 3 of [How I Start Projects](./how-i-start-projects.md).

## Principles

- **Design the data model before the API or UI.** Sketch the schema from the spec first (often with AI help: give it the spec, get a draft, revise). Retrofitting a model under existing logic is the expensive kind of change; renaming a column on day one is free.
- **The database is the runtime source of truth.** Seed files and `content/` dirs are inputs, not what the app reads at runtime.
- **Every model gets `createdAt` / `updatedAt`.** Non-negotiable. You will want them.
- **Real user model with `id` + `email`** even when an external provider handles auth; store the provider's uid in a `providerUid` field to link records.
- **Lifecycle = explicit status enum.** Anything with states (subscriptions, content, orders, uploads) gets a `status`/`state` enum, not a pile of booleans. Name the states and the legal transitions: e.g. content `draft → reviewed → published`; media `uploaded → processing → ready → failed`.

## Decide before the first migration

- [ ] **Indexes** — which columns do the queries you're about to write filter/sort/join on? Add those indexes now. Index foreign keys and anything in a `WHERE`/`ORDER BY` on a hot path.
- [ ] **Many-to-many** — do you genuinely need a join table, or is that modeling something that's actually one-to-many? Don't reach for M2M reflexively; it's real complexity.
- [ ] **Soft deletes** — decide per model now (`deletedAt` nullable vs hard delete). Adding soft-delete after queries exist means auditing every query for the filter.
- [ ] **Uniqueness & referential integrity** — unique constraints and FK relations belong in the schema, not enforced only in app code.
- [ ] **Enums vs free text** — anything with a known, small set of values is an enum.
- [ ] **Money & time** — money in integer minor units (never floats); timestamps in UTC; be explicit about timezone at the edges.

## Migrations

- **Read the generated SQL before applying** — Prisma can silently choose a destructive path (drop+recreate) for a change you thought was additive.
- **Stabilize migration history before production.** It's fine for the schema to churn during early dev (schema push, reset history); lock in clean migration files before any real user data exists.
- Additive changes (new nullable column, new table) are safe; destructive ones (drop, narrow a type, add a NOT NULL without default) need a backfill plan.

## Serverless gotcha

In serverless/edge runtimes, use a single Prisma client and a pooled connection (PgBouncer / provider pooler) — a client per invocation exhausts connections. See [Prisma](../stack/prisma.md).

*See also: [Prisma](../stack/prisma.md) | [How I Start Projects](./how-i-start-projects.md)*
