# Checklist: visual quality

The "does it look on purpose" pass. Use after structural correctness is
in place.

## Hierarchy

- [ ] The eye lands on the most important thing first.
- [ ] Visual weight (size, color, position, contrast) aligns with
      semantic importance.
- [ ] No two elements compete for "primary."
- [ ] Hierarchy reads at a glance with the page squinted at.

## Type

- [ ] No more than two type families (display + body), with mono only
      when needed.
- [ ] Type scale is consistent: no arbitrary 17px, 19px, 23px mixed
      together.
- [ ] Line lengths between 45–80ch for body copy.
- [ ] Line-heights match the family (humanist sans ~1.5, serif ~1.6,
      mono ~1.45).
- [ ] No orphaned single words on their own line at the end of a
      paragraph in display copy.
- [ ] Numerals are tabular wherever numbers change (dashboards,
      tables, prices).

## Color

- [ ] Functional colors used only for meaning (green-up, red-down,
      amber-warn), never decoratively.
- [ ] One signature accent dominates; no rainbow palette in a single
      surface.
- [ ] Surfaces have a sane elevation order (surface → surface-2 →
      surface-3) instead of arbitrary greys.
- [ ] Dark mode is not just inverted; it's tuned for dark surfaces.

## Spacing

- [ ] All spacing snaps to the base unit (4 or 8px).
- [ ] Vertical rhythm consistent: sections breathe predictably.
- [ ] Padding inside cards consistent across the system.
- [ ] No "magic numbers" (37px, 13px): every value either snaps or
      has a comment explaining why it doesn't.

## Radius / depth / borders

- [ ] One radius scale used everywhere; not every element shares the
      same radius.
- [ ] Shadows match the system's depth scale.
- [ ] Borders are consistent in color and weight; hairlines are
      explicitly 1px (not 0.5px on standard DPR).

## Iconography

- [ ] All icons from the same set (or deliberately mixed with rules).
- [ ] Icon weight matches type weight where the icon sits next to text.
- [ ] Icons sized to align with the cap-height of their adjacent text.
- [ ] No emoji used as icons unless the brief explicitly allows it.

## Imagery

- [ ] No stock photos that read as "team in meeting smiling at laptop."
- [ ] Images respect aspect ratios: no awkward letterboxing.
- [ ] Photography is consistent in tone, contrast, and crop.
- [ ] Illustrations match each other in style.

## Composition

- [ ] No accidental near-alignment: items either align or visibly
      don't.
- [ ] White space is intentional, not residue.
- [ ] No tiny CTAs lost in seas of padding, and no buttons crammed
      against edges.
- [ ] Cards have an obvious "front": title at top, action at bottom.

## Polish

- [ ] Loading skeletons match real layout.
- [ ] Empty states are designed, not "no data" text.
- [ ] Toasts and snackbars styled to match the system.
- [ ] Dialogs and confirms aren't generic alert boxes.
- [ ] Selection (highlight) color matches the brand accent.

## Anti-patterns flagged for fix

- [ ] Sparkle / wand icons on AI features.
- [ ] Rainbow gradients.
- [ ] `rounded-2xl` on every component.
- [ ] Pastel blur orbs in the background.
- [ ] Glassmorphism as the default surface.
- [ ] Glow rings around primary buttons.
- [ ] Animated number counters in the hero.

If two or more flagged anti-patterns are present, run
`prompts/generic-ai-ui-detector.md` and redesign.
