# Prompt: critique-ui

Audit a screen (or set of screens) and return a prioritized, IDed list
of issues. This is review, not implementation. Use
`prompts/redesign-existing-screen.md` to actually fix things.

## Inputs

- A screen (file, screenshot, URL).
- The style choice block (if available).
- Brand adjectives + "things to avoid" from the project brief.

## Behavior

Walk the screen through these lenses in this order:

1. **Comprehension.** In 3 seconds, what is this screen telling the user
   to do? If it's not clear, the rest doesn't matter: log this first.
2. **Hierarchy.** Is the visual weight aligned with what matters most?
3. **Primary action clarity.** Is the primary CTA obvious, reachable,
   and unique?
4. **Contrast & legibility.** Text/background pairs, focus ring, link
   contrast. WCAG AA floor.
5. **Spacing & rhythm.** Density appropriate? Aligned to grid? Vertical
   rhythm consistent?
6. **Typography.** Sizes, weights, leading, line length, hierarchy.
7. **Color use.** Functional vs. decorative. Semantic colors used only
   for meaning? Accents over-used?
8. **Component shape language.** Radius, depth, borders consistent
   with chosen references?
9. **Interaction states.** Hover, focus, active, disabled, loading,
   empty, error all present?
10. **Forms** (if present). Labels, error handling, validation, focus
    order, mobile input types: see `checklists/forms.md`.
11. **Navigation.** Hierarchy, current-page indication, breadcrumbs,
    back behavior: see `checklists/navigation.md`.
12. **Motion.** Purposeful? Reduced-motion respected? Performance OK?
13. **Mobile / touch** (if relevant). Tap targets ≥ 44px, gestures,
    sticky chrome, keyboard avoidance.
14. **Accessibility.** Keyboard nav, screen-reader, contrast, motion,
    text scaling: see `checklists/accessibility.md`.
15. **Generic-AI tells.** Run the indicators from
    `prompts/generic-ai-ui-detector.md`.
16. **Brand fit.** Does this match the brand adjectives and avoid the
    "avoid" list? If not, flag.

## Output format

Return an IDed table (sorted by impact):

```
ID       AREA            ISSUE                                   SEVERITY    SUGGESTED FIX
CRT-001  Hierarchy       Hero CTA competes with secondary nav    high        Drop nav weight; move secondary actions to overflow.
CRT-002  Contrast        "Sign in" link 3.4:1 on cream surface   high        Darken to ink (#181818) or move underline.
CRT-003  AI-UI tell      Sparkle icon on every feature row       med         Replace with category-specific iconography.
CRT-004  Forms           Email field missing autocomplete=email  med         Add inputMode + autocomplete.
…
```

Severity scale:

- **critical**: blocks comprehension or fails accessibility.
- **high**: meaningfully degrades the experience.
- **med**: clearly wrong but workable.
- **low**: polish.

End with a one-paragraph summary that names the *top three* fixes to
make in the next pass.

## Safety / quality checks

- Stay in critique mode. Do not write fix code unless asked.
- Do not soften severity to be polite; call critical issues critical.
- Always cite the file path : line number (or screenshot region) for
  each item if available.

## Example invocation

> "Use prompts/critique-ui.md on src/pages/Onboarding.tsx. The product
> is the language learning preset. Return a prioritized list."
