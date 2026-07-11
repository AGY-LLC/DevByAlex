---
name: plan-spec
description: "Stage 1 of the DevByAlex plan phase — turn a brief one-line app idea into an approved spec by interviewing the user until every important-but-unanswered question is resolved. Do NOT start coding. Ask questions in batches, working backwards from the user (problem, who it's for, the 3–5 core things they must do, what launch success looks like, what's explicitly out of scope), and keep going until you are genuinely confident. Capture the design/UX answers the wireframing stage will need. Writes docs/SPEC.md. Also runs in reverse-engineer mode to backfill a spec from an existing codebase. Use when starting a new app, when the user gives a vague 'build me an app that…' brief, or to draft/refine docs/SPEC.md."
argument-hint: "[one-line idea, brief file, or 'reverse' to backfill from code]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# plan-spec — Interview to a complete, approved spec

The first plan stage. The user gives a brief idea; your job is to ask the
questions that make you fully confident you could build the whole app, then
write `docs/SPEC.md`. **You are not ready to proceed while any important
question is unanswered** — getting an answer from the user beats guessing.

> Read `../../knowledge/practices/project-kickoff.yaml` first and follow it —
> it is Alex's canonical kickoff playbook. This skill is the operational
> wrapper around it.

## When to activate

- New project, or a vague "build me an app that…" brief.
- The user asks to write or sharpen `docs/SPEC.md`.
- `reverse` mode: an existing repo needs a spec backfilled from its code so the
  rest of the workflow has a target to validate against.

## Workflow

### Step 1 — Orient
- Read `docs/STATUS.md` if present. If a `docs/SPEC.md` already exists, ask
  whether to refine or replace.
- Read the `project-kickoff` playbook at
  `../../knowledge/practices/project-kickoff.yaml` and use its question set as
  the backbone.

### Step 2 — Interview (the core of this skill)
Ask questions in **batches** (grouped, not one-at-a-time), and wait for
answers. Work backwards from the user. Cover at minimum:

1. **Problem & user** — what problem, for whom, and why do they care now?
2. **Core jobs** — the 3–5 things a user must be able to do. Everything else is
   later.
3. **Out of scope** — what this explicitly will *not* do for v1.
4. **Data model shape** — the main entities and how they relate (enough to seed
   `data-modeling`).
5. **Auth & access** — who logs in, how, what they can see/do, multi-tenant?
   (Security/privacy is the top priority later — get the requirements now.)
