---
name: launch-compliance
description: "The 'don't get sued' launch gate of the DevByAlex workflow. Use when the user says 'run the compliance scan', 'legal/privacy/accessibility check before launch', 'are we going to get sued' or 'launch compliance', once features are built and staged. Runs legal (terms, accurate privacy policy, cookie consent that gates analytics, deletion/export, auto-renewal and click-to-cancel), accessibility (WCAG 2.2 AA), SEO and prose scans, reconciles them into docs/STATUS.md and routes fixes to fix-errors. Legal and accessibility are hard gates; SEO and prose are advisory. Read-only; not legal counsel."
argument-hint: "[optional: scope: legal | a11y | seo | prose; defaults to all]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-compliance: The legal, accessibility, SEO and prose launch gate

## Goal

Alex can sign off the two hard launch gates, **Legal & compliance passed** and
**Accessibility (WCAG 2.2 AA) passed**, knowing the standard protections are
present in the built app and accurate to its real data flows; SEO and prose
findings are queued as advisory. This audits and routes; `fix-errors` fixes.
It verifies protections, it is not legal advice.

Before starting: features are built and staged. Read `docs/STATUS.md`, the
spec's **Legal, privacy & compliance** and **SEO & discoverability**
sections, the guide's cross-cutting concerns and the compliance feature card:
that is the posture to verify against. An argument (`legal`, `a11y`, `seo`,
`prose`) narrows scope; the default is all four.

## Done when

- **Legal and privacy** (`launch-readiness` for the policy, disclosure and
  GDPR/CCPA audit, then verified in code):
  - Terms of Service and a Privacy Policy exist and are linked from the app
    (footer, signup). The policy discloses every category of data collected
    and every third party it reaches (analytics, payments, email, AI
    providers); an omitted real data flow is a finding.
  - The web cookie banner actually gates non-essential cookies, analytics and
    trackers until consent and has a reject path.
  - Account deletion and data export exist where GDPR/CCPA applies.
  - Only when the app charges a recurring fee or a trial converts to paid
    (detected from Stripe, RevenueCat, subscription models, trial logic, IAP);
    otherwise the report says it skipped this and why:
    - more than one pre-charge reminder (for example trial start, a few days
      out, about 24h before) is scheduled against the real trial-end date;
    - the paywall or checkout itself, next to the confirm button, states the
      price, interval, auto-renewal, when the first charge lands (including
      the trial-to-paid amount) and how to cancel; disclosure only in the
      Terms is a finding;
    - a discoverable in-app cancel exists that is no harder than signup, with
      no forced calls, hidden steps or retention gauntlet (a store "Manage
      subscription" deep link for IAP, an in-app cancel or billing portal for
      web).
- **Accessibility**: `accessibility-critique` ran against WCAG 2.2 AA and its
  `A11Y-xxx` items are queued. It covered the app loader and the marketing
  load-in (`docs/design/RESOURCES.md`): both honor `prefers-reduced-motion`,
  the load-in doesn't trap content or shift layout, and the custom loader is
  present or its override is recorded with a reason.
- **SEO** (advisory): `seo-audit` ran, which needs `docs/BRAND.md`; for a
  public app without it, the step is a blocker routed to
  `/marketer-brand-generation`. The OG image from `RESOURCES.md` is wired
  (`og:image`, `twitter:image`, absolute URL, 1200x630) and resolves.
- **Prose** (advisory): `prose-check` ran over user-facing strings and the
  README and marketing surfaces.
- STATUS: each launch row (`Legal/compliance scan passed`, `Accessibility
  audit passed`, `SEO audit passed`, `Prose pass done`) is checked only when
  its scan is clean; the combined queue went to `fix-errors` and the affected
  scans re-ran; a log line is added; `## Next action` is `/fix-errors` while
  findings remain, else "Alex signs off the legal and accessibility gates".
- The report states whether each hard gate is ready for Alex's sign-off and
  recommends human or legal review of the actual policy text and auto-renewal
  disclosures.

## Decisions (and why)

- **Reuse the existing skills** (`launch-readiness`,
  `accessibility-critique`, `seo-audit`, `prose-check`); don't reimplement
  their checks. Why: one owner per check keeps them from drifting apart.
- **Auto-renewal checks are legal requirements, not polish** (FTC ROSCA,
  California ARL and other state auto-renewal laws, EU consumer rules; the
  FTC's 2024 click-to-cancel rule was vacated in 2025, so ROSCA and state law
  carry the easy-cancel requirement). Why: they are the most
  common way a subscription app gets sued or fined.
- **Legal and accessibility block launch; SEO and prose don't.** Why: the
  first two carry legal exposure, the last two cost growth, not liability.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Audit, don't fix: findings and a queue only.
- Never replace working legal pages, banners or accessible components on an
  existing app; flag only real gaps or inaccuracies.
- Never check either hard gate or call the app ship-ready while one has open
  findings; the gates are Alex's.
