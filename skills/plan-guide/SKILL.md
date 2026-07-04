---
name: plan-guide
description: "Stage 2 of the DevByAlex plan phase — expand an approved docs/SPEC.md into a granular implementation guide. For every feature and section, write what it does, the data model and API surface it needs, the implementation approach, edge cases and acceptance criteria, and the order features will be built (dependencies first — scaffold, then auth, then the rest). Emits docs/IMPLEMENTATION_GUIDE.md, one feature card per feature under docs/features/, one ADR per feature under docs/adr/ (the decisions + deliberate omissions that govern future change), and seeds the feature table in docs/STATUS.md. The 'adr-backfill' mode writes the missing docs/adr/ records for an existing repo's features — inferred from code + docs, consolidating scattered feature docs — and must complete before feature work proceeds. Use after the spec is approved, when the user says 'write the implementation guide', 'expand the spec', 'plan the build order', or 'backfill the ADRs'."
argument-hint: "[optional: specific area to expand, or 'adr-backfill' for an existing repo]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# plan-guide — Expand the spec into a build-ready guide

The second plan stage. Turns the approved `docs/SPEC.md` into a detailed,
ordered implementation guide plus one feature card per feature. This is what the
dev stage builds against and validates against, so it must be concrete.

> Requires an **approved** spec. If the spec gate isn't checked in
> `docs/STATUS.md`, confirm with the user before proceeding.

## When to activate

- `docs/SPEC.md` exists and is approved; `docs/IMPLEMENTATION_GUIDE.md` doesn't
  exist or is stale.
- The user says "expand the spec," "write the implementation guide," or "plan
  the build order."

## Workflow

### Step 1 — Load context
- Read `docs/SPEC.md` and `docs/STATUS.md`.
- Read the relevant playbooks for the domains the spec implies from
  `../../knowledge/practices/`: `data-modeling.yaml` always, plus `auth.yaml`,
  `payments.yaml`, `testing.yaml`, `uiux.yaml` as applicable.

### Step 2 — Decompose into features
Break the app into discrete, independently buildable **features** (each becomes
one feature card and one row in the STATUS table). A good feature is one a
single `feature-loop` pass can build, test, and validate. Authentication is its
own first-class item (built by `dev-auth`, not the generic loop). Keep features
small enough to validate but whole enough to be meaningful.

When the spec's **Legal, privacy & compliance** section calls for them, add a
first-class **"Compliance & legal" feature** (one card, one row) covering: a
**Terms of Service** page, a **Privacy Policy** page that stays accurate to the
real data flows, a **cookie consent banner on web** that gates non-essential
cookies/analytics until consent, and an **account deletion / data-export** path
where GDPR/CCPA applies. This feature is what `/launch-compliance` verifies
against the legal hard gate.

### Step 3 — Detail each feature
For every feature, write a feature card from `../../templates/feature-card.md`
at `docs/features/<NN>-<slug>.md` containing:
- **Purpose** — one paragraph, traceable to a spec core-job.
- **User stories / behaviors** — the observable outcomes (what success looks
  like), including error and edge-case behavior.
- **Data model** — entities/fields/relations/indexes this feature adds or
  touches (follow `data-modeling`: `select` not over-fetch, transactions for
  multi-step writes).
- **API / server surface** — routes/handlers/services, with Zod boundaries.
- **UI / screens** — which wireframe screens, and their empty/loading/error/
  onboarding/upgrade states.
- **Acceptance criteria** — the concrete checklist the `feature-validator` and
  the acceptance test will hold the feature to. **This is what the test-author
  writes tests from** — make it outcome-based, not implementation-based. For any
  feature with UI, **include accessibility criteria** (WCAG 2.2 AA: semantic
  structure + name/role, keyboard + visible focus, contrast, target size, labeled
  inputs/errors), and for public pages an **SEO** line (title/description,
  headings, alt text).
- **Security & privacy notes** — authz rules, PII handling, validation.
- **Dependencies** — which other features/scaffold/auth must exist first.

**Seed the feature's ADR alongside its card.** Copy
`../../templates/adr-feature.md` to `docs/adr/<NN>-<slug>.md` (same number and
slug as the card) and record, as `D`-entries, every material choice the card
just made — data-model shape, API approach, provider picks, anything chosen
over a real alternative — and, as `O`-entries, the card's **Out of scope**
items plus any capability consciously deferred. The ADR is the governing record
the dev stage consults before changing the feature and the reason automated
reviews won't flag deliberate omissions later (see `docs/adr/README.md`).
Skip trivia: if reversing a choice wouldn't need a conversation, it doesn't
need an entry.

