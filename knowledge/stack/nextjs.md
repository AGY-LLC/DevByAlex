---
id: stack-nextjs
title: "Next.js"
summary: "Default web framework (App Router, Next 16) for web/ and marketing/: version floor, where API docs come from, rules and preferences."
tags: ["stack", "nextjs"]
updated: 2026-11-09
---
# Next.js

**Default for web: App Router, current major (16).** Used for `web/` (full-stack: UI plus route handlers) and `marketing/` in the monorepo `dev-scaffold` sets up. Not for long-running processes or persistent sockets that outgrow Vercel functions: split those into a service.

## Version and API docs

- Install the latest 16.x patch, never older than 16.4.5 (the Nov 3, 2026 security release fixed cross-tenant `use cache` leaks). Next ships a security release every month, so don't pin a patch.
- API details (async request APIs, `proxy.ts`, caching, `revalidateTag`) come from the installed version's bundled docs: `next dev` keeps a managed block in `AGENTS.md` pointing at `node_modules/next/dist/docs/`. Read the relevant doc before writing Next code; don't restate those APIs here or edit between the block's markers.
- Run ESLint directly (`next lint` is gone). Use `next/og` (`ImageResponse`) for OG images, not `@vercel/og`.

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
