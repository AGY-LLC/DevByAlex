# Authentication: Detailed feature specification

> Written by `/plan-guide` from the approved `docs/SPEC.md`. Authentication is
> the first and most important feature after scaffold. `/dev-auth` builds from
> this card; its test author treats the acceptance criteria as the contract.
> Every later feature must preserve this card and `docs/adr/auth.md`.

**Status:** todo <!-- todo | in-progress | blocked | done -->
**Depends on:** scaffold
**Wireframes:** _Create account, Sign in, recovery, step-up, account methods if
supported, and role/admin views only when required, in `docs/wireframes/`_
**ADR:** `docs/adr/auth.md`

## Purpose and trust boundary

- **Who may create an account:** _public / invite-only / allowlist / no accounts_
- **Who may sign in:** _roles or eligibility constraints_
- **Protected data/actions:** _what requires authentication, authorization, or
  a fresh sign-in_
- **Threat model:** _enumeration, takeover, session theft, CSRF, IDOR,
  cross-tenant access, redirect/deep-link interception, abuse/rate limits_

## Authentication methods

> Password is optional. Include only methods chosen for this app.

- **Create account methods:** _Google / Apple / magic link / email OTP /
  passkey / password / other_
- **Sign in methods:** _usually the same set; record any intentional difference_
- **Password posture:** _not supported / optional add-on / available at account
  creation / required, with reason_
- **Account management posture:** _none / provider-admin only / basic profile
  and recovery / self-service sign-in-method management / full account or team
  administration. Record N/A rather than inventing a settings surface._
- **MFA or assurance level:** _none / optional / required / step-up only_
- **Platforms:** _web / iOS / Android; callback and deep-link constraints_
- **Provider and session strategy:** _provider, cookie/token storage, expiry,
  refresh/rotation, revocation_

## Identity and account model

- **Canonical user:** _local user id and profile ownership_
- **Authenticators/identities:** _one-to-many model, provider subject ids,
  verified-email handling, uniqueness constraints_
- **Linking rule, if supported:** _require an authenticated existing session,
  recent authentication, and proof of the new method; never auto-link on email
  match alone_
- **Collision rule:** _what happens when a provider identity or normalized
  email is already attached elsewhere, without enabling takeover_
- **Disconnect rule, if supported:** _allow removal only while another
  verified, currently usable sign-in method remains_
- **Notifications:** _out-of-band notices for supported method add/remove,
  password change/reset, recovery, and other account-security events_

## Authorization model

- **Model:** _authenticated-only / ownership / RBAC / permissions /
  organization or team membership / ABAC / ReBAC / combination_
- **Access matrix:** _for every role or policy subject, list allowed operations
  on each protected resource and scope; anything unlisted is denied_
- **Role and permission semantics:** _default role, hierarchy or no hierarchy,
  multiple-role combination/precedence, object- and field-level restrictions_
- **Tenancy and relationships:** _organization membership, invitation states,
  tenant selection, cross-tenant denial, relationship-derived access_
- **Administration:** _who can invite, grant, revoke, or elevate access; prevent
  self-elevation and protect the last required owner/admin if applicable_
- **Change propagation:** _session/token rotation or revocation, cache
  invalidation, immediate vs. delayed effect, and audit/notification behavior_
- **Enforcement:** _one server-side policy boundary used by every route,
  handler, action, job, and data lookup; UI visibility is not authorization_

## User flows and screens

### Create account

- Keep Create account separate from Sign in in intent and behavior. _Tabs are
  the default presentation; a brand-appropriate alternative may be specified._
- Never silently sign in or mutate an existing account from this flow.
- **13+ / signup affirmation:** _required or N/A; if required, unchecked,
  explicit, signup-only, and bound to this transaction rather than inferred
  from Terms acceptance._
- **Verification/onboarding:** _email/provider verification and destination._

### Sign in

- Never silently create an account from this flow.
- Show every enabled sign-in method and a clear route to Create account.
- If passwords exist, keep Forgot password visible and support password
  managers, paste, and platform autofill.
- **Success destination:** _default destination and validated
  return-to-origin behavior._

### Recovery and passwords

- **Passwordless recovery:** _how a user regains access or replaces a lost
  method._
- **Forgot/reset password:** _required only when passwords exist; single-use,
  expiring, throttled flow and post-reset session policy._
- **Add/change password:** _If passwords exist, change is always available
  through an authenticated or provider-managed path; add is available only when
  the management posture specifies it. Require recent authentication._

### Manage sign-in methods

- **Self-service scope:** _supported / N/A, with reason and external/admin
  management path if one exists._
- Show linked methods and enough metadata for the authenticated user to
  recognize them **when this app exposes the surface**.
- If supported, detail add/link, verify, use, disconnect, cancel, and failure
  behaviors.
- If supported, block removal of the last usable method with an actionable
  explanation. If unsupported, expose no hidden self-service mutation endpoint.

### Fresh-authentication step-up

- **Actions requiring step-up:** _email/password/provider changes, deletion,
  billing/admin/export or other high-risk actions._
- Offer the user's eligible method(s) in context instead of sending them to a
  generic login dead end.
- Preserve a validated, short-lived, one-time action/return context
  server-side or in a signed value.
