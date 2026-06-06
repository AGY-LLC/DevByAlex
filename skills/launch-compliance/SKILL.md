---
name: launch-compliance
description: "Launch-readiness stage of the DevByAlex workflow — the 'don't get sued' gate. Runs the legal, accessibility, SEO, and prose scans against the built app, then reconciles the results into docs/STATUS.md and surfaces a fix queue. Legal scan: confirms Terms of Service and a Privacy Policy exist, are linked, and the privacy policy is accurate to the app's real data flows; confirms a cookie consent banner is present on web and actually gates non-essential cookies/analytics until consent; confirms an account-deletion / data-export path where GDPR/CCPA applies (runs launch-readiness for the policy/disclosure/GDPR-CCPA audit). Accessibility: runs accessibility-critique against WCAG 2.2 AA and emits an A11Y-xxx queue. SEO: runs seo-audit (needs docs/BRAND.md). Prose: runs prose-check over user-facing strings. Legal and accessibility are HARD launch gates that block ship-ready; SEO and prose are advisory. Read-only — produces findings and routes remediation to fix-errors; it is not legal counsel. Use once features are built and staged, when the user says 'run the compliance scan', 'legal/privacy/accessibility check before launch', 'are we going to get sued', or 'launch compliance'."
argument-hint: "[optional: scope — legal | a11y | seo | prose; defaults to all]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-compliance — The legal / a11y / SEO / prose launch gate

The launch-readiness stage's compliance pass. Features are built and the app is
(or is about to be) staged; this skill runs the scans that keep a launch from
becoming a lawsuit, then records the results and a fix queue in `docs/STATUS.md`.
It **audits and routes — it does not fix** (remediation is `fix-errors`), and it
is **not legal advice**: it verifies the standard protections are present and
accurate, not that you are immune from suit.

It reuses existing skills rather than reinventing them: `launch-readiness`,
`accessibility-critique`, `seo-audit`, `prose-check`, and `fix-errors`.

## When to activate

- Features are built and the app is (or is about to be) deployed to staging.
- The user says "run the compliance scan," "legal/privacy/accessibility check
  before launch," "are we going to get sued," or "launch compliance."
- Scope can be narrowed with an argument (`legal` / `a11y` / `seo` / `prose`);
  default is all four.

## Workflow

### Step 1 — Load state
Read `docs/STATUS.md`, the spec's **Legal, privacy & compliance** and **SEO &
discoverability** sections, the implementation guide's cross-cutting concerns,
and the compliance feature card. This is the intended posture you verify the
built app against.

### Step 2 — Legal & privacy scan (hard gate)
Run `launch-readiness` for the policy / disclosure / GDPR-CCPA audit, then verify
this explicit checklist against the code:
- **Terms of Service** page exists and is linked from the app (footer/signup).
- **Privacy Policy** page exists, is linked, and is **accurate to the real data
  flows** — every category of data collected and every third party it's shared
  with (analytics, payments, email, AI providers) is disclosed. A policy that
  omits an actual data flow is a finding.
- **Cookie consent banner (web)** is present and **actually gates** non-essential
  cookies/analytics/trackers until consent — a banner that sets trackers before
  consent (or has no reject path) is a finding.
- **Account deletion / data-export** path exists where GDPR/CCPA applies.
Each gap becomes a finding in the fix queue. Flag this is a code-level check, not
legal counsel — recommend a human/lawyer review of the actual ToS/policy text.

### Step 3 — Accessibility audit (hard gate)
Run `accessibility-critique` against **WCAG 2.2 AA** (the workflow's floor). It
emits a prioritized `A11Y-xxx` queue with file:line evidence. Add those to the
fix queue.

### Step 4 — SEO audit (advisory)
Run `seo-audit`. It **requires `docs/BRAND.md`** — if it's missing and the app is
public-facing, stop this step and route the user to `/marketer-brand-generation`
first (note it in blockers), then re-run. Add its findings to the fix queue.

### Step 5 — Prose pass (advisory)
Run `prose-check` over user-facing strings (UI labels, empty states, errors,
toasts, onboarding, plus README/marketing surfaces). Add its findings to the fix
queue.

### Step 6 — Reconcile STATUS and route
- **Launch rows** — check each only when its scan is **clean**:
  `Legal/compliance scan passed`, `Accessibility audit passed`, `SEO audit
  passed`, `Prose pass done`. Leave any with open findings unchecked.
- **Hard gates** — `Legal & compliance passed` and `Accessibility (WCAG 2.2 AA)
  passed` are in the **Gates** block, which is **Alex's to check, not the
  agent's**. When their scans are clean, report that they're *ready for Alex to
  sign off*; **never self-check a gate.** While either gate is unchecked the app
  is **not ship-ready** — `dev-autopilot` already hard-stops on unmet gates.
- **Fix queue** — hand the combined findings (legal gaps + `A11Y-xxx` + SEO +
  prose) to `fix-errors` to drive to zero; re-run the relevant scan after fixes.
- Add a log line and set `## Next action` (typically `/fix-errors` if findings
  remain, else "Alex signs off the legal + accessibility gates").

## Rules

- **Audit, don't fix.** Findings + a queue only; remediation is `fix-errors`.
- **Don't rewrite what already works.** On an existing app, *verify* the ToS,
  privacy policy, cookie banner, and a11y already present — flag only genuine gaps
  or inaccuracies; never replace working legal pages or components. Every change
  is an explicit, reviewable `fix-errors` step, not a silent rewrite.
- **Not legal advice.** Verify presence + accuracy of the standard protections;
  recommend human/legal review of the actual policy text.
- **Legal + accessibility are hard gates.** Don't mark the app ship-ready while
  either has open findings, and never self-check the gate — that's Alex's.
- **SEO + prose are advisory** — report and queue, but they don't block launch.
- Reuse the existing skills; don't reimplement their checks here.

## Output

A compliance report with the legal / accessibility / SEO / prose results, the
launch rows in `docs/STATUS.md` reconciled, a combined fix queue routed to
`fix-errors`, and a clear statement of whether the two hard gates are ready for
Alex's sign-off.
