# {{APP_NAME}}: Implementation Guide

> Written by `/plan-guide` from the approved spec. The dev stage builds and
> validates against this. **Needs Alex's approval** (gate in `docs/STATUS.md`)
> before dev. Per-feature detail lives in `docs/features/`.

**Status:** draft <!-- draft | approved -->
**Updated:** {{DATE}}

## Stack decisions

- _Language/framework, package manager, ORM, test runners, CI. Default to Alex's
  stack: TypeScript `strict`, Zod at boundaries, thin handlers + `services/`,
  Prisma (reviewed migrations), Jest + Playwright, ESLint/Biome._

## Build order (dependencies first)

1. **Scaffold**: baseline (`/dev-scaffold`).
2. **Authentication**: `/dev-auth`.
3. _Feature: `docs/features/03-…md`_
4. _…_

> Rationale: _why this order: highest-risk / most-depended-on first._

## Features

| # | Feature | Card | Depends on | One-line purpose |
|---|---------|------|------------|------------------|
| 3 | _…_ | `docs/features/03-….md` | auth | _…_ |

## Cross-cutting concerns

- **Auth/authz model:** _default-deny, where checks live._
- **Error handling:** _shape of errors, user-facing vs. logged._
- **Validation:** _Zod at every boundary._
- **Logging/observability:** _logger, what gets logged (never secrets)._
- **Env/config:** _Zod-validated env, `.env.example`, secrets handling._
- **Testing strategy:** _what's unit vs. integration vs. E2E; high-risk areas
  that must be covered (auth, permissions, billing, validation, critical flows)._
- **Accessibility:** _WCAG 2.2 AA baseline: semantic HTML, labels/roles,
  keyboard + visible focus, contrast, target size, reduced-motion. Verified by
  `accessibility-critique` at launch._
- **SEO (public surfaces):** _semantic HTML, framework metadata (titles/
  descriptions/OpenGraph), sitemap + robots, JSON-LD, canonical/hreflang.
  Verified by `seo-audit` at launch (needs `docs/BRAND.md`)._
- **Design resources (app-wide):** _per `docs/design/RESOURCES.md`: the custom
  **app loader** (built in scaffold), the **marketing load-in** on public
  landing pages, and the Stripe-style dynamic **OG preview image**. All honor
  `prefers-reduced-motion`; the marketing load-in must not block LCP or shift
  layout. OG image verified to resolve at launch._
- **Legal / consent:** _Terms of Service + Privacy Policy routes; cookie consent
  banner (web) that gates non-essential cookies/analytics until consent; account
  deletion / data-export path where GDPR/CCPA applies. Verified by
  `launch-compliance`._
- **CI:** _install → lint → typecheck → test → build._

## Notes / decisions

- _Material decisions and their rationale. Feature-scoped decisions go in that
  feature's `docs/adr/<NN>-<slug>.md` (the governing record); cross-cutting ones
  here and appended to `docs/DECISIONS.md`._
