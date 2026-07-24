# Checklist: release UI review

The last UI gate before merging or shipping. Goes alongside (not
instead of) `prompts/final-ui-qa.md`.

## Brief & system fit

- [ ] Style choice block in `docs/DESIGN.md` matches the brief.
- [ ] All shipped screens cite the primary / secondary direction.
- [ ] Page overrides exist for surfaces that diverge.
- [ ] No screen drifts from the system without an override.

## Visual consistency

- [ ] Radius, shadow, color, type sizes, motion durations consistent
      across screens.
- [ ] Icon set consistent (same family, weight, alignment).
- [ ] Form components consistent (one input style, one button style
      per variant).
- [ ] Tables and lists use the same row heights and densities.

## State completeness

- [ ] Every data region has empty, loading, error states.
- [ ] Every interactive element has default, hover, focus, active,
      disabled.
- [ ] Loading and disabled buttons differ from each other and from
      enabled.
- [ ] Skeletons match their real content layouts.

## Accessibility

- [ ] No WCAG AA contrast failures.
- [ ] No keyboard traps.
- [ ] Reduced motion respected.
- [ ] Focus order logical on all new screens.
- [ ] Forms have labels and announced errors.

## Responsive

- [ ] All target breakpoints work: 360px, 768px, 1024px, 1440px,
      ≥1920px.
- [ ] No horizontal scroll on body.
- [ ] No hover-only critical info on touch viewports.
- [ ] Sticky chrome doesn't occlude content.

## Performance budget

- [ ] LCP, CLS, INP within budget on key pages.
- [ ] Hero image weight bounded.
- [ ] Font payload bounded.
- [ ] Bundle analyzer output reviewed if framework changes happened.

## Generic-AI tells

- [ ] No screen has 2+ tells from `prompts/generic-ai-ui-detector.md`.
- [ ] Sparkle / wand icons absent.
- [ ] Rainbow gradients absent.
- [ ] No identical pricing-table-of-three on the landing.
- [ ] No animated number counters in the hero.

## Dark / light parity

- [ ] Both modes audited.
- [ ] Functional colors (positive, warn, danger) pass contrast in
      both.
- [ ] No dark-mode-only or light-mode-only screens unless deliberate.

## Localization

- [ ] Long-word pseudo-locale tested: no truncation in chrome.
- [ ] RTL tested if any RTL locale is supported.
- [ ] Numerals and dates respect locale where relevant.

## Branding

- [ ] Brand mark used consistently.
- [ ] Voice and tone match the brief on copy.
- [ ] No accidental brand-color drift to a different hue.

## Legal / compliance

- [ ] Privacy policy link reachable.
- [ ] Accessibility statement present where required.
- [ ] Required regulatory copy not removed during redesign.
- [ ] Cookie banner (where applicable) does not obscure hero.

## Documentation

- [ ] `docs/DESIGN.md` updated with any new tokens or component rules.
- [ ] `docs/page-overrides/` updated for new overrides.
- [ ] Change report for this PR lists what changed, why, and remaining
      debt.

## Sign-off

- [ ] Visual QA owner has signed off.
- [ ] Engineering owner has signed off on a11y and performance.
- [ ] Product owner has signed off on brief fit.

If any item is unchecked, do not merge.
