# Authentication posture across DBA apps

Audited 2026-07-26 against the registered DevByAlex consumers, their governing
specs/ADRs, and the implemented auth boundaries. This is a portfolio index, not
a replacement for each app's ADR. The linked app record is authoritative.

Every app must consciously choose one of these postures:

- no accounts;
- externally managed customer accounts;
- operator-only accounts;
- end-user accounts;
- organization or team accounts; or
- an explicitly described combination.

No account system is a valid decision. Missing auth code or an unfinished auth
screen is not. Each decision must record why it fits, how identities are
provisioned, what account management and authorization exist, and when to
revisit it.

## Current matrix

| App | Account posture | Sign-in methods and password posture | Account management | Authorization | Governing record | Baseline status |
|---|---|---|---|---|---|---|
| DayDump | End-user consumer accounts | Stytch phone OTP only; passwordless | Account lifecycle actions such as export, deletion, and unlock; no sign-in-method linking because phone OTP is the only method | User ownership/social boundaries plus explicit user/moderator/admin roles | `DayDump/docs/adr/01-auth.md` | Aligned: separate Create account/Sign in tabs and server-bound OTP intents are implemented; signup-only consent, mismatch revocation/cleanup, fail-closed state, and neutral errors are covered. |
| Nisatsu | End-user consumer accounts plus a separate operator boundary | Stytch phone OTP, email magic link, Google, and Apple; no passwords | Self-service sign-in-method linking/unlinking, session revocation, export, deletion, and recovery; last-method protection | User ownership, friendships/privacy, entitlements, and separately scoped operator tokens with TOTP step-up | `nisatsu/docs/adr/01-auth.md` and `nisatsu/docs/account-linking-spec.md` | Explicit and aligned with separate Create account/Sign in and method-management requirements. |
| HousingByAlex | Planned organization/team accounts | Managed provider is intentionally undecided; email/password and Google are proposed | Planned profile, invitations, role administration, export, and deletion | Organization RBAC: owner, admin, member, viewer | `HousingByAlex/docs/adr/auth.md` | Proposed, not approved or built. Provider, recovery, linking, and safe-response contracts remain a planning gate. |
| alexanderyoza | No accounts | None | None | All routes are public static content | `alexanderyoza/docs/adr/auth.md` | Explicit N/A. |
| LOAMEN | Operator-only accounts; customer identity remains external to LOAMEN | NextAuth GitHub OAuth; no password; exact operator email allowlist. A separate bearer authenticates machine proposal intake only. | GitHub/provider-managed operator identity; no public self-service account system | Named-operator allowlist plus narrowly scoped machine intake; Shopify owns customer/order identity | `LOAMEN/docs/adr/auth.md` | Explicit. Public customer accounts are consciously omitted. |
| Novaform | End-user owner accounts for an invite-only beta | Better Auth with GitHub OAuth only; no password | Basic owner/session/privacy lifecycle; no sign-in-method management or collaborative membership administration | One owner workspace; GitHub App installation separately authorizes repositories | `Novaform/docs/adr/auth.md` | Aligned: distinct OAuth intents, 16-plus Create account confirmation, one-time server attempts, verified-email beta allowlist, replay/expiry rejection, and existing-account mutation/session guards are implemented. |
| AGY | No accounts | None | None | Public studio/portfolio site | `agy-llc/docs/adr/auth.md` | Explicit N/A. |
| Goal Planner | End-user consumer accounts | Stytch Apple, Google, and email/password; password is optional after social signup | Full self-service method add/disconnect, password add/reset, sessions/devices, export, and deletion; last-method protection | Strict per-user tenancy with goal-setter and partner capabilities derived from entitlements/relationships | `goal-planner/docs/adr/02-auth.md` | Separate Create account/Sign in and method management are explicit. D9 supersedes the old signup-enumeration exception; neutral Create account responses remain an open implementation criterion. |
| passworder | No product accounts; local single-operator tool | No interactive login. Local stdio process runs under Alex's OS user; a 1Password service account authenticates outbound vault access. | None | Local process/filesystem boundary plus provider-specific service credentials | `passworder/docs/adr/auth.md` | Explicit N/A for end-user auth. Remote or multi-user transport remains intentionally omitted. |
| Nisatsu Journal | Public readers with no accounts; one operator-only admin identity | Auth.js Google OAuth for one verified allowlisted admin; no password | Google-managed recovery; no local sign-in-method or reader-account management | Exact single-admin allowlist; no roles or multi-tenancy. Cron publishing uses a separate bearer. | `nisatsu-journal/docs/adr/auth.md` | Explicit. Reader accounts are consciously omitted. |

## Required follow-up decisions

1. Goal Planner: implement D9 by replacing the public existing-email signup
   response with the neutral safe-response contract and close the new feature
   criterion.
2. HousingByAlex: choose the provider and finalize password, recovery, linking,
   role administration, and account-management behavior before `/dev-auth`.

Whenever an app's posture changes, update its ADR first, this matrix second, and
the auth feature card, wireframes, and regression suite in the same change.
