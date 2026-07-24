# Prompt: redesign-existing-screen

Use this to redesign a screen that already exists. The goal is a
*deliberate* redesign, not "replace generic look with another generic
look."

## Inputs

- The style choice block from `prompts/choose-style.md`.
- The current screen (file path, screenshot, or live URL).
- Optional: a list of user-reported problems with the current screen.

## Behavior

1. Read the current screen end-to-end. List its current zones,
   hierarchy, components, and motion. Do not start changing anything
   yet.
2. Identify, in writing:
   - What the screen is *trying* to do.
   - What it actually communicates.
   - The gap between those two.
3. Run `prompts/critique-ui.md` against the current screen to produce
   an issue list.
4. Run `prompts/generic-ai-ui-detector.md` against the current screen.
5. Sort issues by impact: hierarchy, comprehension, primary action
   clarity, contrast, spacing, density, motion, typography, color,
   micro-interactions.
6. Propose a redesign in words first. State which references' patterns
   you'll borrow and which anti-patterns you're explicitly avoiding.
7. Implement the redesign in code.
8. Re-run the checklists from `prompts/generate-new-screen.md`.
9. Re-run `prompts/generic-ai-ui-detector.md` on the new result. If it
   still trips a tell, redesign again; do not ship.

## Output format

1. A short "before / after" narrative: what changed and why.
2. The new implementation.
3. The full issue list with each item marked: fixed, partial,
   deferred (with reason).
4. The standard design notes block from `prompts/generate-new-screen.md`.

## Safety / quality checks

- Do not delete a working interaction state during a redesign. If the
  original had a loading state, the new one must too.
- Do not "modernize" by stripping features the user relies on.
- Do not switch type stacks mid-redesign without updating
  `tokens/typography.md`.
- If the redesign would break accessibility (contrast, focus, motion),
  it is wrong: fix the design, not the requirement.

## Example invocation

> "Use prompts/redesign-existing-screen.md on src/pages/Pricing.tsx.
> The user says it feels like every other SaaS pricing page and reads
> as untrustworthy."
