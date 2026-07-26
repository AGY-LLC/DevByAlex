# {{APP_NAME}}: Spec

> Written by `/plan-spec`. The foundation for the data model, routes, screens,
> and the implementation guide. **Needs Alex's approval** (gate in
> `docs/STATUS.md`) before the guide. Tag inferred items `(needs review)`.

**Status:** draft <!-- draft | approved -->
**Updated:** {{DATE}}

## Problem & user

- **Problem:** _What problem, and why now?_
- **Who it's for:** _Target user: role, sophistication, why they care._

## Core jobs (the 3–5 things a user must be able to do)

1. _…_

## Explicitly out of scope (v1)

- _…_

## Data model sketch

- _Main entities, key fields, and how they relate._

## Auth & access

> Authentication is the first and most important feature after scaffold.
> Password is optional: choose methods for this app rather than assuming one.
> `/plan-guide` expands these decisions into
> `docs/features/authentication.md`; `/dev-auth` exhaustively validates them.

- **Account eligibility and access:** _Who may Create account and who may Sign
  in._
- **Authorization model:** _Simple authenticated/owner checks, RBAC,
  permission-based, organization/team membership, ABAC/ReBAC, or a combination.
  Define roles/permissions, default role, scope/hierarchy, tenant boundaries,
  who can grant/revoke them, and what happens to active sessions when access
  changes._
- **Methods by platform:** _Google / Apple / magic link / email or SMS OTP /
  passkey / password / other for web, iOS, and Android._
- **Password posture:** _Not supported / optional add-on / offered at account
  creation / required, with the product or risk reason._
- **Create account vs. Sign in:** _Keep them behaviorally separate. Tabs are the
  default UI, but brand may use separate pages or another clear treatment.
  Never silently create an account from Sign in or sign into an existing
  account from Create account._
- **Signup-only affirmation:** _Is an explicit unchecked 13+ affirmation or
  other signup consent required? It belongs only to Create account and must not
  carry into Sign in. Record N/A with reason when it does not apply._
- **Recovery:** _How users recover without a password; if passwords exist,
  include Forgot password plus change/reset behavior, and decide whether the
  account-management posture permits adding a password._
- **Account management scope:** _None / provider-admin only / basic profile and
  recovery / self-service sign-in-method management / fuller account or team
  administration. Do not build a settings surface the app does not need._
- **Linked methods, if self-service management exists:** _How an authenticated
  user adds/verifies/disconnects methods; require proof and recent auth, prevent
  duplicate-account takeover, and never remove the last currently usable
  method. Otherwise record who or what manages methods._
- **Safe response contract:** _For wrong credentials/method, nonexistent
  account, existing-account signup, provider failure, and recovery: define
  helpful next actions without revealing publicly whether an account exists.
  Keep body/status/timing equivalent where enumeration is a risk._
- **Fresh-auth step-up:** _Which dangerous actions require a recent sign-in;
  which eligible method(s) are offered; preserve a validated short-lived action
  context and return to its confirmation point without auto-executing it._
- **Session and privacy posture:** _Expiry/rotation/revocation, return-to-origin,
  sensitive logging rules, provider vs. self-rolled, and assurance/MFA needs._

## Legal, privacy & compliance (the "don't get sued" section)

> Decided here, built in the guide, verified at launch by `/launch-compliance`.
> This captures the requirements; it is not legal advice.

- **Data collected & PII:** _What personal data is collected/stored/shared, and
  with which third parties (analytics, payments, email, AI providers)?_
- **Terms of Service:** _Required? (yes for accounts/payments/UGC.) Who owns it?_
- **Privacy Policy:** _Required? Must stay accurate to the data flows above._
- **Cookie consent (web):** _Needed? Required when non-essential cookies /
  analytics / trackers run, esp. for EU/UK visitors: banner must gate them
  until consent._
- **Regulatory regimes in scope:** _GDPR / UK-GDPR, CCPA/CPRA, COPPA or other
  age-gating, sector rules (HIPAA, PCI). Mark "none: internal tool" if truly N/A._
- **User-rights obligations:** _Account deletion, data export/access: required
  where GDPR/CCPA applies._
- **Subscriptions & auto-renewal (if recurring billing or free trials):**
  _Required by FTC ROSCA / click-to-cancel, California ARL, EU rules. Commit to:
  (1) **multiple pre-charge trial reminders** before any free trial converts to a
  paid charge; (2) **recurring-charge disclosure on the paywall itself** (price,
  interval, auto-renews, first-charge date/amount): not buried in ToS/policy;
  (3) a **straightforward in-app cancel** path, no harder than signing up. Mark
  "N/A: no recurring billing" if truly free / one-time._
- **Accessibility target:** _Default **WCAG 2.2 AA** (ADA / Section 508 / EAA
  exposure). Note any AAA goals or platform-native a11y requirements._

## Monetization

- _Free / paid / subscription / one-time? Plans, gating._

## Platform

- _Web / mobile web / native iOS / native Android / desktop / multi._

## Design & UX (drives the wireframes: fill this in here)

- **Primary screen & user goal:** _…_
- **Emotional tone (2–3 adjectives):** _…_
- **Interaction density:** _low (consumer) / medium (productivity) / high
  (dashboard, finance)._
- **Key screens & their states:** _list screens; for each note empty / loading /
  error / onboarding / upgrade as relevant._
- **Brand assets:** _logo (is an **SVG** available?), colors, type, existing URLs._
- **App loading animation:** _every app gets a custom loader that draws on the
  theme. Which approach: **logo-based** (animate the logo SVG),
  **theme-derived** (abstract loader from brand color/shape), or a **generated**
  Lottie/video loop? Decided per project; specced in `docs/design/RESOURCES.md`._
- **Marketing load-in (public landing/marketing pages only):** _a separate,
  one-time hero entrance animation (staggered fade-up; optional Stripe-style
  animated mesh-gradient background). N/A if there's no public marketing page._
- **References loved / hated:** _…_
- **Anti-patterns to avoid:** _…_

## SEO & discoverability

> Drives the SEO structure baked into the guide and verified by `/seo-audit` at
> launch. Brand (`docs/BRAND.md`, from `/marketer-brand-generation`) seeds page
> titles, descriptions, locale targeting, and schema: generate it if this app
> is public-facing.

- **Public / marketing surfaces:** _Landing, marketing pages, blog, public
  content, or is this a private/internal app where SEO is N/A?_
- **Target audience & key terms:** _Who's searching, and for what?_
- **Social preview (OG) image:** _every web app gets a link-share card
  (1200×630). Default is **Stripe-style, dynamically generated** from brand
  tokens (app name + tagline + logo + colors) you provide the logo only. A
  hand-designed override may be supplied. Specced in `docs/design/RESOURCES.md`,
  verified to resolve at launch._
- **Locales / i18n:** _Languages/regions to target (drives hreflang)._
- **Brand foundation:** _`docs/BRAND.md` exists? If not and the app is
  public-facing, run `/marketer-brand-generation` before the guide._

## Integrations & constraints

- _Third parties, compliance, deadlines, non-negotiables._

## Launch success

- _What "it works and we can ship" looks like: the bar for done._

## Open questions

- _Anything still unresolved. The spec isn't approvable while important ones
  remain._
