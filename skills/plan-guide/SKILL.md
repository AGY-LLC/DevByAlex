---
name: plan-guide
description: "Stage 2 of the DevByAlex plan phase. It expands an approved docs/SPEC.md into a granular implementation guide. Authentication is the first and most important feature after scaffold: it always gets a dedicated docs/features/authentication.md contract and docs/adr/auth.md before ordinary product features. For every feature, write the end goal and outcome-based done-when list in its card and the decisions that bound it in its ADR, then order dependencies as scaffold, authentication, and the rest. Emits docs/IMPLEMENTATION_GUIDE.md, feature cards under docs/features/, ADRs under docs/adr/, and seeds STATUS. The 'adr-backfill' mode writes missing records for an existing repo. Use after spec approval, when asked to expand the spec, plan the build order, or backfill ADRs."
argument-hint: "[optional: specific area to expand, or 'adr-backfill' for an existing repo]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# plan-guide: Expand the spec into a build-ready guide

The second plan stage. Turns the approved `docs/SPEC.md` into a detailed,
ordered implementation guide plus one feature card and ADR per feature. Cards
state goals and outcomes concretely; they leave the how to the dev stage.

> Requires an **approved** spec. If the spec gate isn't checked in
> `docs/STATUS.md`, confirm with the user before proceeding.

## When to activate

- `docs/SPEC.md` exists and is approved; `docs/IMPLEMENTATION_GUIDE.md` doesn't
  exist or is stale.
- The user says "expand the spec," "write the implementation guide," or "plan
  the build order."

## Workflow

### Step 1: Load context
- Read `docs/SPEC.md` and `docs/STATUS.md`.
- Read the relevant playbooks for the domains the spec implies from
  `../../knowledge/practices/`: `data-modeling.yaml` always, plus `auth.yaml`,
  `payments.yaml`, `testing.yaml`, `uiux.yaml` as applicable.

### Step 2: Decompose into features
Break the app into discrete, independently buildable **features** (each becomes
one feature card and one row in the STATUS table). A good feature is one a
single `feature-loop` pass can build, test, and validate. Authentication is its
own first-class item (built by `dev-auth`, not the generic loop). Always expand
the spec's auth decisions into `docs/features/authentication.md` using
`../../templates/auth-feature-card.md`, and seed `docs/adr/auth.md`. The auth
card must cover enabled password or passwordless methods, separate account
creation and sign-in, signup-only age/consent, optional account-management
scope, identity linking and last-method protection where management exists,
recovery/password lifecycle, safe non-enumerating responses, step-up
return-to-action, the app's ownership/RBAC/ABAC/ReBAC/tenant authorization
model, session rules, and its exhaustive test matrix. Keep ordinary product
features small enough to validate but whole enough to be meaningful.

When the spec's **Legal, privacy & compliance** section calls for them, add a
first-class **"Compliance & legal" feature** (one card, one row) covering: a
**Terms of Service** page, a **Privacy Policy** page that stays accurate to the
real data flows, a **cookie consent banner on web** that gates non-essential
cookies/analytics until consent, and an **account deletion / data-export** path
where GDPR/CCPA applies. This feature is what `/launch-compliance` verifies
against the legal hard gate.

### Step 3: Write each feature as a goal plus its decisions
First write the dedicated auth card and ADR above. For every other feature,
write a card from `../../templates/feature-card.md` at
`docs/features/<NN>-<slug>.md` and an ADR from `../../templates/adr-feature.md`
at `docs/adr/<NN>-<slug>.md` (same number and slug).

- **The card is the end goal**: what a user can do once it ships, a **Done
  when** list of observable outcomes (success, failure and edge paths, the
  security boundary, screens and their states, accessibility for UI, SEO for
  public pages), constraints and out of scope. `test-author` writes tests from
  it blind, so keep every line outcome-based, never implementation-based.
- **The ADR holds the decisions**: only choices that constrain the build and
  that reversing would need a conversation (a data-model shape the spec
  implies, a provider, an approach chosen over a real alternative), each with
  its why, plus the card's out-of-scope lines as `O`-entries. Don't restate a
  decision in the card.
