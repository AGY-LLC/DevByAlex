---
name: uiux-init
description: "Initialize a project's UI/UX foundation. Asks the user targeted questions about product, audience, tone, density, and brand, picks a primary + secondary visual direction from the custom-uiux-skill references, and writes a complete `docs/DESIGN.md` (style choice + color, typography, spacing, radius/shadow, motion, iconography, component rules, anti-patterns). Run once per project, or again when the brand or audience materially changes. Actions: init, set up, bootstrap, choose style, generate design doc, extract design system. Inputs: product context from user answers, optional screenshots / existing repo. Outputs: `docs/DESIGN.md` written to disk. Required prerequisite for `/uiux-audit`."
argument-hint: "[optional: source paths or brief file]"
license: MIT
metadata:
  author: alex-yoza
  version: "2.0.0"
---

# /uiux-init: Bootstrap the project's design doc

The setup pass. Diagnoses the product through a short Q&A, picks a
primary + secondary visual direction from the 12 references in
`custom-uiux-skill/references/`, and writes a complete
`docs/DESIGN.md` to disk. Every later `/uiux-audit` and
`/uiux-redesign` run depends on the doc this skill produces.

## When to Activate

- Starting UI work on a project that has no `docs/DESIGN.md`.
- The user says "init the design system," "set up the design doc,"
  "bootstrap UI," or "pick a style for this app."
- A rebrand or audience pivot has invalidated the existing doc.
- Skip if `docs/DESIGN.md` exists, reflects the current code, and the
  product context is unchanged: run `/uiux-audit` instead.

## Workflow

### Step 1: Check for an existing doc
Read `docs/DESIGN.md` if it exists. If it's current, stop and tell
the user to run `/uiux-audit`. If stale, ask whether to overwrite or
merge before continuing.

### Step 2: Ask the user the diagnostic questions
Ask **all** of these in one message and wait for answers. Don't
proceed without them.

1. What does this product do, in one sentence?
2. Who is the target user? (role, sophistication, why they care)
3. What is the primary user goal on the main screen?
4. What is the business goal? (conversion, retention, depth of use)
5. Emotional tone in 2–3 adjectives. (e.g. calm + precise, bold +
   playful, premium + restrained)
6. Interaction density: low (consumer), medium (productivity), or
   high (dashboard, IDE, finance)?
7. Platform priority: web, mobile web, native iOS, native Android,
   desktop, multi-platform?
8. Existing brand assets? (logo, colors, type, existing site/app
   URLs: paste or link)
9. References the user loves or hates. (products, sites, screenshots)
10. Anti-patterns to avoid. (e.g. "no gradient hero," "no bento
    grid," "no sparkle icons")

If the user provides a filled `project-brief-template.md`, use it as
the source of truth and only ask follow-ups for missing fields.

### Step 3: Walk the style router
Open `style-router.md`. Answer all 10 diagnostic questions in writing
using the user's answers. Nominate a primary and a secondary
direction from `references/`.

### Step 4: Read both nominated references end-to-end
Read `references/<primary>.md` and `references/<secondary>.md` in
full. Note overlaps and conflicts; the primary wins conflicts.
Then check `references/real-world-examples.md` for live examples of
the nominated directions; if the user gave thin answers to Q9
(loved/hated references), offer the matching examples as concrete
anchors to react to.

### Step 5: Sanity-check the picks
Run the three sanity checks in `style-router.md`:
- Audience fit
- Density fit
- Anti-pattern conflict with the user's avoid list

If any fails, re-pick before continuing.

### Step 6: Generate tokens
Use the chosen references plus `tokens/*.md` to define color,
typography, spacing, radius/shadow/depth, motion, and iconography
rules tailored to this product.

### Step 7: Mine the existing repo (if one exists)
If there's already UI code, inventory the recurring colors, type,
spacing, radii, shadows, and motion durations. Snap to a base grid.
Mark any token that was inferred (not explicit) as
**"PROPOSED: needs review."**

### Step 8: Write docs/DESIGN.md
Write the full doc to `docs/DESIGN.md`. Use the structure in
`prompts/extract-design-system.md`. The doc must include:

- Product summary (one paragraph from the user's answers)
- Style choice (primary + secondary, one-sentence why for each)
- Brand adjectives and anti-patterns
- Color tokens
- Typography ramp
- Spacing scale
- Radius / shadow / depth scale
- Motion (durations, easings, reduced-motion policy)
- Iconography rules
- Component rules (buttons, inputs, cards, modals, nav)
- Empty / loading / error state policy
- Accessibility priorities
- Responsive priorities
- Anti-patterns (5–10 things to avoid)

### Step 9: Confirm
Show the user the path written, the chosen primary + secondary
direction, and a one-line summary. Tell them they can now run
`/uiux-audit` or `/uiux-redesign`.

## Files referenced

- `style-router.md`: 10-question diagnostic.
- `project-brief-template.md`: brief structure.
- `references/<primary>.md`, `references/<secondary>.md`: the two
  chosen directions.
- `references/real-world-examples.md`: live public-site anchors for
  the chosen directions.
- `tokens/*.md`: color, typography, spacing, radius-shadow-depth,
  motion, icons.
- `prompts/choose-style.md`, `prompts/extract-design-system.md`:
  underlying prompts.

## Output

Writes `docs/DESIGN.md` to the project root. Returns a one-paragraph
confirmation with the chosen primary + secondary and the file path.

## Safety / quality checks

- Never default to one fixed aesthetic. Re-derive per product.
- Never invent tokens without grounding. Mark inferred values
  **"PROPOSED: needs review."**
- Always pick two directions: never a single one.
- If the user's anti-pattern list contradicts a nominated direction,
  re-pick.
- Don't skip the Q&A. A blank brief is the #1 cause of generic
  output.

## Example

> "/uiux-init: new project, AI notes app, premium feel."
