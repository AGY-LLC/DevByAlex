# Prompt: create-page-override

The global design system covers 80% of decisions. The remaining 20% is
page-specific: marketing pages diverge from product pages, dashboards
diverge from forms, mobile screens diverge from desktop. This prompt
produces a focused page override.

## When to use

- A marketing landing diverging from the product's product surfaces.
- A dashboard where density must spike.
- A wizard / multi-step form that needs its own pacing.
- An onboarding flow.
- A settings surface that wants quieter visual weight.
- Any page whose job is meaningfully different from the rest of the
  app.

## Inputs

- The style choice block + global design tokens.
- The specific page or pattern in scope.
- The user goal and primary action for this page.

## Behavior

1. Identify what makes this page different. Be honest: if the global
   system covers it, you don't need an override. Don't create overrides
   for their own sake.
2. Pick a *minimal* set of divergences. The override is the exception,
   not a parallel design system.
3. For each divergence, name:
   - What changes (color, density, type scale, motion, component
     shape).
   - Why it changes (page job, audience, context).
   - When it reverts (only on this page? this entire flow? this
     viewport?).

## Output format

A short page override block, written to
`docs/page-overrides/<page-name>.md`:

```
# Page override: <page name>

## Page job
<one sentence>

## Primary action
<one sentence>

## Divergences from the global system
- Color:        <what changes, why>
- Density:      <what changes, why>
- Typography:   <what changes, why>
- Motion:       <what changes, why>
- Components:   <which components diverge, how>
- Layout:       <hero, sections, breakpoints>

## Scope of divergence
<which routes / viewports this applies to>

## Anti-patterns specific to this page
- <list>

## Notes for downstream prompts
<one paragraph that the next prompt can copy into its context>
```

## Safety / quality checks

- An override should be small. If you're writing more than ~20 rules,
  reconsider: you may need to revisit the global system.
- Never override accessibility floors. WCAG AA is global; no page
  override may drop below it.
- Never override reduced-motion handling: motion-reduced is global.

## Example invocation

> "Use prompts/create-page-override.md for the Dashboard page in the
> finance preset. The dashboard needs higher density than the rest of
> the app and a stricter color discipline."
