---
name: uiux-redesign
description: "The application/rollout half of a restyle — sweeps a confirmed new style across an EXISTING app's every customer-facing screen. Runs after `/plan-design restyle` has re-picked the PRIMARY × SECONDARY and recorded the supersession in docs/DESIGN.md: this skill rewrites the docs/DESIGN.md token system (color, type, spacing, radius, shadow, motion, iconography, component states) to the new style, then sweeps every customer-facing surface (web + mobile app/ if present) to consume it — preferring token-level and shared-component changes that ripple over per-screen edits. It assesses each screen's alignment BEFORE touching it and deliberately leaves already-aligned surfaces unchanged (change is justified by divergence from the new tokens, never by the sweep advising it). It runs as code change through the normal validate loop — green suite at every stop, WCAG 2.2 AA floor re-verified on every changed surface — routes any regression or leftover divergence to fix-errors as an IDed RSTY-xxx queue, and MUST end with the screenshot gate: every swept surface screenshotted and vetted by the design-critic agent, looping on its CRIT-xxx findings until the critic passes before the restyle may be marked done. PRIMARY still wins every conflict, so structure/usability and the forms checklist are untouched; a restyle changes feeling, not the spine. Does NOT pick the style (that's /plan-design restyle) and does NOT self-approve. Use after a restyle decision is recorded, or when the user says 'roll out the new style', 'apply the redesign', 'sweep the screens', 'restyle every screen', or 'uiux-redesign'."
argument-hint: "[optional: scope — a screen/area to limit the sweep to, or a platform: web | mobile | both (default both)]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# uiux-redesign — Roll a confirmed new style across every screen

The **application** half of a restyle. `/plan-design restyle` owns the *decision*
— it re-picks the `PRIMARY × SECONDARY`, records the supersession of the old
style, and writes the new **Style choice** into `docs/DESIGN.md`. This skill owns
the *rollout*: it takes that confirmed pick and **sweeps it across every
customer-facing screen of an existing app**, so the app actually looks like the
new style instead of the decision sitting in a doc.

> A restyle changes **feeling, not spine.** The PRIMARY (structure/layout) still
> wins every conflict — usability, navigation, and the forms/interaction
> checklist are unchanged. This skill re-skins; it does not re-architect.

> **It does not pick the style and it does not self-approve.** The taste call was
> made and confirmed in `/plan-design restyle`. If no confirmed new **Style
> choice** is recorded in `docs/DESIGN.md`, stop and route back there first —
> there is nothing to roll out.

## When to activate

- `/plan-design restyle` just recorded a new, superseding **Style choice** in
  `docs/DESIGN.md` and the screens need to catch up to it.
- The user says "roll out the new style," "apply the redesign," "sweep the
  screens," "restyle every screen," or "uiux-redesign."
- **Not** for a greenfield app with no UI yet — expanding a *first* token system
  from a fresh pick is `/uiux-init`'s job. This skill changes an app that already
  has screens.

## Prerequisites

- `docs/DESIGN.md` has a current **Style choice** (the new `PRIMARY × SECONDARY`)
  with the old one marked **superseded** — the supersession is an ADR-governed
  decision and must already be recorded (that's `/plan-design restyle`, per the
  contract in `docs/adr/README.md`). If it isn't, stop and say so.
- The app has existing customer-facing screens in the code (e.g. `web/`, and
  `app/` if a mobile client exists) to sweep. Source alone with no UI → wrong
  skill.
- The suite runs green before you start — you can't tell a restyle regression
  from a pre-existing failure otherwise.

## Workflow

