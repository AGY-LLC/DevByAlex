---
name: plan-design
description: "Design-selection stage of the DevByAlex plan phase. It picks the app's visual style with intent before wireframing. Reads docs/SPEC.md (category, audience, tone, density, platform), docs/BRAND.md if present, and any references/anti-patterns, then recommends a named style as PRIMARY (structure, one of the 12 product directions) × SECONDARY (feeling, one of the 50 named styles in knowledge/design/design-styles.md), with a rationale and two alternatives. Alex confirms; then a REQUIRED web search pulls 3–5 real-world references of the confirmed style (live products/sites, gallery entries, actual instances of the style, not descriptions) whose concrete treatments seed the starting tokens; the pick + references + starting tokens are written to docs/DESIGN.md and recorded as a decision, so /plan-wireframes and /dev-scaffold build against a committed style. The 'restyle' mode drives the rollout to an existing app: pick a new style, record the supersession, and hand off to /uiux-redesign to apply it across screens. Use after the implementation guide exists, when the user says 'pick a design style', 'choose the look', 'what style should this app be', 'set the visual direction', or 'restyle this app'."
argument-hint: "[optional: a style/direction to steer toward; or 'restyle' to re-pick + roll out to an existing app]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# plan-design: Choose the visual style with intent

The design-selection plan stage. It sits **between `/plan-guide` and
`/plan-wireframes`**: the guide says *what* gets built, this says *what world it
looks like*, and the wireframes are then drawn against a committed style rather
than an intentionless default. Picking a named style is the direct antidote to
the #1 generic-AI-UI tell: one "modern SaaS" look with no intent behind it.

> A style is a **taste call.** This skill **recommends and records**; it does not
> self-approve. Alex confirms or overrides the pick. It is a plan checklist item
> under the wireframes approval gate, not a new hard gate.

## When to activate

- `docs/IMPLEMENTATION_GUIDE.md` exists and the app has no committed style yet
  (no "Style choice" in `docs/DESIGN.md`), or the user says "pick a design
  style," "choose the look," "set the visual direction," "what style should this
  be."
- **`restyle` mode**: an existing app needs a new direction rolled out (the user
  says "restyle this app," "redesign it as X," "change the whole look").

## The model: PRIMARY × SECONDARY

Read [`../../knowledge/design/design-styles.md`](../../knowledge/design/design-styles.md)
first: it's the catalog, the pairing map, and the decision procedure. In short:

- **PRIMARY = structure/layout**: one of the **12 product directions** (premium
  editorial, playful consumer, calm Japanese, technical devtool, AI-native
  productivity, social mobile, finance dashboard, luxury commerce, wellness
  minimal, brutalist experimental, mobile-native utility, creative studio). Fixed
  by **category + density**, not mood. The primary **wins every conflict** and
  always governs usability.
- **SECONDARY = feeling/decoration**: one of the **50 named styles**. Chosen
  from the **tone adjectives**, constrained to the primary's row in the pairing
  map (respect its **Avoid** column). Colors the primary; never breaks it.

## Mode: `select` (default): pick the style for a new app

### Step 1: Load context
- Read `docs/STATUS.md`, `docs/SPEC.md` (its Design & UX answers: category,
  audience, the 2–3 tone adjectives, interaction density, platform priority),
  and `docs/BRAND.md` if present (voice + visual-vocabulary direction + palette
  hints). Read the vendored UI/UX practice
  [`../../knowledge/practices/uiux.yaml`](../../knowledge/practices/uiux.yaml),
  baseline [`../../knowledge/stack/uiux.md`](../../knowledge/stack/uiux.md), and
  the universal design rules
  [`../../knowledge/design/universal-design-rules.md`](../../knowledge/design/universal-design-rules.md).
  The style is chosen *on top of* those rules; no pick may trade them away.
