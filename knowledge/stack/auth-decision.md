---
id: stack-auth-decision
title: "Auth Decision Guide"
summary: "Which auth solution to reach for and why. This isn't a comprehensive survey — it's a decision framework based on what I've actually shipped."
tags: ["stack", "auth-decision"]
updated: 2026-05-28
---
# Auth Decision Guide

Which auth solution to reach for and why. This isn't a comprehensive survey — it's a decision framework based on what I've actually shipped.

---

## The short version

| Scenario | What I'd use |
|----------|-------------|
| Web-only SaaS, want to move fast | Auth.js |
| Web + mobile app sharing sessions | Stytch |
| Admin-only restricted access | Google OAuth (Auth.js) |
| Need magic links + good mobile SDK | Stytch |

---

## Firebase Auth

### What it's good at
- Fast to set up, especially for Google OAuth
- Battle-tested at scale
- Good documentation and huge community
- Handles email/password, Google, Apple, phone auth out of the box
- Firebase Emulator Suite is excellent for local development

### What it's not good at
- Cross-platform session unification (web + mobile requires extra per-platform handling)
- Token expiry: ID tokens expire in 1 hour and if you don't handle proactive refresh, you get intermittent auth failures that are hard to reproduce
- Vendor lock-in is meaningful — if you want to migrate off later, it's work

### When I'd use it
- Web-only project, single platform
- Already using other Firebase services and want one integration
- Admin-only restricted access where Google OAuth is sufficient
- Speed matters and cross-platform is not in scope

### When I'd avoid it
- Web + mobile app that need to share auth session state cleanly
- Situations where I need a unified token/session model across platforms
- Projects where I want clear portability

**Key pitfall:** ID tokens expire in one hour. Clients must proactively refresh them before making requests. Easy to miss; causes intermittent failures. See [Firebase integration page](./firebase.md).

---

## Stytch

### What it's good at
- Clean cross-platform session model — the same session works on web and mobile
- Magic links, OAuth, SMS OTP all built in
- Good developer experience; API is clean
- Handles the hard parts of cross-platform auth without per-platform special-casing
- Session tokens with configurable expiry (not the Firebase 1-hour hard expiry)

### What it's not good at
- Smaller ecosystem than Firebase — fewer third-party tutorials
- More expensive than Firebase at scale
- Newer, so AI assistance is thinner and less reliable (always verify generated Stytch code)

### When I'd use it
- Web + mobile project where sessions need to unify across platforms
- When magic links are a product requirement
- When I don't want to rebuild the token refresh problem from scratch

### When I'd avoid it
- Pure web project where Firebase or Auth.js is sufficient
- Very early prototype where cost matters more than the cross-platform story

**Currently using it on:** cross-platform (web + mobile) projects where session unification matters. See [Projects](../projects/index.md) for where this has actually played out.

---

## Auth.js (formerly NextAuth.js)

### What it's good at
- Good fit for Next.js; maintained by Vercel (loosely)
- Handles OAuth providers cleanly
- You keep full control of sessions — stored in your own DB
- Flexible: works with any OAuth provider, email/password, or credentials
- No external auth vendor dependency (your sessions are in your database)

### What it's not good at
- The v4 → v5 migration was rough; documentation has been inconsistent
- Configuration has some sharp edges; the "credentials provider" is easy to misuse
- Not great for mobile apps — designed for web sessions
- More to configure than Firebase or Stytch out of the box

### When I'd use it
- Web-only project where I want session ownership (no external vendor)
- Projects where the OAuth providers list matters (Github, Discord, etc.)
- When I'm already deep in the Next.js ecosystem and want minimal external dependencies

### When I'd avoid it
- Web + mobile (doesn't have a mobile session story)
- When I want to move fast and not configure a session store

---

## Clerk (I haven't used this yet but have heard great things)

### What it's good at
- Best-in-class developer experience — seriously good UI components
- Handles multi-tenancy / organizations out of the box
- Good React hooks, prebuilt components
- Passkeys, MFA, SSO all available

### What it's not good at
- More expensive than most alternatives at meaningful scale
- Pre-built components are opinionated — you trade flexibility for speed
- Can feel like overkill for simple auth needs

### When I'd use it
- B2B SaaS with team/org accounts
- Projects where auth UI needs to be polished fast without custom work
- When the budget supports it

### When I'd avoid it
- Simple consumer apps where the feature set is overkill
- Price-sensitive early stage projects

---

## The cross-platform question

This is the most important decision point. If you have both a web app and a mobile app:

- They need to share the same user concept in your database
- Sessions/tokens need to work from both clients
- Token refresh needs to work on both clients (mobile has different lifecycle constraints than web)
- Logout on one platform should ideally invalidate the session on the other

Firebase Auth can handle this, but requires more per-platform wiring. Stytch's session model makes it more natural.

For cross-platform projects specifically: the choice to use Stytch is usually driven entirely by this. Web + Expo + clean unified sessions = Stytch.

---

## Regardless of provider: non-negotiables

No matter which auth solution you use:

- **Token verification server-side.** Every protected request. Client-sent tokens are untrusted input.
- **Your own user record.** Keep a user row in your database keyed to the provider UID. Don't use the provider as your user store.
- **Return-to-origin redirect.** When a user visits a protected page while logged out, land them there after login, not always at `/dashboard`. This sounds small; skipping it is always regretted.
- **Rate limiting on auth endpoints.** Brute force is real.
- **Explicit redirect validation.** If you accept a `return_to` parameter, validate it's a relative path before redirecting.

See [Auth Setup Checklist](../checklists/auth-setup.md) for the full implementation checklist.

---

*See also: [Firebase integration](./firebase.md) | [Projects](../projects/index.md) | [Auth Setup Checklist](../checklists/auth-setup.md)*