### Step 1 — Load the two styles and the surface inventory
Read `docs/DESIGN.md` (both the **new** Style choice and the **superseded** one),
`docs/SPEC.md`/`docs/BRAND.md` for tone, the wireframe inventory
(`docs/wireframes/README.md`) for the screen→feature map, and `docs/STATUS.md`.
Read the style vocabulary
[`../../knowledge/design/design-styles.md`](../../knowledge/design/design-styles.md)
for what **both** `PRIMARY × SECONDARY` pairings *mean* visually, the
**real-world references** recorded in the new Style choice (open them — the
sweep conforms screens toward those actual instances of the style, not toward
a style name), the universal design rules
[`../../knowledge/design/universal-design-rules.md`](../../knowledge/design/universal-design-rules.md)
(style-independent; the restyle never trades them away), and the UI/UX
baseline [`../../knowledge/stack/uiux.md`](../../knowledge/stack/uiux.md) +
practice [`../../knowledge/practices/uiux.yaml`](../../knowledge/practices/uiux.yaml)
for the design-system dimensions and the accessibility floor. You need the
**delta**: what the new style changes relative to the old, dimension by dimension.

### Step 2 — Rewrite the token system in docs/DESIGN.md
The token system is the source of truth every screen aligns to, so change it
**first**. Rewrite the `## Tokens` section of `docs/DESIGN.md` to the new style —
color (+ contrast), typography ramp, spacing scale, radius, shadow, motion (with
its reduced-motion policy), iconography, and every interactive state
(default/hover/focus/active/disabled/loading/error/empty) — plus the
`## Anti-patterns` list for the new direction. Every color pair must still clear
**WCAG 2.2 AA** (body ≥ 4.5:1, large/controls ≥ 3:1); a feeling change never
lowers the floor. This rewritten token table is what the sweep conforms screens
to.

### Step 3 — Enumerate the surfaces and the token entry points
Build the sweep list: every customer-facing screen from the inventory + code, and
— crucially — the **shared entry points** where tokens actually live (the Tailwind
config / theme file, design-token module, shared UI components, layout
primitives). Default scope is **both** web and mobile `app/`; honor a narrower
`[scope]` argument. Prefer changing a token or a shared component **once** so the
change ripples, over editing the same treatment on twenty screens.

### Step 4 — Assess alignment BEFORE changing — the anti-churn rule
This is the rule that keeps a full sweep from becoming a full rewrite. For each
surface (and shared component), judge how far it already sits from the new tokens:

- **Already heavily aligned** — it already reads as the new style / already
  consumes the new tokens, or diverges only trivially → **leave it unchanged.**
  Record it as `aligned — no change` with a one-line why. Do **not** edit a
  surface just because the sweep is running; **change must be justified by real
  divergence from the new tokens, not by the advice to sweep.**
- **Diverges** — it carries the old style's color/type/texture/motion/component
  treatment → queue it for change, noting the specific dimensions that are off.

Write this assessment down (the sweep manifest below) so what was deliberately
left alone is visible and auditable, not silently skipped.

### Step 5 — Sweep the diverging surfaces
Apply the new tokens to the surfaces you flagged as diverging, working from the
shared entry points outward so most screens update through the token/component
layer. On each surface, conform color, type, spacing, radius, shadow, motion,
iconography, and the interactive states to the new tokens — and re-check the
empty/loading/error states, which is where a restyle most often leaves stale
treatment behind. Keep the PRIMARY's structure: **do not** move to a different
layout, navigation model, or relax the forms checklist — you are re-skinning the
existing spine.

