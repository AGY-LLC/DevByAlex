---
id: stack-firebase
title: "Firebase / Auth Tools"
summary: "I've used Firebase for auth (Firebase Auth) and related services. My relationship with it is complicated: it's fast to start, and Google OAuth via Firebase is still something I reach for in specifi…"
tags: ["stack", "firebase"]
updated: 2026-05-28
---
# Firebase / Auth Tools

I've used Firebase for auth (Firebase Auth) and related services. My relationship with it is complicated: it's fast to start, and Google OAuth via Firebase is still something I reach for in specific cases.

These days I reach for Stytch over Firebase Auth when cross-platform sessions matter, and for restricted Google OAuth when I just need admin-only access. The notes below reflect what I've learned from both patterns.

---

## What it solves

Managed auth, realtime database, file storage, and cloud functions — without managing your own infrastructure. Firebase Auth specifically handles OAuth providers, email/password, phone auth, and session management out of the box.

## Why I used it (historically)

Familiarity and speed. Firebase Auth handles Google/Apple OAuth, email flows, and session management with minimal setup. For early-stage apps where auth isn't the product, it gets you unblocked fast.

## Why I moved away from it for cross-platform projects

When a project has both a Next.js web app and an Expo mobile app, auth needs to work cleanly on both. Firebase Auth can handle this, but the session model and token refresh behavior require careful handling on both platforms, and the experience of unifying them wasn't clean. Stytch gave a better story for cross-platform auth with less per-platform wiring.

The token refresh issue is the one that burned me most: Firebase ID tokens expire in one hour. If the client doesn't proactively refresh before making a request, you get an auth failure that's intermittent and hard to reproduce. This is fixable, but it's a trap that's easy to fall into.

## Google OAuth for admin-only surfaces

For an admin UI with a known, restricted list of editors (think: a content site where one or two people publish posts), the right call is usually Google OAuth with a hardcoded allowlist. Doesn't have to use Firebase Auth directly — OAuth through the auth adapter works — but the principle is the same: Google-authenticated sessions only, no public registration, no password reset flows.

For a single-editor admin, this is the right call. Zero user management overhead.

## Setup shape (if using Firebase Auth)

**Firebase Auth (client-side)**
```
npm install firebase
```
```ts
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const app = initializeApp({ /* config from Firebase console */ })
export const auth = getAuth(app)
```

**Firebase Admin (server-side, for verifying tokens)**
```
npm install firebase-admin
```
```ts
// lib/firebase-admin.ts
import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(/* service account */),
  })
}

export const verifyToken = (token: string) =>
  admin.auth().verifyIdToken(token)
```

**Typical auth flow (Next.js):**
- Client signs in via Firebase Auth SDK
- Client gets an ID token (`user.getIdToken()`)
- Client sends token in Authorization header
- Server verifies with Firebase Admin SDK

## Pitfalls

- **Token expiry** — ID tokens expire in 1 hour. Client needs to proactively refresh before sending. Easy to miss; causes intermittent auth failures.
- **Firebase UID ≠ your user ID** — Always maintain your own user record keyed to the Firebase UID. Don't use Firebase UID as your primary user identifier in your database.
- **Firestore security rules** are powerful but confusing. Easy to accidentally expose data.
- **Vendor lock-in is real.** Firestore's data model doesn't export cleanly. Plan your exit before you need it.
- **Firebase Auth on both web and mobile** — doable, but the session handling patterns are different enough that you'll write more platform-specific code than you might expect.

## Security notes

- Never expose service account credentials in client code.
- Always set restrictive Firestore rules — default open rules are a trap.
- Validate Firebase tokens server-side for any privileged operation.
- Don't use the Firebase Admin SDK on the client.

## Testing notes

- Firebase offers a local emulator suite — use it when testing auth flows.
- `firebase emulators:start` for auth, Firestore, functions locally.
- Testing Firebase Auth flows in integration tests requires either the emulator or careful mocking.

## What I'd repeat

- Firebase Auth for simple Google-only OAuth when cross-platform is not a requirement
- Firebase Emulator Suite for local development
- Firebase Storage for simple file uploads when you don't want to manage S3

## What I'd avoid

- Firebase Auth when you need a unified cross-platform session model — look at Stytch or similar
- Firestore as the primary database for structured relational data (use Postgres)
- Deep coupling to Firebase — always put it behind an abstraction layer
- Relying on client-side Firestore rules as your only security boundary

## Stytch (as an alternative)

My current go-to for cross-platform auth. Better session model than Firebase for this use case, handles magic links and OAuth, and the API is clean. Less familiarity in the ecosystem than Firebase, but the documentation is solid.

If you're building something with both a web app and a mobile app that need to share sessions, Stytch is worth evaluating before defaulting to Firebase.

---

## Rules

- Always verify auth tokens server-side. Client-sent tokens are untrusted input.
- Keep your own user record in your database, linked to the auth provider UID.
- Set explicit access controls. Never deploy with open/default rules.

## Preferences

- Use Firebase Auth for simple Google OAuth when you have a single web target and familiarity matters
- For cross-platform (web + mobile), evaluate Stytch before defaulting to Firebase
- Wrap auth provider calls in adapter functions so you can swap them out later

## AI notes

AI knows Firebase Auth fairly well but sometimes mixes up client SDK vs Admin SDK contexts. Always specify which side you're on in your prompt.

AI also tends to miss the token refresh issue — it'll generate code that calls `getIdToken()` without proactive refresh. Always add the refresh logic explicitly.

Useful prompt: *"Write a server-side token verification middleware for Next.js App Router that uses Firebase Admin to verify a Bearer token from the Authorization header. Return 401 on invalid or missing token. TypeScript."*
