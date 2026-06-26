---
id: stack-server-actions-vs-api-routes
title: "Server Actions vs API Routes"
summary: "One of the first structural decisions in any Next.js App Router project: where does mutation logic live?"
tags: ["stack", "server-actions-vs-api-routes"]
updated: 2026-05-28
---
# Server Actions vs API Routes

One of the first structural decisions in any Next.js App Router project: where does mutation logic live?

---

## The options

**API routes** — traditional HTTP endpoints in `app/api/[route]/route.ts`. Return JSON. Callable from anywhere, including external clients.

**Server actions** — async functions marked `'use server'` that run on the server, callable directly from client components or other server code. Introduced in Next.js 13 App Router.

---

## When to use server actions

Server actions are the right default for form submissions and user-initiated mutations that don't need to be called from outside the app.

They shine when:
- The mutation is tied to a form (Next.js has first-class form + action support)
- The caller is always a client component in your own app
- You want to skip the JSON serialization overhead
- You want to colocate the mutation logic with the component that triggers it
- Optimistic UI with `useOptimistic` is in scope

```ts
// app/actions/user.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const UpdateProfileSchema = z.object({
  name: z.string().min(1),
})

export async function updateProfile(formData: FormData) {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')

  const input = UpdateProfileSchema.parse({
    name: formData.get('name'),
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: input.name },
  })
}
```

---

## When to use API routes

API routes are the right choice when:
- The endpoint needs to be called by external clients (mobile app, third-party, CLI)
- It's a webhook receiver (Stripe, etc.) — these require `POST` with specific headers
- You want a stable HTTP contract that other systems can depend on
- You need fine-grained control over response headers, status codes, caching

```ts
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyToken(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true },
  })

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(profile)
}
```

---

## When a mobile client shares the backend

If a Next.js app is serving both a web client and a native/Expo mobile client, the mobile client can't use server actions — they're a Next.js-specific mechanism. So API routes are the right choice for anything the mobile app needs to call.

In that setup, some mutations end up with both a server action (for web) and an API route (for mobile). The pattern I've landed on: both the server action and the API route are thin wrappers that call the same service function, which contains the actual logic.

```
Server action → service function ← API route
```

This avoids duplicating business logic while allowing both clients to use the appropriate interface.

---

## Summary

| Concern | Server Action | API Route |
|---------|--------------|-----------|
| Web app mutations | ✅ Best fit | Works |
| Form submissions | ✅ Best fit | Works |
| Mobile app / external clients | ❌ Not callable | ✅ Required |
| Webhooks | ❌ Wrong model | ✅ Required |
| HTTP status control | Limited | ✅ Full control |
| Caching / cache headers | Limited | ✅ Full control |
| Error handling ergonomics | `throw` or return | `Response.json()` |

---

## Rules

- Webhook endpoints are always API routes. No exceptions.
- Endpoints called by external clients (mobile app, etc.) are always API routes.
- Auth check is always the first thing in both server actions and API routes — before any business logic.

## Preferences

- Default to server actions for in-app mutations on web; move to an API route only when there's a reason
- Keep the service layer as the shared logic core — actions and routes are thin wrappers
- Name service functions clearly: `updateProfile`, `cancelSubscription`, not `handleFormSubmit`

---

*See also: [Architecture Patterns index](./index.md) | [AI Directives](../ai/directives.md)*
