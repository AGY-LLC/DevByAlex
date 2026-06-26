---
id: stack-node-express
title: "Node.js + Express"
summary: "My go-to for standalone API services that don't belong in a Next.js project. Not glamorous. Extremely reliable once you know its quirks."
tags: ["stack", "node-express"]
updated: 2026-05-28
---
# Node.js + Express

My go-to for standalone API services that don't belong in a Next.js project. Not glamorous. Extremely reliable once you know its quirks.

---

## Pros

- Minimal and flexible — you build exactly what you need
- Massive ecosystem
- Easy to understand what's happening (no magic)
- Simple to deploy anywhere: Docker, EC2, Railway, Render
- Great for background workers, webhook processors, scheduled jobs
- Easy to structure as a microservice or standalone service

## Cons

- No opinions means you make all the decisions — project structure, error handling, logging, all of it
- Middleware stacking is manual and easy to get wrong (especially order of operations for auth + error handlers)
- Error handling patterns are inconsistent — you have to be deliberate about it
- Doesn't have the TypeScript-first DX of newer frameworks
- `async/await` error propagation requires careful handling — uncaught rejections in Express v4 are a footgun

## When I'd use it again

- Standalone backend service that doesn't need a frontend
- Webhook receiver / processor
- Background job runner
- When a team knows Express well and there's no reason to learn something else
- Microservice with tight scope

## When I'd avoid it

- Starting a new full-stack project (use Next.js instead)
- Teams with no Node.js background
- Projects that need a strongly-opinionated structure from day one

## Alternatives

- **Fastify** — faster, better TypeScript support, plugin system is solid. My pick if starting fresh on a Node API.
- **Hono** — excellent for edge/serverless. Lightweight and fast.
- **NestJS** — opinionated, enterprise-y. Good if the team likes decorators and you need the structure.
- **tRPC** — not a framework, but worth considering if you're staying in TypeScript end-to-end.

## Current stance

**Still use it, but would pick Fastify for new standalone services.** If the project already has Express, I'm not fighting it.

---

## Rules

- Always add a global error handler middleware (4-parameter: `(err, req, res, next)`)
- `async` route handlers need a wrapper or you'll silently swallow errors in Express v4
- Validate all request inputs — use Zod at the route handler level
- Rate limit public endpoints; don't rely on infra alone

## Preferences

- Structure: `src/routes/`, `src/middleware/`, `src/services/`, `src/lib/`
- Keep route handlers thin — logic goes in service functions
- Use `dotenv` + a Zod-validated `env.ts` for environment variables
- Log with structured JSON (pino or winston) — `console.log` in production is painful

## AI notes

AI is very good at Express boilerplate. Watch for missing async error handling — AI often generates `async` route handlers without the error propagation wrapper.

Also watch for outdated patterns (Express 4 vs 5, which is now stable).

Useful prompt: *"Create an Express route handler for [endpoint]. Use TypeScript. Validate input with Zod. Handle async errors properly."*