6. **Money** — free / paid / subscription / one-time? (seed `payments`).
7. **Platform & topology** — web, mobile web, native, desktop, multi. For a
   **user-facing product**, record that it splits into separate surfaces (drives
   the scaffold's monorepo): a **marketing site** on the apex domain and the
   **web app** on `app.<domain>` (full-stack Next.js — UI + API), plus a **mobile
   app** only if native is in scope. Capture the **domain** (apex + `app.`
   subdomain). Non-user-facing tools skip the marketing surface.
8. **Launch success** — what "it works and we can ship" looks like.
9. **Design/UX questions the wireframes need** — primary screen and user goal,
   emotional tone (2–3 adjectives), interaction density, key screens and their
   states (empty/loading/error/onboarding/upgrade), brand assets (incl. **is a
   logo SVG available?**), references loved/hated, anti-patterns to avoid.
   **Ask for visual references as images, not just names:** screenshots of apps
   or screens the user likes (or a Figma export) go into
   `docs/design/references/` (create the folder; any pasted image gets saved
   there with a descriptive filename). For each, capture **one line on what
   specifically they like about it** — the palette, the density, the type, the
   mood — an image with no "why" is half a reference. These are first-class
   inputs to `/plan-design`: a picture of the look they want beats three
   adjectives describing it.
   **Also ask the two animation questions** every app gets a decision on:
   (a) the **app loading animation** — every app gets a custom loader inspired by
   the theme; which approach fits this project (logo-based animation of the logo
   SVG / a theme-derived abstract loader / a generated Lottie or video loop)?;
   and (b) **only if there's a public landing/marketing page**, the separate
   **marketing load-in** — a one-time hero entrance animation (staggered fade-up,
   optional Stripe-style animated mesh-gradient background). **These must be
   answered here** because `plan-wireframes` turns them into `docs/design/RESOURCES.md`.
10. **Integrations & constraints** — third parties, compliance, deadlines,
    non-negotiables.
11. **Legal, privacy & compliance** (the "don't get sued" set) — what personal
    data/PII is collected and shared with whom; does it need **Terms of Service**
    and a **Privacy Policy**; does the web app need a **cookie consent banner**
    (yes when non-essential cookies/analytics run, esp. EU/UK); which **regimes**
    apply (GDPR/UK-GDPR, CCPA/CPRA, COPPA/age, sector rules); account
    deletion/data-export obligations; and the **accessibility target** (default
    **WCAG 2.2 AA**). These become a build feature and the launch hard gates.
12. **SEO & discoverability** — is the app public-facing (landing/marketing/blog)
    or private? target audience & key terms; locales/i18n; the **social preview
    (OG) image** (every web app gets one — default is a Stripe-style card
    dynamically generated from brand tokens, with the logo provided by the user
    and an optional hand-designed override); and whether a brand foundation
    (`docs/BRAND.md`) exists. If public-facing and none exists, plan to run
    `/marketer-brand-generation` before the guide.

After each batch, reflect back what you heard and list what's still open. Keep
going until nothing important is open.

### Step 3 — Confidence gate
Before writing, state your confidence and list any remaining assumptions. If
you are not confident, ask more — do not paper over a gap with a guess. Only
proceed when the open-questions list is empty or every remaining item is
genuinely deferrable and marked as such. **The spec is not approvable while the
legal/privacy posture (ToS, privacy policy, cookie consent, regimes) or the
accessibility target is undecided** — these drive the build and the launch hard
gates, so they can't be left blank.

### Step 4 — Write docs/SPEC.md
Use `../../templates/SPEC.md` as the structure. Capture problem, users, core
jobs, out-of-scope, data-model sketch, auth/privacy requirements, the
**legal/privacy/compliance** section (data/PII, ToS, privacy policy, cookie
consent, regimes, user-rights, accessibility target), monetization, platform,
the design/UX answers (verbatim enough for wireframing — including the
`docs/design/references/` image paths with the user's one-line "what I like
about it" per image), the **SEO &
discoverability** section, integrations, constraints, and the success definition.
Convert relative dates to absolute.

### Step 5 — Update STATUS and route
- Check the **Plan → SPEC.md written** row in `docs/STATUS.md`.
- Set `## Next action`: if the app is **public-facing and `docs/BRAND.md` does
  not exist**, route to `/marketer-brand-generation` first (it seeds SEO + voice
  and is required by the launch `seo-audit`), then `/plan-guide`. Otherwise set
  it to `/plan-guide`.
- Add a log line.
- Tell the user the spec needs **their approval** (a gate) and that the next
  step is the brand step (if public-facing) then `/plan-guide`.

## reverse mode (backfill from code)
When invoked on an existing repo with no spec: read the code, routes, schema,
and README; infer problem/users/core jobs/data model/auth/monetization; write
`docs/SPEC.md` with every inferred section tagged `(inferred — needs review)`.
**Also infer the legal/SEO posture from what's already there** — does the code
have ToS/privacy routes, a cookie-consent banner, analytics/trackers, PII
collection, public marketing pages, i18n? Record what exists vs. what's missing
in the **Legal, privacy & compliance** and **SEO & discoverability** sections,
tagged `(inferred — needs review)`; don't invent requirements the app clearly
doesn't need (e.g. cookie consent for a private internal tool). Then ask the user
only the questions the code can't answer (intent, audience, out-of-scope,
success, which regimes apply). Don't block the workflow on a perfect backfill,
but flag the gaps.

## Rules

- **Never start coding from this skill.** It produces a spec only.
- Batch questions; don't drip them one at a time.
- Don't proceed past the confidence gate with important unknowns.
- The spec must contain enough design/UX detail for `plan-wireframes` to run
  without another interview.
- The spec is **Alex's to approve** — flag it, don't self-approve the gate.

## Output

`docs/SPEC.md` written/updated (incl. legal/compliance + SEO posture), STATUS
advanced, next action set to `/marketer-brand-generation` (public-facing, no
brand yet) or `/plan-guide`, and an explicit request for Alex's approval.
