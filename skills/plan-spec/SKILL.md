---
name: plan-spec
description: "Stage 1 of the DevByAlex plan phase: turn a brief one-line app idea into an approved spec by interviewing the user until every important-but-unanswered question is resolved. Do NOT start coding. Ask questions in batches, working backwards from the user (problem, who it's for, the 3–5 core things they must do, what launch success looks like, what's explicitly out of scope), and keep going until you are genuinely confident. Capture the design/UX answers the wireframing stage will need. Writes docs/SPEC.md. Also runs in reverse-engineer mode to backfill a spec from an existing codebase. Use when starting a new app, when the user gives a vague 'build me an app that…' brief, or to draft/refine docs/SPEC.md."
argument-hint: "[one-line idea, brief file, or 'reverse' to backfill from code]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# plan-spec

## Goal

A `docs/SPEC.md` complete enough that the guide, the wireframes and the build
need no further discovery, with nothing important left to a guess. Asking the
user beats guessing, so the spec isn't ready while an important question is
open. Read `../../knowledge/practices/project-kickoff.yaml` before the first
question and use its questions, prototype-or-real rigor and deep vet as the
backbone.

## Done when

- **The interview covered every section of `../../templates/SPEC.md`,** each
  answered or marked "N/A, because …" (a throwaway prototype marks most
  sections "N/A, because prototype"). Beyond what the template prompts, these
  are settled with the user, not deferred to implementation:
  - *Auth and access* in full: who may create an account versus sign in,
    methods per platform and whether a password exists at all, separate
    Create account and Sign in intents (tabs by default, brand may choose
    another), signup-only 13+ or consent affirmation, recovery (and the
    password lifecycle only if passwords exist), whether any self-service
    method management exists (and that it never removes the last usable
    method), the authorization model with every role, who grants and revokes
    and the tenant boundary, non-enumerating but actionable messages, and
    which sensitive actions need a fresh sign-in that returns the user to the
    exact action.
  - *Platform and topology:* a user-facing product splits into a marketing
    site on the apex domain and the web app on `app.<domain>` (full-stack
    Next.js), plus a mobile app only when native is in scope; the domain is
    recorded. Non-user-facing tools have no marketing surface.
  - *Design and UX:* visual references are images, not names, saved under
    `docs/design/references/` with a descriptive filename and one line on
    what the user likes about each (palette, density, type, mood); the app
    loading animation approach (logo-based, theme-derived or a generated
    Lottie or video loop); and, only with a public marketing page, the
    one-time marketing load-in. `plan-wireframes` turns these into
    `docs/design/RESOURCES.md` and can't ask again.
  - *Legal, privacy and compliance:* personal data and who it is shared with,
    Terms and Privacy Policy, cookie consent, the regimes in scope, deletion
    and export, recurring billing obligations, and the accessibility target
    (default WCAG 2.2 AA).
  - *SEO:* public or private, audience and key terms, locales, the OG image,
    and whether `docs/BRAND.md` exists.
- **The confidence gate passed:** confidence and any remaining assumptions
  were stated, and every open item is resolved or marked deferrable in Open
  questions. Legal and privacy posture, the accessibility target and the auth
  contract (methods, account lifecycle, step-up) are never deferrable; for a
  prototype the decision may be "none: prototype, no real users".
- **`docs/SPEC.md` is written** from the template, with the design answers
  verbatim enough for wireframing (reference image paths with their one-line
  why) and relative dates made absolute.
- **`docs/DECISIONS.md` has its Goal** (two or three sentences from the
  problem, user and launch-success answers, plus what done looks like) and
  any app-specific non-negotiable the user stated added to its Hard rules.
- **`docs/STATUS.md` is advanced:** the Plan section's `docs/SPEC.md` written
  row checked, a log line added, and Next action set to
  `/marketer-brand-generation` when the app is public-facing with no
  `docs/BRAND.md` (it seeds voice and SEO, and the launch `seo-audit` requires
  it), otherwise `/plan-guide`. The user is told the spec needs their approval
  and what comes next.

## Decisions (and why)

- **Questions go in batches, and each batch ends by reflecting back what was
  heard and what is still open.** Why: one-at-a-time drips waste the user's
  time, and the reflection catches misunderstandings early.
- **An existing `docs/SPEC.md` is refined or replaced only after asking which;**
  `docs/STATUS.md` is read first when present. Why: the spec may already be
  approved.
- **Reverse mode** (an existing repo with no spec) reads the code, routes,
  schema and README, infers each section including the legal and SEO posture
  already present (ToS and privacy routes, consent banner, trackers, PII,
  public pages, i18n) and what is missing, tags every inferred item, the
  Goal included, `(needs review)`, invents no requirement the app clearly
  doesn't need (cookie consent for a private internal tool), and asks only
  what the code can't answer: intent, audience, out of scope, success,
  regimes. Gaps are flagged without blocking the workflow. Why: the rest of
  the workflow needs a target to validate against.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Never start coding from this skill; it produces a spec only.
- The spec is Alex's to approve: flag the gate, never self-approve it.
