---
id: stack-nextjs
title: "Next.js"
summary: "My primary framework for web projects. I've used it on Nisatsu, JapanByAlex, and other projects before that. At this point it's the thing I reach for by default."
tags: ["stack", "nextjs"]
updated: 2026-05-28
---
# Next.js

My primary framework for web projects. I've used it on Nisatsu, JapanByAlex, and other projects before that. At this point it's the thing I reach for by default.

---

## Pros

- App Router is genuinely good once you understand the mental model (server vs client components, layouts, loading/error boundaries)
- Full-stack in one repo — API routes + frontend without context switching
- Vercel deployment is nearly zero-config when you're on a standard setup
- Strong ecosystem: next-auth, next-intl, next-themes, etc.
- Server Components reduce client bundle size meaningfully on larger apps
- Incremental Static Regeneration (ISR) is a superpower for content-heavy apps — JBA uses this
- TypeScript support is first-class

## Cons

- App Router learning curve is real — "use client" / "use server" boundaries trip people up
- Server Component data fetching patterns feel inconsistent at times (fetch vs ORM vs db directly)
- Build times can get slow on large apps
- Middleware is powerful but the debugging story is poor
- Some edge cases around caching are legitimately confusing; the docs have gotten better but it's still a source of bugs
- Vendor lock-in risk with Vercel-specific features (OG image, edge functions, etc.)

## When I'd use it again

- SaaS products (nearly always — Nisatsu is this)
- Content sites with a database-driven content model (JBA is this)
- Internal tools that need a UI and some API routes
- Anytime I want SSR or ISR without managing a separate backend initially
- Pure REST API backends (lowkey easy way to deploy vercel functions)

## When I'd avoid it

- React Native apps (obviously — Expo for that)
- Projects where the team is deeply invested in a different framework with no real reason to switch
- Anything that needs long-running server processes (the serverless model doesn't fit)

## Monorepo structure pattern (Nisatsu)

Nisatsu uses a monorepo with the Next.js app under `server/`. This keeps the web app clearly separated from the Expo mobile app under `app/`. It works well but requires some care:

- Build and lint scripts in the root `package.json` need to know the `server/` prefix
- Shared utilities between `server/` and `app/` go in a shared package (or be careful about duplication)
- `next.config.js` lives in `server/` — don't get confused about where to configure things

## Alternatives

- **Svelte** — faster builds, different mental model, I don't know Svelte as well, though.

## Current stance

**Default choice for web projects.** App Router for new projects. Not going back to Pages Router unless there's a specific reason.

---

## Rules

- Never mix App Router and Pages Router in a new project. Pick one.
- All sensitive logic stays server-side. Treat anything in `app/` client components as publicly readable.
- Middleware is not where you put business logic. Keep it lightweight (auth checks, redirects, locale detection).
- Read the generated Prisma migration SQL before deploying. Don't trust the diff alone.
- Use `next/image` for all images. Don't bypass it.
- Auth redirect flows (including `return_to` handling) must be server-side. Don't trust client-passed redirect URLs without validation.

## Preferences

- Colocate components with their route when they're only used in one place
- `app/` directory structure mirrors URL structure — don't fight it
- Keep API routes thin; move logic to service functions
- Use `zod` for all form/request validation
- Prefer server actions for mutations when not dealing with complex optimistic UI
- For content-heavy apps: ISR with `revalidate` over full SSR on every request

## AI notes

Next.js + App Router has a knowledge cutoff problem with AI tools — the App Router patterns changed significantly and older training data produces Pages Router or outdated App Router code. Always specify "App Router" in prompts and review generated file placements carefully.

Useful prompt pattern: *"Using Next.js App Router (not Pages Router), create a [thing]. Use server components where possible. Validate input with Zod."*

AI is good at: layout structures, API route boilerplate, Zod schema generation, middleware patterns.  
AI struggles with: correct fetch caching, when to use `cache()` vs ISR vs dynamic, complex server action error handling, the raw body requirement for webhook routes.
