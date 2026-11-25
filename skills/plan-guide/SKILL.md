---
name: plan-guide
description: "Stage 2 of the DevByAlex plan phase. It expands an approved docs/SPEC.md into a granular implementation guide. Authentication is the first and most important feature after scaffold: it always gets a dedicated docs/features/authentication.md contract and docs/adr/auth.md before ordinary product features. For every feature, write the end goal and outcome-based done-when list in its card and the decisions that bound it in its ADR, then order dependencies as scaffold, authentication, and the rest. Emits docs/IMPLEMENTATION_GUIDE.md, feature cards under docs/features/, ADRs under docs/adr/, and seeds STATUS. The 'adr-backfill' mode writes missing records for an existing repo. Use after spec approval, when asked to expand the spec, plan the build order, or backfill ADRs."
argument-hint: "[optional: specific area to expand, or 'adr-backfill' for an existing repo]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# plan-guide

## Goal

The approved `docs/SPEC.md` turned into an ordered build plan the dev stage
can work through without another planning conversation: one feature card
(the end goal) and one ADR (the decisions that bound it) per feature, and a
guide that holds the build order and the cross-cutting concerns. Cards and
ADRs say what must be true and why, never how; the builder chooses the rest.

## Done when

- **The spec gate is checked** in `docs/STATUS.md`, or the user confirmed
  going ahead without it. `docs/SPEC.md`, `docs/STATUS.md` and the playbooks
  the spec implies under `../../knowledge/practices/` (`data-modeling.yaml`
  always, plus `auth.yaml`, `payments.yaml`, `testing.yaml`, `uiux.yaml` as
  they apply) were read.
- **Authentication has its contract:** `docs/features/authentication.md` from
  `../../templates/auth-feature-card.md`, filled from the spec's auth
  decisions in every section the template has, and `docs/adr/auth.md` seeded.
  It is built by `dev-auth`, not the generic loop.
- **Every other feature has a card and an ADR** with the same number and
  slug: `docs/features/<NN>-<slug>.md` from `../../templates/feature-card.md`
  and `docs/adr/<NN>-<slug>.md` from `../../templates/adr-feature.md`. Each
  feature traces to a spec core job, or is marked a proposal for the user to
  confirm.
- **Compliance is a feature when the spec's Legal, privacy & compliance
  section calls for it:** one "Compliance & legal" card and row covering the
  Terms of Service page, a Privacy Policy that matches the real data flows,
  a web cookie consent banner that gates non-essential cookies and analytics
  until consent, and deletion and export where GDPR or CCPA applies.
  `/launch-compliance` verifies it against the legal hard gate.
- **`docs/IMPLEMENTATION_GUIDE.md` is written** from
  `../../templates/IMPLEMENTATION_GUIDE.md`: build order with its rationale,
  a link to every card, every cross-cutting concern the template lists, and
  the stack decisions (Alex's defaults unless the spec forces otherwise). It
  states that every later feature's integration validation reruns the stable
  auth regression suite and checks `docs/adr/auth.md`.
- **`docs/STATUS.md` is seeded:** one Features row per feature in build order,
  all steps `⬜` (authentication keeps its own Dev row); the Plan section's
  `docs/IMPLEMENTATION_GUIDE.md` written row checked, and Feature ADRs seeded
  checked only when auth and every feature have their ADR; Next action
  `/plan-design`. The user is told the guide needs their approval before dev,
  and that `/plan-design` then `/plan-wireframes` come next.

## Decisions (and why)

- **A feature is what one `feature-loop` pass can build, test and validate:**
  small enough to validate, whole enough to mean something. Why: the loop is
  the unit of work and of proof.
- **The card is the end goal:** what a user can do once it ships, a Done when
  list of observable outcomes (success, failure and edge paths, the security
  boundary, screens and their states, accessibility for UI, SEO for public
  pages), constraints and out of scope. Every line is outcome-based. Why:
  `test-author` writes tests from the card blind.
- **The ADR holds only decisions that constrain the build** and that
  reversing would take a conversation (a data-model shape the spec implies, a
  provider, an approach chosen over a real alternative), each with its why,
  plus the card's out-of-scope lines as `O`-entries. No decision is restated
  in the card. Why: one record per decision, and the validators read it to tell
  a gap from a choice.
- **Tables, routes, components and file layout the spec doesn't force are
  left to the builder,** who records any material choice. Why:
  over-specifying here stops a capable agent finding the better design.
- **Build order is scaffold, authentication, core jobs, supporting features,
  nice-to-haves,** highest-risk and most-depended-on first within each.
  Authentication always comes right after scaffold and gets the deepest
  initial validation. Why: every later feature sits on it and reruns its
  regression suite.
- **`adr-backfill` mode** (an existing repo, often found by `init-ai`, whose
  features lack decision records) blocks feature work until done, because
  without records the validators can't tell a gap from a choice. It touches
  only `docs/adr/`, `docs/features/authentication.md` when that contract is
  missing or still an empty template, and the absorbed docs it removes:
  - Auth first: the contract and `docs/adr/auth.md` from the spec, auth code,
    routes, schemas, provider config and tests, inferred items tagged
    `(needs review)`; existing auth stays validation-pending until
    `/dev-auth validate` proves it.
  - Then every STATUS feature missing `docs/adr/<NN>-<slug>.md`: read its
    card (if any), code, tests and the scattered docs `init-ai` inventoried;
    record the approach taken as `D`-entries and visible conscious omissions
    (no soft-delete, no rate limit on X) as `O`-entries, each `(needs review)`,
    with the file's record state `backfilled (needs review)`. When gap and
    choice can't be told apart, list it under Deliberate omissions as a
    question for Alex.
  - Still-true content from scattered docs moves into the owning ADR with
    its source cited, and the original is deleted; stale ones are removed
    without absorbing; when deletion isn't clearly safe, flag it for Alex.
    Every move and removal is listed in the summary.
  - STATUS: Feature ADRs seeded checked once no feature lacks its file, the
    previous Next action restored, and the `(needs review)` entries listed
    under Blockers / open questions.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- No feature the spec doesn't justify, unless it is marked a proposal.
- The guide holds the build order; per-feature detail lives in the cards.
- The guide is Alex's to approve: flag the gate, never self-approve it.
