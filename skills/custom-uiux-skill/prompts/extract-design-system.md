# Prompt: extract-design-system

Use this to extract a design system from either (a) screenshots /
references the user provides, or (b) an existing codebase. The output
is a `docs/DESIGN.md` (or equivalent) the team can read and the AI can
re-read on later passes.

## Inputs

- One of:
  - Screenshots or design files (Figma exports, real product captures).
  - The current code repo with existing components and styles.
  - Both.
- The style choice block (if it exists). If not, run
  `prompts/choose-style.md` first.

## Behavior

1. Inventory what exists. From the source, extract:
   - Color values (cluster near-duplicates).
   - Type stacks, sizes, weights, line-heights.
   - Spacing increments actually used.
   - Radius / shadow / border patterns.
   - Component patterns (button shapes, card shapes, navigation
     patterns, modal patterns).
   - Motion durations and easings.
   - Iconography style.
2. Cluster and clean. Snap values to a base grid (4px or 8px). Reduce
   redundant colors to a small set with semantic names. Pick a single
   radius scale.
3. Cross-check with the style choice block. If the references say
   "off-white surface" and the codebase uses pure white, that's a
   choice the system has to make: recommend and explain.
4. Produce the design doc.

## Output format

Write `docs/DESIGN.md` (or the project's chosen path) with these
sections:

```
# Design system: <product name>

## Style choice
<paste the style choice block here>

## Color
- Surfaces: <surface, surface-2, surface-3>
- Ink: <ink, ink-dim>
- Accent: <primary accent, when to use>
- Functional: <positive, warn, danger, info>
- Dark mode mapping (if applicable)
- WCAG notes: <known pairs that pass / fail>

## Typography
- Font stacks (display, body, mono)
- Type scale (with px values and line-heights)
- Hierarchy: when to use which size/weight
- Tabular figures: where required

## Spacing
- Base unit, scale
- Container paddings (mobile / desktop)
- Vertical rhythm rules

## Radius / shadow / depth
- Radius scale
- Shadow scale (when used)
- Border strategy

## Motion
- Default duration + easing
- Variants (open, close, hover, press, streaming)
- Reduced-motion behavior

## Iconography
- Source / set, weight, sizes
- Allowed exceptions (e.g., flags, brand marks)

## Component rules
- Buttons, inputs, cards, modals, tables, navigation
- Each with allowed variants and when to use them

## Page overrides (link to /page-overrides/* if separate files)

## Anti-patterns
<the anti-patterns list>
```

## Safety / quality checks

- Do not invent values that aren't grounded in the source. If you must
  invent (because the source is incomplete), mark those values
  "PROPOSED: needs review."
- Do not collapse semantic colors into decorative ones. Green-up and
  green-accent are not the same.
- Reduce the system to the minimum that covers the actual UI. A token
  with one use is not a token.

## Example invocation

> "Use prompts/extract-design-system.md on the src/ directory and the
> Figma exports in design/exports/. Write docs/DESIGN.md."
