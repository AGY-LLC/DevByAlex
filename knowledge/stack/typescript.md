---
id: stack-typescript
title: "TypeScript"
summary: "My non-negotiable. Every project I write now is TypeScript. The question is just how strictly to configure it."
tags: ["stack", "typescript"]
updated: 2026-05-28
---
# TypeScript

My non-negotiable. Every project I write now is TypeScript. The question is just how strictly to configure it.

---

## Why I don't have a "pros and cons" section here

Because at this point I'm not evaluating it. TypeScript is the default, the way a seatbelt is a default. The rest of this page is about how I use it, not whether to use it.

If you want the argument for TypeScript, it's simple: catching a type error in your editor before it becomes a runtime exception in production is worth every second of the overhead.

---

## Strict mode

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

`strict: true` enables a bundle of checks:
- `strictNullChecks`: the most important one. Variables can't be `null` or `undefined` without explicitly handling it.
- `noImplicitAny`: no accidental `any` types from untyped parameters
- `strictFunctionTypes`: better function type checking
- And others

I don't weaken these. If something doesn't type-check under strict mode, I fix the types: I don't turn off the check.

---

## No `any`

If you know the type, use it. If you don't know the type yet, use `unknown` and narrow it:

```ts
// Bad
function processData(data: any) { ... }

// Better
function processData(data: unknown) {
  if (typeof data !== 'object' || !data) throw new Error('Expected object')
  // narrow and use
}
```

The one place `any` might appear: third-party libraries with poor type coverage. In that case, wrap the call and return a typed result so the `any` doesn't leak into your code.

---

## Infer types from schemas, don't duplicate

Zod schemas are the source of truth for types. Use `z.infer<>` rather than writing separate interfaces:

```ts
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

// Don't write: interface CreateUserInput { email: string; name: string }
// Do this:
type CreateUserInput = z.infer<typeof CreateUserSchema>
```

Same for Prisma: the generated types are good. Don't write parallel interfaces that drift.

---

## `const` by default

```ts
// Default to const
const name = 'Alex'

// Use let only when reassignment is necessary
let total = 0
for (const item of items) {
  total += item.price
}
```

---

## Path aliases

Next.js configures `@/` as an alias to the project root. Use it rather than relative paths from deep in the tree:

```ts
// Instead of: import { prisma } from '../../../lib/prisma'
import { prisma } from '@/lib/prisma'
```

---

## Non-null assertion (`!`): use sparingly

The `!` assertion tells TypeScript "this won't be null, trust me." It's a lie you're making to the compiler. Use it only when you genuinely know something is non-null and TypeScript can't infer it:

```ts
// Usually fine: env var checked at startup
const apiKey = process.env.API_KEY!

// Dangerous: this might actually be null
const element = document.getElementById('root')!
```

Prefer guard clauses or optional chaining over `!` where possible.

---

## Discriminated unions

Useful for representing state machines or result types:

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function fetchUser(id: string): Result<User> {
  // TypeScript narrows correctly on the `ok` field
}

const result = fetchUser('123')
if (result.ok) {
  console.log(result.data) // TypeScript knows this is User
} else {
  console.error(result.error) // TypeScript knows this is string
}
```

---

## Type vs interface

I generally use `type` for most things and `interface` for object shapes that need to be extended or implemented. In practice, the distinction rarely matters: pick one and be consistent within a codebase.

---

## tsconfig for Next.js

The `create-next-app` tsconfig is fine as a starting point. Things I usually add or verify:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,   ← catches array out-of-bounds
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

`noUncheckedIndexedAccess` makes array indexing safer: `arr[0]` returns `T | undefined` rather than `T`. This catches more bugs but also requires more explicit checks. Worth it.

---

## Current stance

**TypeScript everywhere, strict mode, no `any`.** Not negotiable.

---

## Rules

- `strict: true` in tsconfig. No weakening.
- No `any`. Use `unknown` and narrow, or fix the underlying type issue.
- Types are inferred from Zod schemas and Prisma: don't write duplicate interfaces.
- Path aliases over deep relative imports.

## Preferences

- `type` over `interface` for most things (personal preference, low stakes)
- `noUncheckedIndexedAccess: true` for new projects
- Keep types colocated with what they describe, not in a giant `types/index.ts`

## AI notes

AI writes TypeScript well. Common issues:
- Generates `any` types when it's not sure: always ask for `unknown` and narrowing instead
- Sometimes generates `interface` vs `type` inconsistently: cosmetic but worth standardizing in a codebase
- TypeScript generic inference can be tricky; AI sometimes over-annotates where inference would work, or under-annotates where it wouldn't

Useful instruction to add to prompts: *"TypeScript strict mode. No `any`. Use `unknown` if the type is genuinely unknown. Infer types from Zod schemas with `z.infer<>`."*

---

*See also: [Zod](./zod.md) | [AI Directives](../ai/directives.md)*