- **Look at any user-supplied reference images.** If `docs/design/references/`
  has images (screenshots of apps the user likes, collected by `/plan-spec`,
  each with a "what I like about it" note in the spec), open and actually view
  each one. For each image, name what it exhibits in the catalog's vocabulary,
  the nearest SECONDARY style(s), the palette temperament, type register,
  density. A picture of the look the user wants is the strongest input this
  skill gets; it outweighs adjectives when they conflict (say so when it does).
- If the spec is missing the tone/density/references inputs, ask the three
  direction questions from `uiux.yaml` before recommending: don't guess a style
  off a category alone. (The user can also answer with images: invite them to
  drop screenshots into `docs/design/references/`.)

### Step 2: Fix the PRIMARY
From category + density, pick the product direction (Step 2 of the decision
procedure). Density: low → consumer, medium → productivity, high →
dashboard/devtool. This is not a taste call: state it and move on.

### Step 3: Recommend the SECONDARY (+ alternatives)
Using the tone adjectives, the primary's row in the pairing map, and **what the
user-supplied reference images exhibit** (Step 1: when the user showed you a
look, recommend the style that look actually is, and cite the image), recommend
**one pairing + two alternatives**. For each: a one-line rationale tying it to
the inputs, and a line on what it makes the app *feel* like. Honor any style the
user steered toward (the argument) and any anti-patterns they named. Present them
and **let Alex confirm or override**: this is where the taste call lives.

### Step 4: Pull real-world references (REQUIRED web search)
Once Alex confirms the pairing, ground it in reality before deriving tokens.
**Run actual web searches** (WebSearch / WebFetch) for real, existing instances
of the confirmed style: this step is mandatory, not optional polish:

- Search the style by name and its canonical products (the catalog rows in
  `design-styles.md` name several): e.g. `"<SECONDARY style> website examples"`,
  `"<style> UI design"`, plus curated galleries: Awwwards, siteinspire,
  Godly, Land-book, Mobbin (mobile), httpster: filtered to the style.
- Collect **3–5 real references**: live product sites/apps first, gallery
  entries second, Dribbble/Behance mockups only as a last resort (mockups lie
  about density and states). At least one reference should share the app's
  PRIMARY direction (same product category/density), so structure is
  represented, not just decoration.
- For each reference record: **name, URL, and one line on what specifically to
  borrow**: palette treatment, type pairing, texture/motif, spacing rhythm,
  radius/shadow feel, motion. Note an anti-reference too if the search surfaced
  a version of the style done badly.
- **User-supplied images join the set.** Reference images in
  `docs/design/references/` are recorded alongside the pulled ones, marked
  `(user-supplied)`, each with its what-to-borrow line (seeded from the user's
  own "what I like about it" note). They don't replace the web search: pulled
  references show the style *done well in the wild*; the user's images show
  *what Alex actually wants*, but a user-supplied image is the first thing the
  starting tokens should trace to when the two disagree.
- If web access is unavailable in this session, **stop and say so**: record the
  gap as a STATUS blocker rather than inventing references from memory. The
  references must be pulled, not recalled.

These references are recorded in `docs/DESIGN.md` (Step 6) and are the
inspiration set every downstream stage designs against: `/uiux-init` expands
tokens toward them, `/plan-wireframes` frames against them, and the design
critic judges swept screens with them in hand.

### Step 5: Translate the pick into starting tokens
Once confirmed, derive the style's implications **from the references, not from
memory**: palette temperament, type register (serif/sans/mono/display),
texture/motif set, radius/shadow feel, and a 2–3 word motion personality: each
traceable to something observed in the pulled references. These seed the design
system: the full token table and component rules are expanded by `/uiux-init`
(or the vendored uiux practice) from this choice, not invented separately.

### Step 6: Write it to docs/DESIGN.md
Create or update `docs/DESIGN.md`. If the file doesn't exist, start it from the
`uiux.yaml` output template and fill the **Style choice** section; if it exists
(e.g. `/uiux-init` already ran), update that section and reconcile: the named
pick governs. Record:

