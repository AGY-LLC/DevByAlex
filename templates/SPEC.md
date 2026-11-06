# {{APP_NAME}}: Spec

> Written by `/plan-spec`. The **Goal** says what the app must achieve; every
> other section records a **decision and its why**, not an implementation.
> Leave the how to the guide and the dev stage. **Needs Alex's approval** (gate
> in `docs/STATUS.md`) before the guide. Tag inferred items `(needs review)`.
> The Goal is copied to the top of `docs/DECISIONS.md` once approved.

**Status:** draft <!-- draft | approved -->
**Updated:** {{DATE}}

# Goal

## Problem & user

- **Problem:** _What problem, and why now?_
- **Who it's for:** _Target user: role, sophistication, why they care._

## Core jobs (the 3–5 things a user must be able to do)

1. _…_

## Launch success

- _What "it works and we can ship" looks like: observable outcomes, the bar
  for done._

## Explicitly out of scope (v1)

- _…_

# Decisions

Each line: the decision, then why. "N/A, because …" is a decision.

## Data model sketch

- _Main entities and how they relate, only where the spec forces a shape._

## Auth & access

> Authentication is the first feature after scaffold. `/plan-guide` expands
> these into `docs/features/authentication.md` (from
> `templates/auth-feature-card.md`, which holds the full contract);
> `/dev-auth` validates them.

- **Who may create an account and who may sign in.**
- **Authorization model:** owner checks, RBAC, permissions, org/team
  membership, ABAC/ReBAC or a mix; roles, default role, tenant boundaries, who
  grants and revokes, what happens to live sessions when access changes.
- **Methods by platform** (web, iOS, Android) and **password posture** (none,
  optional, at signup, required), with the reason.
- **Signup-only affirmation** (13+ or consent): required or N/A.
- **Recovery** without a password, and the password lifecycle if passwords
  exist.
- **Account management scope:** none, provider-admin, basic profile, self-serve
  method management, or full team admin. Don't decide a settings surface the
  app doesn't need.
- **Fresh-auth step-up:** which dangerous actions need a recent sign-in.
- **Session and privacy posture:** expiry, revocation, provider vs.
  self-rolled, MFA needs.

## Legal, privacy & compliance (the "don't get sued" section)

> Built in the guide, verified by `/launch-compliance`. Captures requirements;
> not legal advice.

- **Data collected and shared:** PII stored, and which third parties see it
  (analytics, payments, email, AI providers).
- **Terms of Service** and **Privacy Policy:** required? (Yes for accounts,
  payments or UGC.)
- **Cookie consent (web):** needed when non-essential cookies or analytics
  run.
- **Regimes in scope:** GDPR/UK-GDPR, CCPA/CPRA, COPPA, sector rules, or
  "none: internal tool".
- **User rights:** account deletion and data export where GDPR/CCPA applies.
- **Recurring billing or free trials:** pre-charge trial reminders, the
  recurring-charge disclosure on the paywall, and an in-app cancel no harder
  than signup (FTC ROSCA, click-to-cancel, California ARL), or "N/A: no
  recurring billing".
- **Accessibility target:** default WCAG 2.2 AA.

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

> Verified by `/seo-audit` at launch. A public-facing app needs
> `docs/BRAND.md` (`/marketer-brand-generation`) before the guide.

- **Public surfaces:** landing, marketing, blog, public content, or "N/A:
  private app".
- **Audience and key terms.**
- **Social preview (OG) image:** default is generated from brand tokens
  (1200×630), or a hand-designed override; specced in
  `docs/design/RESOURCES.md`.
- **Locales:** languages and regions (drives hreflang).

## Integrations & constraints

- _Third parties, deadlines, app-specific non-negotiables (these also go in
  `docs/DECISIONS.md` Hard rules)._

## Open questions

- _Anything still unresolved. The spec isn't approvable while important ones
  remain._
