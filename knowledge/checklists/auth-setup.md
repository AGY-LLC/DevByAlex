---
id: checklists-auth-setup
title: "Auth Setup Checklist"
summary: "What I go through every time I set up authentication on a new project. Informed by real experience across cross-platform (web + mobile) and admin-only projects."
tags: ["checklists", "auth-setup"]
updated: 2026-07-26
---
# Auth Setup Checklist

What I go through every time I set up authentication on a new project. Informed by real experience across cross-platform (web + mobile) and admin-only projects.

---

## Planning

- [ ] Decide: build auth or use a service (Stytch, Firebase Auth, Auth.js, Clerk, Supabase Auth)
- [ ] Decide Create account and Sign in methods per platform: passwordless, magic link/OTP, passkey, Google, Apple, password, or other. Password is optional.
- [ ] Keep Create account and Sign in as separate operations and user intents. Tabs are a default presentation, not a requirement.
- [ ] Decide whether Create account needs an explicit unchecked 13+ affirmation or other signup-only consent; never reuse it for Sign in.
- [ ] Decide recovery for every method and password add/change/forgot/reset only if passwords are supported.
- [ ] Decide whether self-service account/sign-in-method management exists. If it does, define recent-auth, new-method proof, notifications, and last-usable-method protection; if not, do not build the surface.
- [ ] Decide authorization: simple ownership, roles/permissions, organization/team membership, ABAC/ReBAC, or a combination. Define every role/policy, tenant scope, and who may grant/revoke access.
- [ ] Decide safe public responses for wrong credentials/method, existing-account signup, recovery, and provider failures without confirming account existence.
- [ ] Decide which dangerous actions require fresh authentication and how the user returns to the action's confirmation point.
- [ ] If building for web + mobile: confirm the auth provider has a clean cross-platform story before committing
- [ ] Decide: sessions vs JWTs (or both)
- [ ] Does the app need roles/permissions? Design now, not later.
- [ ] Does the app need organization/team accounts? Design now.
- [ ] Is the admin/editor UI restricted to specific users? Design the allowlist pattern now.

---

## Database

- [ ] Canonical User table with at minimum: stable `id`, contact/profile fields, and `createdAt`
- [ ] One-to-many authenticator/identity records with provider + stable subject id, verified state, timestamps, and uniqueness that prevents one external identity from attaching to multiple users
- [ ] Define and consistently apply email comparison/normalization across create, sign in, recovery, and linking; never auto-link accounts solely because email strings match
- [ ] If implementing roles: `role` enum or separate `user_roles` table
- [ ] If using sessions: session table or rely on JWT (decision recorded)

---

## Implementation

- [ ] Create account creates a user record in your database (not just in the auth service) and never silently signs into/mutates an existing account
- [ ] Sign in never silently creates a new account
- [ ] Create account and Sign in are visually and behaviorally distinct, with a clear path between them
- [ ] Signup-only age/consent state is unchecked, explicit, transaction-bound, and cleared on cancellation/failure so it cannot bleed into Sign in
- [ ] Every enabled method is verified end to end on every supported platform
- [ ] Email verification configured if required
- [ ] Password reset flow configured and tested (if using email/password)
- [ ] Password change works through an authenticated or provider-managed path with recent authentication; adding a password works only when specified (if passwords are supported)
- [ ] No password fields, reset routes, or password-required assumptions exist when the app is passwordless
- [ ] OAuth providers configured in auth service dashboard
- [ ] Account management matches the spec; no unrequested settings surface or hidden self-service mutation endpoint exists
- [ ] If method management is supported, authenticated users can add, verify, use, and disconnect methods; linking requires proof of current account + new method and cannot create a duplicate user
- [ ] If disconnect is supported, removing the last verified, currently usable method is blocked with an actionable explanation
- [ ] Supported method/password/recovery changes send an out-of-band security notification
- [ ] Ownership/role/permission/tenant policy is enforced at one server-side boundary on every protected request and resource lookup; UI visibility is not the guard
- [ ] Role/membership grant and revoke cannot self-elevate, preserve required last-owner/admin invariants, update active sessions/caches as specified, and produce audit evidence
- [ ] Server-side auth middleware / session check in place
- [ ] **Return-to-origin redirect implemented**: user lands on the page they were trying to reach, not always `/dashboard`
- [ ] `return_to` parameter validated to be a relative path (not an external URL) before redirect