```
## Style choice

**Direction:** <PRIMARY> × <SECONDARY>   <!-- e.g. finance dashboard × Bento UI -->
**Chosen:** {{DATE}}

**Why:** <one paragraph tying the pick to category, audience, and the tone
adjectives: the reason is mandatory, like every DevByAlex decision.>

**Alternatives considered:** <the two runners-up, one line each, and why not.>

**Real-world references (pulled by web search: mandatory):**
- <Name>, <URL>, <what to borrow: palette / type / texture / spacing / motion>
- <Name>, <URL>, <…>
- <Name>, <URL>, <…>
- <Name>, `docs/design/references/<file>` `(user-supplied)`, <what to borrow, from the user's own note>
<!-- 3–5 real instances of the style; live products first. User-supplied images
     from docs/design/references/ join the list marked (user-supplied): when
     they disagree with the pulled references, the user's images win.
     Anti-reference optional. Downstream stages design toward these, not toward
     memory. -->

**Starting tokens (seed: /uiux-init expands):**
- Palette temperament: …
- Type register: …
- Texture / motif: …
- Radius / shadow feel: …
- Motion personality: …

**Usability is independent of aesthetic.** The WCAG 2.2 AA floor and the
forms/interaction rules hold regardless of style: this pick never lowers
contrast, shrinks hit targets, or removes focus rings.
```

Then append the decision to `docs/DECISIONS.md` (cross-cutting: the whole app's
look), dated, with the **Why**. If a scaffold/design ADR exists
(`docs/adr/scaffold.md`), note the style there too as a `D`-entry.

### Step 7: Update STATUS and route
- Check the **Design style chosen** plan item in `docs/STATUS.md`.
- Set `## Next action` to `/plan-wireframes` (it reads the committed style and
  designs frames against it).
- Log the pick in the STATUS `## Log`. Tell Alex the style is recorded and
  wireframes come next; remind that the style rides under the wireframes gate for
  his approval.

## Mode: `restyle`: roll a new style onto an existing app

The rollout/redesign path. Use when an app already has a look and needs a new
one applied across its screens.

1. **Read the current style.** The existing `docs/DESIGN.md` "Style choice" (or
   infer the de-facto style from the code if none is recorded), plus SPEC/BRAND.
2. **Re-run selection (Steps 2–5).** Recommend a new PRIMARY × SECONDARY for the
   new intent; present alternatives; **Alex confirms.** Then pull the real-world
   references for the new style via web search (Step 4): a restyle needs the
   inspiration set just as much as a fresh pick.
3. **Record the supersession: don't silently diverge.** The old style is an
   `active` decision. Mark it superseded in `docs/DESIGN.md` and `docs/DECISIONS.md`
   (and the relevant `docs/adr/` entry), dated, with the reason, per the ADR
   contract in `docs/adr/README.md`: breaking an active decision needs explicit
   human confirmation. Write the new "Style choice" (including the pulled references) as in `select` Step 6.
4. **Hand off the application.** Applying the new style across screens is the
   native `/uiux-redesign`'s job: it rewrites the `docs/DESIGN.md` token system
   and sweeps every customer-facing screen (fully where they diverge, leaving
   already-aligned surfaces alone), running the sweep through the normal validate
   loop. Invoke it with the confirmed `[PRIMARY] × [SECONDARY]` and the recorded
   rationale. (If for some reason `/uiux-redesign` isn't present in the app, route
   the screen-by-screen work through `/uiux-audit` against the updated
   `docs/DESIGN.md` instead.) This skill owns the **decision**; `/uiux-redesign`
   owns the **application**.
5. **Guardrails.** A redesign is code change: it goes through the normal loop
   (green suite at every stop, the accessibility floor re-verified, push to the
   working branch: not a protected default). The style shift never overrides the
   two hard launch gates.

## What this skill does NOT do

- It doesn't write the full token system or component rules, that's `/uiux-init`.
- It doesn't sweep screens across an existing app, that's the native
  `/uiux-redesign` (with `/uiux-audit` as the fallback).
- It doesn't approve itself: the pick is Alex's to confirm.

It owns exactly one thing: **choosing and recording the named visual style**, so
every downstream stage builds against an intentful, committed look.
