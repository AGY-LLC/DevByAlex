# Prompt: final-ui-qa

A single integrated QA pass before shipping. Runs the checklists, the
AI-UI detector, and the design-fit checks in one sequence.

## Inputs

- The shipping branch / built screens.
- The style choice block.
- The complete design doc (`docs/DESIGN.md`).
- Any page overrides.

## Behavior

Run in order. Stop and fix when a stage finds a critical issue, then
restart that stage.

1. **Brief fit.** Compare each screen to the brief's brand adjectives
   and "avoid" list. Note any drifts.
2. **Style fit.** Compare each screen to the chosen primary and
   secondary references. Note any drifts.
3. **Checklist sweep.** For each screen, walk:
   - `checklists/accessibility.md`
   - `checklists/responsive.md`
   - `checklists/mobile-interaction.md` (if mobile-relevant)
   - `checklists/visual-quality.md`
   - `checklists/interaction-states.md`
   - `checklists/forms.md` (where inputs exist)
   - `checklists/navigation.md`
   - `checklists/performance.md`
   - `checklists/release-ui-review.md`
4. **AI-UI detector.** Run `prompts/generic-ai-ui-detector.md` on
   every customer-facing screen, especially landing and onboarding.
5. **Consistency sweep.** Are radius, shadow, color, type sizes, and
   motion durations consistent across screens? Variations should be
   justified by overrides; otherwise they're drift.
6. **Reduced motion.** Toggle reduced motion. Re-walk the key flows.
   Nothing meaningful should disappear; only decoration.
7. **Dark / light mode parity.** Both modes must work. Functional
   colors must remain semantic.
8. **Localization fit.** Run with a long-language pseudo-locale
   (German or Finnish style, long words) to catch truncation. RTL
   if relevant.
9. **Empty / loading / error states.** Every data region has all
   three.
10. **Final read.** Read the UI as if you were the target user. Is the
    UI the brand adjectives? Is the avoid list still avoided?

## Output format

```
FINAL UI QA REPORT: <product>, <date>

BRIEF FIT:               <pass | issues>
STYLE FIT:               <pass | issues>
CHECKLISTS:
  accessibility:         <pass | issues>
  responsive:            <pass | issues>
  mobile-interaction:    <pass | issues | n/a>
  visual-quality:        <pass | issues>
  interaction-states:    <pass | issues>
  forms:                 <pass | issues | n/a>
  navigation:            <pass | issues>
  performance:           <pass | issues>
  release-ui-review:     <pass | issues>
AI-UI DETECTOR:          <pass | borderline | generic: fix list>
CONSISTENCY:             <pass | drift items>
REDUCED MOTION:          <pass | issues>
DARK / LIGHT PARITY:     <pass | issues>
LOCALIZATION:            <pass | issues>
EMPTY/LOADING/ERROR:     <pass | gaps>

REMAINING DESIGN DEBT:
  - <item, severity, suggested owner>
  - <item, severity, suggested owner>

VERDICT:                 <ship | block: reason>
```

## Safety / quality checks

- Do not stamp pass on a screen with two or more AI-UI tells. Fix
  first.
- Do not stamp pass on a screen failing WCAG AA. Fix first.
- Do not stamp pass on a screen where the primary action isn't
  obvious.
- The verdict is "block" if any stage marks a critical issue, full
  stop.

## Example invocation

> "Use prompts/final-ui-qa.md on the current branch. The product is
> the AI notes app. Style basis: AI-native + editorial."
