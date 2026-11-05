---
id: stack-nextjs
title: "Next.js"
summary: "Default web framework (App Router, Next 16) for web/ and marketing/; Rules, Next 16 changes, and where agents go wrong."
tags: ["stack", "nextjs"]
updated: 2026-11-05
---
# Next.js

**Default for web: App Router, current major (16).** Used for `web/` (full-stack: UI plus route handlers) and `marketing/` in the monorepo `dev-scaffold` sets up. Not for long-running processes or persistent sockets that outgrow Vercel functions: split those into a service.

## Next 16 changes agents get wrong

- `middleware.ts` is now **`proxy.ts`** (`export function proxy`), Node runtime only. Edge-only projects keep `middleware`.
- `headers()`, `cookies()`, `draftMode()`, `params` and `searchParams` are async: `await` them. In route handlers, read request headers from `req.headers`.
- Caching: Cache Components (`cacheComponents: true`, `"use cache"`, `cacheLife`, `cacheTag`) replace segment-level `revalidate` in apps that opt in; others keep ISR. `revalidateTag` takes a second argument (or use `updateTag`).
- Turbopack is the default for dev and build. `next lint` is gone: run ESLint directly.
- Use `next/og` (`ImageResponse`) for OG images, not `@vercel/og`.

## Rules

- Never mix App Router and Pages Router in a new project.
- All sensitive logic stays server-side. Treat client components as publicly readable.
- `proxy.ts` holds only light work (auth checks, redirects, locale): no business logic.
- Use `next/image` for all images.
- Auth redirect flows (including `return_to`) are server-side; validate any client-passed redirect (`../checklists/auth-setup.md`).
- Webhook routes read the raw body (`await req.text()`) before verifying signatures.

## Preferences

- Colocate components with their route when only one route uses them; `app/` mirrors URL structure.
- Thin route handlers; logic in `services/`.
- Zod for all form and request validation.
- Server actions for mutations unless the UI needs complex optimistic state (`./server-actions-vs-api-routes.md`).
- Content-heavy pages: cached/static rendering over full SSR per request.
- Always say "App Router, Next 16" when prompting for Next code; older training data produces Pages Router or pre-16 APIs.