### Step 4 — Decide the build order
Order features by dependency and risk: **scaffold → authentication → core jobs →
supporting features → nice-to-haves**. Highest-risk / most-depended-on first.
Record the order explicitly in the guide and reflect it in the STATUS feature
table ordering.

### Step 5 — Write docs/IMPLEMENTATION_GUIDE.md
Use `../../templates/IMPLEMENTATION_GUIDE.md`. It links to each feature card,
states the build order with rationale, lists cross-cutting concerns (auth model,
error handling, logging, env/config, testing strategy, **accessibility** (WCAG
2.2 AA baseline), **SEO** (semantic HTML, framework metadata, sitemap/robots,
JSON-LD), **design resources** (the app loader, marketing load-in, and OG preview
image specced in `docs/design/RESOURCES.md` — loader + OG image built in scaffold),
**legal/consent** (ToS + privacy routes, cookie-consent + analytics
gating), CI), and the stack decisions (default to Alex's: TypeScript strict, Zod
at boundaries, thin route handlers + services, Prisma with reviewed migrations,
Jest + Playwright).

### Step 6 — Seed STATUS and route
- Populate the **Features** table in `docs/STATUS.md` with one row per feature
  in build order, all steps `⬜`.
- Check **Plan → IMPLEMENTATION_GUIDE.md written** and **Plan → Feature ADRs
  seeded** (only if every feature got its `docs/adr/` file).
- Set `## Next action` to `/plan-wireframes`.
- Tell the user the guide needs **their approval** (a gate) before dev, and the
  next step is `/plan-wireframes`.

## Mode: `adr-backfill` — write the missing ADRs for an existing repo

Run when `init-ai` (or the user) finds features without decision records —
common when the ADR system arrives at a repo that already has features, or a
repo was integrated under an older workflow version. **Feature work is blocked
until this completes**: without the records, the validators can't tell a gap
from a choice. This mode touches only `docs/adr/` (plus removals of absorbed
docs) — it doesn't rewrite the guide or cards.

For **every** feature in the STATUS table missing `docs/adr/<NN>-<slug>.md`:

1. **Read the evidence.** The feature's card (if any), its code, its tests, and
   any scattered docs that mention it (design notes, `ARCHITECTURE.md`, README
   sections, ad-hoc decision writeups — `init-ai` inventoried these).
2. **Infer the decisions.** What approach did the code actually take, and what
   does it visibly *not* do that a reviewer would expect (no soft-delete, no
   rate limit on X, single-tenant by design)? Record approaches as `D`-entries
   and apparent conscious omissions as `O`-entries. Tag every inferred entry
   `(needs review)` and set the file's record state to `backfilled (needs
   review)` — an inference is not Alex's confirmed intent. When you genuinely
   can't tell gap from choice, list it under the file's Deliberate omissions as
   a question for Alex rather than guessing a status.
3. **Consolidate the scattered docs.** Move each scattered doc's still-true
   decision content into the owning feature's ADR (cite the source in the
   entry), then **delete the original** so there's one source of truth. A doc
   that's stale or irrelevant is removed without absorbing; if unsure whether
   it's safe to delete, flag it for Alex instead. Note every consolidation and
   removal in the summary.
4. **Reconcile STATUS.** Check the **Feature ADRs seeded** plan row once no
   feature lacks its file, restore the previous `## Next action`, and list the
   `(needs review)` entries in `## Blockers / open questions` for Alex.

## Rules

- Don't invent features the spec doesn't justify; trace every feature to a spec
  core-job or mark it a proposal for the user to confirm.
- Acceptance criteria must be **outcome-based** so tests aren't written just to
  match an implementation.
- Keep the guide the source of build order; keep per-feature detail in cards.
- The guide is **Alex's to approve** — flag it; don't self-approve the gate.

## Output

`docs/IMPLEMENTATION_GUIDE.md`, one `docs/features/<NN>-<slug>.md` **and** one
`docs/adr/<NN>-<slug>.md` per feature, a seeded STATUS feature table, and next
action `/plan-wireframes`. In `adr-backfill` mode: the missing ADRs written
`(needs review)`, scattered feature docs consolidated or removed, and the ADR
plan row checked.