- On success, return to the action's confirmation point. Do not automatically
  execute the dangerous action. On cancel/failure/expiry, return safely with
  the action unchanged.

## Safe user-facing response contract

> Copy may change with the brand, but the information disclosed must not.
> Keep response body, status, and practical timing equivalent where account
> existence would otherwise differ.

| Situation | Safe behavior and next action |
|-----------|-------------------------------|
| Sign in: wrong email, password, or unavailable method | Do not identify which value is wrong or whether the account exists. Say sign-in could not be completed and offer retry, another enabled method, Create account, and recovery where applicable. |
| Create account: email/account may already exist | Do not confirm registration on the public screen. Give the same neutral next-step response and point to Sign in; when possible, send account-specific guidance only to the verified address. |
| Forgot password / recovery | Always give the same response, such as “If an account uses that email, we’ll send recovery instructions.” |
| OAuth/magic-link/OTP failure | Name the method the user chose, not account existence. Explain retry, expiry, cancellation, or another safe next action without exposing provider/account linkage. |
| Authenticated method management, if supported | Be specific because the user is already authenticated, while still requiring recent authentication for sensitive changes. |

**Brand-approved copy:** _final text for each row and each platform/state._

## Authorization and session contract

- **Default-deny enforcement points:** _middleware plus server-side
  route/service/resource checks._
- **Roles/ownership/tenancy:** _rules and denial behavior._
- **Session lifecycle:** _creation, rotation, refresh, expiry, logout,
  revoke-all, device/session management if supported._
- **Redirect policy:** _relative/allowlisted destinations only; mobile uses
  single-use exchange codes plus PKCE and claimed HTTPS links where possible._
- **Logging/privacy:** _security events to retain; never log secrets, tokens,
  full reset links, or unnecessary PII._

## Acceptance criteria and exhaustive test matrix

### Intent and enabled methods

- [ ] Create account and Sign in are distinct; neither silently performs the
      other operation.
- [ ] Only the specified methods appear and work on every supported platform;
      password UI and endpoints are absent when passwords are not supported.
- [ ] Each enabled method covers create, verify, sign in, cancel/fail, logout,
      expiry/refresh, and return-to-origin.
- [ ] Signup-only age/consent state is explicit and cannot carry into Sign in
      or a later auth transaction.

### Identity lifecycle

- [ ] Account management matches the specified posture; unsupported
      self-service capabilities have no exposed UI or mutation endpoint.
- [ ] If method management is supported, each method can be added, verified,
      used, and disconnected without duplicate users or email-collision
      takeover.
- [ ] If linking is supported, it requires proof of the current account and the
      new method.
- [ ] If disconnect is supported, the last currently usable sign-in method
      cannot be removed.
- [ ] Security-sensitive method/recovery events send the specified
      out-of-band notification.
- [ ] Password change/forgot/reset is complete when passwords are enabled,
      password add exists only when specified, and password surfaces are
      entirely absent when passwords are not enabled.

### Safe failure and abuse behavior

- [ ] Nonexistent account, existing-account signup, wrong password, disabled
      account, recovery, and provider failures follow the safe response
      contract without body/status/timing enumeration discrepancies.
- [ ] Verification, magic-link, OTP, reset, OAuth state, PKCE, and step-up
      artifacts reject expiry, replay, tampering, and cross-transaction use.
- [ ] Auth endpoints are throttled; CSRF, session fixation, open redirects,
      privilege escalation, IDOR, and cross-tenant access are denied.
- [ ] No credential, session, token, full reset URL, or unnecessary PII enters
      logs, analytics, client errors, or URLs.

### Authorization, step-up, and accessibility

- [ ] Every applicable role/permission/policy/ownership relationship and
      protected operation has allow and deny tests, including unauthenticated,
      wrong-role, wrong-owner, direct-endpoint, stale-role/session, and
      cross-tenant attempts.
- [ ] Server-side policy enforcement defaults to deny on every request and data
      access; hiding a UI control is never the only guard.
- [ ] Role/membership grant, revoke, invitation, elevation, and last-owner/admin
      invariants match the specified administration model, update active access
      as specified, and produce the required audit evidence.

- [ ] Every specified high-risk action requests fresh authentication, supports
      success/cancel/failure/expiry, and returns to the intended confirmation
      point without replay or automatic execution.
- [ ] Auth screens meet WCAG 2.2 AA, including labels and errors, keyboard and
      visible focus, paste/password-manager support, autofill semantics, target
      size, and no cognitive-function test as the sole authentication method.

### Validation evidence

- [ ] Unit/component/integration coverage maps to every criterion above using a
      real test datastore for identity/session behavior when available.
- [ ] Playwright covers supported web journeys; Maestro covers supported
      iOS/Android journeys. Provider/email/device checks that cannot be
      automated are explicit `[manual]` evidence, never silently skipped.
- [ ] Feature validation and independent integration validation pass.
- [ ] Stable auth regression command(s): _record commands/tags here; every
      later feature's integration validation reruns them._

## Out of scope

- _Deliberate omissions only. Mirror them in `docs/adr/auth.md`; security,
  privacy, legal, and accessibility requirements cannot be waived here._
