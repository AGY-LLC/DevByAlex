---
id: checklists-auth-setup
title: "Auth Setup Checklist"
summary: "What I go through every time I set up authentication on a new project. Informed by real experience across cross-platform (web + mobile) and admin-only projects."
tags: ["checklists", "auth-setup"]
updated: 2026-07-16
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

## Mobile OAuth / deep-link auth (RFC 8252)

RFC 8252 ("OAuth 2.0 for Native Apps") is the standard every mobile OAuth or
browser-to-app auth handoff must follow, including flows routed through your
own server. The redirect back into the app is the attack surface: on Android
any app can register the same custom scheme, so treat everything in the
redirect as readable by a hostile app.

- [ ] Authorization-code flow only; the implicit flow (tokens in the redirect) is banned
- [ ] **Never put a token, session, or secret in the deep link.** The redirect carries only a single-use exchange code; the app redeems it over HTTPS (POST) and receives the real token in the response body
- [ ] Exchange codes are single-use, short-lived (about 60 seconds), and invalidated on first redemption
- [ ] PKCE on every mobile flow: the app generates the verifier before launching the browser, keeps it in app memory only, and sends just the challenge outward. The verifier never transits the deep link, so an intercepted code is unredeemable
- [ ] This applies equally to server-mediated flows: if your server mints the session instead of the identity provider, recreate code + PKCE at your own session boundary rather than handing the session token through the redirect
- [ ] Prefer claimed HTTPS redirects over custom schemes: Android App Links (Digital Asset Links) / iOS Universal Links (AASA), which the OS binds to exactly one app. Custom schemes are acceptable only as a fallback, and only with the exchange-code + PKCE layer in place
- [ ] Use the system browser for the auth round-trip (`ASWebAuthenticationSession` / Custom Tabs, or `expo-web-browser`), never an embedded WebView
- [ ] Same rules for magic links and email verification links that log the user in: land on an HTTPS page that hands the app a code, not a token

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
| Session token in the mobile deep link | Redirect carries a single-use code; token comes back in the HTTPS exchange response (RFC 8252) |
| PKCE verifier sent through the redirect | Verifier stays in app memory; only the challenge leaves the app, or PKCE protects nothing |

---

*See also: [Firebase / Auth Tools](../integrations/firebase.md)*
