---
name: feature-loop
description: "The DevByAlex per-feature build engine. Use to build one specific feature from docs/features/, or as the unit dev-goal dispatches per feature. Takes the card's goal to done: tests written blind from the card, the code built, feature and whole-codebase validation clean, the auth regression suite green, UI vetted by design-critic from screenshots, golden-path E2E green, ADR and STATUS current, pushed to the working branch. How it gets there is its call within the decisions and hard rules."
argument-hint: "[feature id or slug from docs/features/: e.g. 03-billing]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# feature-loop: Build one feature to done

## Goal

The feature's card goal is true in the running app, proven by tests that were
written from the card rather than the code, and the codebase is no worse for
it. `dev-goal` dispatches this once per feature; it can also run by hand.

Before starting: the approval gates are met and **Scaffold** and
**Authentication** are done (else route to the earlier stage), and the feature
has an ADR (else route to `/plan-guide adr-backfill`). Read the card, its ADR,
`docs/DECISIONS.md`, `docs/features/authentication.md`, `docs/adr/auth.md`, the
guide section, the feature's wireframes and `docs/STATUS.md`. Mark the row
in-progress.

## Done when

All four gates hold on the same commit:

1. **Built and tested.** Every **Done when** line on the card has a passing
   test, and the feature works. For a feature with a user-facing flow, that
   includes its golden-path E2E flow (`../../knowledge/workflow/e2e-gate.md`).
2. **Feature validation clean.** `feature-validator` finds nothing open in the
   feature's code.
3. **Integration validation clean.** `integration-validator` passes on the
   whole suite and repo, including the stable auth regression command(s)
   recorded in `docs/features/authentication.md`. Every new protected
   operation has allow and deny tests for its roles or policies, and a
   changed auth flow or boundary re-runs its auth E2E flow.
4. **Aligned and recorded.**
   - The feature matches the guide and wireframes; intentional drift is
     flagged for Alex, never silent.
   - Customer-facing UI passed `design-critic` on screenshots of its key
     states (`docs/visual-qa/<run-date>/`); otherwise `design vetting: n/a`.
   - The golden path ran green against the running app; otherwise `e2e: n/a`.
   - `docs/wireframes/README.md` lists the feature's screens and states, with
     unbuilt states marked **(missing)**.
   - The ADR describes the feature as built: material choices made during the
     build are new `D`- or `O`-entries with their why.
   - No orphans are left (`docs/WORKFLOW.md`, "Nothing is left orphaned").
   - STATUS shows the row done with a log line, reconciled per
     `../../knowledge/workflow/doc-maintenance.md`, and `## Next action` names
     the next feature (or `/launch-observability`).
   - The work is committed and pushed to the working branch with the suite
     green.

A finding at any gate is a loop-back, not a stop: capture it as a failing
test, fix it (`fix-errors` drives the queue to zero), and re-run that gate. An
integration fix that reopens the feature re-runs gate 2.

## Decisions (and why)

- **Tests and code are written by separate agents, in parallel, blind to each
  other** (`test-author` from the card, `feature-implementer` from the card,
  ADR and guide). Why: tests written after or alongside visible code end up
  certifying whatever the code does, not what the card asked for.
- **Validators judge, they don't fix.** `feature-validator` and
  `integration-validator` report; this loop turns findings into tests and
  fixes. Why: a reviewer that fixes its own findings grades its own work.
- **The builder never vets its own screenshots;** `design-critic` does. Why:
  same reason, applied to UI.
- **Existing code is hardened, not rebuilt.** When the feature already roughly
  works (common after `init-ai`), skip the implementer: backfill blind tests
  from the card and fix what they expose. Why: rewriting working code risks
  regressions for no user-visible gain.
- **Discovery runs once, on the fast tier.** When the feature touches existing
  code, `explorer` builds an evidence package first and every later brief
  carries it with "don't repeat completed searches unless the evidence appears
  incorrect or insufficient" (`../../knowledge/workflow/model-routing.md`).
  Why: the strong tier should verify, not re-search.
- **One working branch, no per-feature branch or PR.** Use the branch you're
  on or the one `dev-goal` passed. Why: the green suite is the gate, and a PR
  per feature piles up unreviewed.
- **Penpot is not touched while building** (`../../knowledge/workflow/penpot-wireframes.md`).
  Why: Penpot writes need a live browser tab, which would stop unattended runs
  finishing UI work; the text screen inventory carries current state instead.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply. For this loop in particular:

- Never weaken, skip or delete a test to make code pass, auth tests above all.
- Never contradict an `active` ADR entry without Alex's explicit confirmation;
  record the supersession before building on it. A validator finding that only
  re-litigates a documented decision is rejected with a citation. Security,
  legal and accessibility findings, and any ADR-challenge with concrete
  evidence of harm, go to Alex.
- Never mark done with red tests, open findings, an unvetted UI, or a stale
  ADR.
- Never delete substantial orphaned work silently: ask Alex keep-or-remove in
  STATUS blockers and record a "keep".
- Don't expand scope past the card; new ideas are proposals.

## Who does what

Each role runs as its own subagent (Agent tool) so contexts stay clean and the
roles stay independent. Brief each one cold: the repo, the card, the ADR, and
what to return. If the named agent types aren't registered, use
`general-purpose` and name the skill to invoke.

| Role | Agent | Tier | Leans on |
|------|-------|------|----------|
| Discovery (existing code) | `explorer` | 1 fast | evidence package |
| Tests, incl. golden-path E2E | `test-author` | 2 capable | `test-suite-developer` |
| Code | `feature-implementer` | 2 capable | card, ADR, guide, evidence |
| Gate 2 | `feature-validator` | 3 strong | `scout` (feature), `issue-checker`, `fix-errors` |
| Gate 3 | `integration-validator` | 3 strong | `scout` (repo), `fix-errors` |
| UI vetting | `design-critic` | 2 capable | screenshots, `docs/DESIGN.md`, wireframes |
