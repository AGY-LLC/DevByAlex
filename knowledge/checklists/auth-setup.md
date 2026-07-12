---
id: checklists-auth-setup
title: "Auth Setup Checklist"
summary: "What I go through every time I set up authentication on a new project. Informed by real experience across cross-platform (web + mobile) and admin-only projects."
tags: ["checklists", "auth-setup"]
updated: 2026-05-28
---
# Auth Setup Checklist

What I go through every time I set up authentication on a new project. Informed by real experience across cross-platform (web + mobile) and admin-only projects.

---

## Planning

- [ ] Decide: build auth or use a service (Stytch, Firebase Auth, Auth.js, Clerk, Supabase Auth)
- [ ] Decide: which providers? Email/password, Google, Apple, magic link?
- [ ] If building for web + mobile: confirm the auth provider has a clean cross-platform story before committing
- [ ] Decide: sessions vs JWTs (or both)
- [ ] Does the app need roles/permissions? Design now, not later.
- [ ] Does the app need organization/team accounts? Design now.
- [ ] Is the admin/editor UI restricted to specific users? Design the allowlist pattern now.

---

## Database

- [ ] User table with at minimum: `id`, `email`, `createdAt`
- [ ] If using an external auth provider: add a `providerUid` field to link records (e.g., `stytchUserId`, `firebaseUid`)
- [ ] If implementing roles: `role` enum or separate `user_roles` table
- [ ] If using sessions: session table or rely on JWT (decision recorded)

---

## Implementation

- [ ] Sign up creates a user record in your database (not just in the auth service)
- [ ] Login flow verified end to end
- [ ] Email verification configured if required
- [ ] Password reset flow configured and tested (if using email/password)
- [ ] OAuth providers configured in auth service dashboard
- [ ] Server-side auth middleware / session check in place
- [ ] **Return-to-origin redirect implemented**: user lands on the page they were trying to reach, not always `/dashboard`
- [ ] `return_to` parameter validated to be a relative path (not an external URL) before redirect

---

## Return-to-origin pattern

This is one of the things that's easy to skip and painful to retrofit. Implement it from the start:

```ts
// Before redirecting to login
const returnTo = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
return NextResponse.redirect(new URL(`/auth/login?return_to=${returnTo}`, req.url))

// After successful auth
const returnTo = searchParams.get('return_to')
// Validate it's a relative path before using it
const destination = returnTo && returnTo.startsWith('/')
  ? decodeURIComponent(returnTo)
  : '/dashboard'
redirect(destination)
```

---

## Cross-platform auth (web + mobile)

If your project has both a web app and a mobile app:

- [ ] Confirm auth provider supports both web sessions and mobile sessions without completely separate implementations
- [ ] Test auth flow on both platforms independently
- [ ] Test that a session on one platform doesn't break auth on the other
- [ ] Token refresh behavior is handled on both platforms (mobile especially: background token refresh is easy to miss)

---

## Security specifics

- [ ] Tokens verified server-side on every protected request
- [ ] User ID derived from verified token, not from client input
- [ ] Auth routes rate limited (prevent brute force on login)
- [ ] Passwords hashed (bcrypt or similar): if storing them at all
- [ ] Refresh token rotation configured (if using JWTs with refresh)
- [ ] Session invalidation works (logout actually logs out)
- [ ] `return_to` redirect target validated: only allow relative paths

---

## Frontend

- [ ] Auth state managed centrally (context, Zustand, etc.)
- [ ] Protected routes redirect to login for unauthenticated users
- [ ] Loading state handled (don't flash protected content before auth check resolves)
- [ ] Errors displayed clearly (wrong password, unverified email, etc.)
- [ ] Redirect to intended page after login (return-to-origin, not just always `/dashboard`)

---

## Testing

- [ ] Sign up → verify email → log in tested manually
- [ ] Password reset tested manually (if applicable)
- [ ] OAuth login tested manually (on real device for mobile)
- [ ] Unauthenticated access to protected routes tested
- [ ] Session expiry handled gracefully tested
- [ ] Return-to-origin redirect tested: visiting a protected page while logged out, then logging in, should land on that page

---

## Post-setup

- [ ] Auth provider dashboard locked down (restrict domains in production)
- [ ] Test credentials not in production database
- [ ] User data handling documented in privacy policy
- [ ] If admin-only routes: allowlist is explicit and tested

---

## Common mistakes (from real experience)

| Mistake | Fix |
|---------|-----|
| Skipping return-to-origin | Implement it from the start: retrofitting is painful |
| Trusting `return_to` as-is | Validate it's a relative path before redirecting |
| Not maintaining your own user record | Always write to your DB, don't rely on the auth provider as your user store |
| Token refresh not handled on mobile | Mobile apps need explicit proactive token refresh before requests |
| Not testing on both platforms | iOS + Android + web each need a manual pass |

---

*See also: [Firebase / Auth Tools](../integrations/firebase.md)*
