---
id: stack-zod
title: "Zod"
summary: "My default validation library for TypeScript projects. I use it for API input validation, form schemas, environment variable parsing, and anywhere else I need runtime type safety that matches my st…"
tags: ["stack", "zod"]
updated: 2026-05-28
---
# Zod

My default validation library for TypeScript projects. I use it for API input validation, form schemas, environment variable parsing, and anywhere else I need runtime type safety that matches my static types.

---

## Pros

- TypeScript-first: infer types directly from schemas (`z.infer<typeof MySchema>`)
- Excellent error messages out of the box
- Composable — schemas can be combined, extended, and transformed cleanly
- Works great with react-hook-form
- Also works server-side: validate API bodies, env vars, anything
- The `.safeParse()` vs `.parse()` distinction is clear and useful

## Cons

- Bundle size is meaningful — not tiny, worth considering in client-heavy bundles
- Complex validation logic (cross-field dependencies) requires `.refine()` or `.superRefine()`, which can get verbose
- Error path handling for nested schemas takes some learning
- Not the fastest runtime option for high-throughput scenarios (unlikely to matter for most apps)

## When I'd use it again

- Any TypeScript project with user input, API calls, or external data
- Environment variable validation (`zod` + a simple `env.ts` file is the best pattern I've found)
- Form validation with react-hook-form's `zodResolver`

## When I'd avoid it

- Projects where Yup is already established and working — not worth migrating
- Pure server-side validation where something like Joi is already entrenched

## Alternatives

- **Yup** — similar, I just prefer Zod's TypeScript integration
- **Valibot** — significantly smaller bundle, compatible API, worth considering for client-heavy code
- **io-ts** — powerful but verbose and complex; not worth it for most projects

## Current stance

**Default validation library.** Use it everywhere: API routes, server actions, forms, env parsing.

---

## Rules

- Validate all external data at the boundary — API inputs, webhook payloads, environment variables
- Never trust client-sent data even if the frontend also validates it
- Use `z.infer` for your types; don't write separate TypeScript interfaces for things Zod already knows about

## Preferences

- Keep schemas colocated with what they validate (not in a single giant `schemas.ts` file)
- Use `.safeParse()` in API routes — better control over error responses
- Build a shared `env.ts` that parses `process.env` through a Zod schema at startup so misconfigured environments fail loudly

## AI notes

AI generates Zod schemas reliably from descriptions. It's one of the most reliable code generation tasks.

Useful prompt: *"Write a Zod schema for a [description of data shape]. Include appropriate error messages for `.refine()` checks."*

Occasionally AI will use deprecated Zod v3 patterns or miss newer Zod v3.x features — check the current docs for anything unfamiliar.