While on a surface, also clear any **decision leakage** it carries (universal
rule 31, show-don't-tell): descriptive paragraphs under section headers,
spec/ADR rationale typed into the screen, settings or empty states that read
like documentation. The fix is restructuring — let layout, hierarchy, and
labels carry the meaning — not shortening the paragraph. This doesn't widen the
anti-churn rule: leakage on an otherwise-aligned surface still counts as real
divergence (the design-critic will fail it anyway), but don't restyle a surface
that only needed its copy fixed.

A restyle also *creates* orphans: tokens, shared components, style files,
fonts, and image assets the new system superseded. When the sweep finishes,
remove what nothing references anymore — an old token table left in place will
quietly re-enter screens. The leave-no-orphans carve-outs apply: anything
recorded as kept in `docs/DESIGN.md`/`docs/DECISIONS.md` stays, and
substantial superseded work (a whole component library, real content) goes to
Alex as a keep-or-remove question rather than being silently deleted.

### Step 6 — Validate as code change
A restyle is code change and goes through the **normal validate loop** — it does
not get a pass because it's "just visual":

- **Green suite at every stop.** Run the suite after the token rewrite and after
  each meaningful batch of screen changes; a red suite blocks progress.
- **Re-verify the accessibility floor** on every changed surface (contrast, focus
  visible, hit targets, reduced-motion, labels) — the sweep is the most likely
  place to break AA.
- Route every regression, leftover divergence, or AA miss to **`fix-errors`** as
  an IDed **`RSTY-xxx`** queue (one ID per issue, with file + the dimension that's
  off), and drive it to zero.
- **Screenshot + critic gate — MANDATORY.** The sweep is not done because the
  code changed; it's done when the screens *look* right, and that is vetted, not
  self-declared. Capture screenshots of **every swept surface** in its key states
  (populated, empty, loading, error; light + dark where supported) — web via
  Playwright against the running app, native via the simulator/Maestro capture
  flow from `/launch-visual-qa` — save them under `docs/visual-qa/<run-date>/`,
  and spawn the **`design-critic`** agent (this plugin's `agents/design-critic.md`;
  fall back to `general-purpose` with that brief) with the screenshot paths, the
  new `docs/DESIGN.md` (tokens + real-world references), the wireframes, and the
  universal design rules. Route its `CRIT-xxx` queue to `fix-errors`, re-capture
  the affected screens, and re-submit — **loop until the critic passes.** No
  clean critic verdict → the restyle stays in-progress.

### Step 7 — Record, update STATUS, push
- Note in `docs/DESIGN.md` (Decision log) that the new Style choice was **rolled
  out across the screens**, dated — the *supersession* decision itself was already
  recorded by `/plan-design restyle`; this is the application record, not a new
  taste decision.
- Update `docs/STATUS.md`: log what was swept, and — explicitly — which surfaces
  were left **already-aligned** and why (so the skipped set is a recorded choice).
- Push to the **working branch** (the one you're on / staging), never a protected
  default. The style shift **never** overrides the two hard launch gates.

## Guardrails

- **Anti-churn.** Change is justified by divergence from the new tokens, never by
  the sweep running. Already-aligned surfaces are left alone and recorded as such.
- **PRIMARY wins.** Structure, usability, navigation, and the forms/interaction
  checklist are untouched — this changes feeling, not the spine.
- **AA floor holds.** No color/type/motion change lowers WCAG 2.2 AA on any
  customer-facing surface; contrast is re-checked, not assumed.
- **It routes, it doesn't rubber-stamp its own fixes.** Regressions go to
  `fix-errors` as an `RSTY-xxx` queue and are driven to zero.
- **No orphans left behind.** Superseded tokens/components/assets are removed
  with the sweep (substantial ones surfaced to Alex as keep-or-remove), so the
  old style can't creep back through leftovers.
- **No done without the critic.** Every swept surface is screenshotted and
  vetted by the `design-critic` agent; the restyle is only marked done on a
  clean pass. The sweeper never critiques its own screenshots.
- **Working branch only**, and the two hard launch gates are never overridden.

## What this skill does NOT do

- It doesn't **pick** the style — that's `/plan-design restyle` (the decision).
- It doesn't **self-approve** the taste call — the pick was already confirmed.
- It doesn't expand a *first* token system on a greenfield app — that's
  `/uiux-init`.
- It doesn't **fix its own regressions** — it routes them to `fix-errors`.

It owns exactly one thing: **rolling a confirmed new style across an existing
app's screens** — fully where they diverge, and not at all where they already fit.