- **Leave the rest to the builder.** Don't spec tables, routes, components or
  file layout the spec doesn't force: the implementer chooses them within the
  guide, the ADR and the hard rules in `docs/DECISIONS.md`, and records any
  material choice it makes. Over-specifying here is what stops a capable agent
  finding the better design.

### Step 4: Decide the build order
Order features by dependency and risk: **scaffold → authentication → core jobs →
supporting features → nice-to-haves**. Authentication is always the first
feature after scaffold and receives the deepest initial validation. Highest-risk
/ most-depended-on first.
Record the order explicitly in the guide and reflect it in the STATUS feature
table ordering.

### Step 5: Write docs/IMPLEMENTATION_GUIDE.md
Use `../../templates/IMPLEMENTATION_GUIDE.md`. It links to each feature card,
states the build order with rationale, lists cross-cutting concerns (auth model,
error handling, logging, env/config, testing strategy, **accessibility** (WCAG
2.2 AA baseline), **SEO** (semantic HTML, framework metadata, sitemap/robots,
JSON-LD), **design resources** (the app loader, marketing load-in, and OG preview
image specced in `docs/design/RESOURCES.md`: loader + OG image built in scaffold),
**legal/consent** (ToS + privacy routes, cookie-consent + analytics
gating), CI), and the stack decisions (default to Alex's: TypeScript strict, Zod
at boundaries, thin route handlers + services, Prisma with reviewed migrations,
Jest + Playwright). Link the detailed auth card and state that every later
feature's integration validation reruns its stable auth regression suite and
checks `docs/adr/auth.md`.

### Step 6: Seed STATUS and route
- Populate the **Features** table in `docs/STATUS.md` with one row per feature
  in build order, all steps `⬜`.
- Check **Plan → IMPLEMENTATION_GUIDE.md written** and **Plan → Feature ADRs
  seeded** (only if authentication has `docs/adr/auth.md` and every ordinary
  feature got its `docs/adr/` file).
- Set `## Next action` to `/plan-design`.
- Tell the user the guide needs **their approval** (a gate) before dev, and the
  next step is `/plan-design` (pick the visual style) → then `/plan-wireframes`.

## Mode: `adr-backfill`: write the missing ADRs for an existing repo

Run when `init-ai` (or the user) finds features without decision records,
common when the ADR system arrives at a repo that already has features, or a
repo was integrated under an older workflow version. **Feature work is blocked
until this completes**: without the records, the validators can't tell a gap
from a choice. This mode touches `docs/adr/`, plus
`docs/features/authentication.md` when the required auth contract is missing or
still an empty template, and removals of absorbed docs. It doesn't rewrite the
guide or ordinary feature cards.

Before numbered features, backfill the authentication contract from the
approved spec, current auth code, routes, schemas, provider config, and tests.
Cover the same method/optional-management/authorization/safe-response/step-up
matrix required in Step 2, tag inferred decisions `(needs review)`, and seed
`docs/adr/auth.md`. Existing auth remains validation-pending until
`/dev-auth validate` proves this contract.

For **every** feature in the STATUS table missing `docs/adr/<NN>-<slug>.md`:

1. **Read the evidence.** The feature's card (if any), its code, its tests, and
   any scattered docs that mention it (design notes, `ARCHITECTURE.md`, README
   sections, ad-hoc decision writeups: `init-ai` inventoried these).
2. **Infer the decisions.** What approach did the code actually take, and what
   does it visibly *not* do that a reviewer would expect (no soft-delete, no
   rate limit on X, single-tenant by design)? Record approaches as `D`-entries
   and apparent conscious omissions as `O`-entries. Tag every inferred entry
   `(needs review)` and set the file's record state to `backfilled (needs
   review)`: an inference is not Alex's confirmed intent. When you genuinely
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
- Keep the guide the source of build order; keep per-feature detail in cards.
- The guide is **Alex's to approve**: flag it; don't self-approve the gate.

## Output

`docs/IMPLEMENTATION_GUIDE.md`, one `docs/features/<NN>-<slug>.md` **and** one
`docs/adr/<NN>-<slug>.md` per feature, a seeded STATUS feature table, and next
action `/plan-wireframes`. In `adr-backfill` mode: the missing ADRs written
`(needs review)`, scattered feature docs consolidated or removed, and the ADR
plan row checked.