---

## Safe response and recovery contract

Public responses must help legitimate users without confirming whether an
email/account exists. Keep message, HTTP status, response shape, and practical
timing equivalent wherever different behavior would permit enumeration.

- [ ] Sign in failure does not distinguish nonexistent account, wrong password, disabled account, or unlinked method. Offer retry, another enabled method, Create account, and recovery when applicable.
- [ ] Create account does not publicly say that an email is already registered. Give the same neutral next-step response and a Sign in route; when possible, send account-specific guidance only to the entered address.
- [ ] Forgot password/recovery always responds like: "If an account uses that email, we'll send recovery instructions."
- [ ] OAuth/magic-link/OTP errors may name the method the user chose and whether the attempt expired/cancelled, but not whether that provider/email is linked to an account.
- [ ] Authenticated account settings may be specific about linked methods because identity is already established, while still requiring recent authentication for sensitive changes.
- [ ] Reset, verification, OTP, magic-link, and recovery artifacts are single-use, expiring, replay-safe, throttled, and never logged as tokens or full URLs.

---

## Fresh-authentication step-up

- [ ] List dangerous actions that require recent authentication (e.g. sign-in method/email/password change, account deletion, billing/admin changes, sensitive export)
- [ ] Keep the user in context and offer their eligible method(s); do not send them to a generic Sign in dead end
- [ ] Store the action/return context server-side or sign it; allowlist destinations, expire it quickly, bind it to the user/session, and reject replay
- [ ] After success, return to the action's confirmation point without automatically executing the dangerous action
- [ ] On cancel, failure, or expiry, return safely with no state change and a useful next action

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
- [ ] Public error copy remains non-enumerating while offering safe, useful next actions
- [ ] Create account and Sign in remain separate in labels, headings, analytics, and submitted server intent
- [ ] If account settings exist, they show only the specified controls and explain why the last usable method cannot be removed; otherwise the settings surface is absent
- [ ] Password fields allow paste and password-manager/autofill semantics; no cognitive-function test is the sole auth method
- [ ] Redirect to intended page after login (return-to-origin, not just always `/dashboard`)

---

## Testing

- [ ] Separate Create account → verify → Sign in tested for every enabled method and supported platform
- [ ] Password reset tested manually (if applicable)
- [ ] Password change is tested when passwords are supported; adding a password from an originally passwordless/social account is tested only when specified
- [ ] OAuth login tested manually (on real device for mobile)
- [ ] Account-management posture tested: supported add/link/use/disconnect paths cover collision and last-method behavior; unsupported self-service paths are unreachable
- [ ] Every role/permission/policy and protected operation has positive and negative tests, including unauthenticated, wrong-role, wrong-owner, direct-endpoint, stale-access, and cross-tenant attempts
- [ ] Role/membership invitation, grant, revoke, elevation, and last-owner/admin rules tested where applicable
- [ ] Nonexistent-account, existing-account signup, wrong-password/method, provider failure, and recovery responses tested for message/status/shape/timing enumeration differences
- [ ] Expired/replayed/tampered auth artifacts and cross-transaction signup-only age state tested
- [ ] Every step-up action tested for success, cancel, failure, expiry, replay, open redirect, and return to the correct confirmation point
- [ ] Unauthenticated access to protected routes tested
- [ ] Session expiry handled gracefully tested
- [ ] Return-to-origin redirect tested: visiting a protected page while logged out, then logging in, should land on that page
- [ ] Stable auth regression command/tag recorded in `docs/features/authentication.md` and rerun after every later feature

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
| Treating password as mandatory | Choose auth methods per app; passwordless is a valid complete posture |
| Combining signup and login behavior | Keep Create account and Sign in distinct even when tabs share one screen |
| Revealing "email already registered" | Use a neutral public response and send specific help only to the entered address |
| Auto-linking accounts by matching email | Require an authenticated session, recent auth, and proof of the new method |
| Letting the last method be removed | Count only verified, currently usable methods and preserve at least one |
| Sending step-up to generic login | Carry a validated short-lived action context and return to confirmation |
| Session token in the mobile deep link | Redirect carries a single-use code; token comes back in the HTTPS exchange response (RFC 8252) |
| PKCE verifier sent through the redirect | Verifier stays in app memory; only the challenge leaves the app, or PKCE protects nothing |

---

*See also: [Firebase / Auth Tools](../integrations/firebase.md)*
