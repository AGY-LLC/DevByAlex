# Prompt: generate-new-screen

Use this to design and implement a new screen, given an existing style
choice block and any page-specific overrides.

## Inputs

- The style choice block from `prompts/choose-style.md` (or
  `docs/DESIGN.md`).
- Optional: a page override (`prompts/create-page-override.md` output).
- A clear description of what the screen needs to do: user goal,
  primary action, secondary actions, data it shows.
- Existing components / design system if any.

## Behavior

1. Re-read the style choice block. Hold the primary and secondary
   references in mind for the rest of the task.
2. State, in one sentence, what the user is doing on this screen and
   what the success state looks like.
3. Identify the **single primary action** for the screen. If you
   cannot name it, you do not yet know enough: ask.
4. Sketch the screen in words first (zones, hierarchy, primary action
   placement) before writing any code. Do not skip this.
5. Generate the implementation using the project's stack, the chosen
   references' component patterns, and the design tokens.
6. Apply page overrides if any.
7. Run the relevant checklists:
   - `checklists/accessibility.md`
   - `checklists/responsive.md`
   - `checklists/interaction-states.md`
   - `checklists/forms.md` (if any inputs are present)
   - `checklists/mobile-interaction.md` (if mobile-first or responsive)
8. Run `prompts/generic-ai-ui-detector.md` on the result.
9. Report what you implemented, what you intentionally diverged from,
   and what design debt remains.

## Output format

Return:

1. A short narrative (3–6 sentences) describing the screen.
2. The implemented code (components, styles).
3. A "design notes" block:
   ```
   PRIMARY ACTION:        <one line>
   STYLE BASIS:           <primary + secondary, with one line each>
   OVERRIDES APPLIED:     <list, or "none">
   CHECKLIST RESULTS:     <pass / issues found and fixed / known debt>
   AI-UI DETECTOR:        <pass / what was caught>
   ```

## Safety / quality checks

- Never include a sparkle-gradient hero unless the brief explicitly
  asked for one.
- Never use `rounded-2xl` on everything by default. Use the radius
  rules from `tokens/radius-shadow-depth.md`.
- Never put more than one primary CTA in the visible area unless the
  brief explicitly asks for it.
- Always verify all four interaction states (default, hover, focus,
  active, disabled, loading): see `checklists/interaction-states.md`.
- Always include the empty / loading / error states for any data
  region.

## Example invocation

> "Use prompts/generate-new-screen.md to design the 'Today' home
> screen for the language learning preset. Inputs: project-presets/
> sample-language-learning-app.md and docs/DESIGN.md. Primary action:
> open today's lesson."
