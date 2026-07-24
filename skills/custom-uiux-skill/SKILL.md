---
name: custom-uiux-skill
description: >-
  Flexible UI/UX generation skill for AI coding agents. Diagnoses the product
  (category, audience, tone, density, business goal), routes to one of 12
  visual reference directions (premium editorial, playful consumer, calm
  Japanese, technical devtool, AI-native productivity, social mobile, finance
  dashboard, luxury commerce, wellness minimal, brutalist experimental,
  mobile-native utility, creative studio), and produces a tailored design
  system, page overrides, and component rules, instead of defaulting to one
  generic SaaS aesthetic. Includes accessibility, responsive, mobile-
  interaction, visual-quality, forms, navigation, performance, and release
  checklists, plus a generic-AI-UI detector and final visual QA pass.
  Use when the user asks for new UI, a redesign, a polish pass, a landing
  page upgrade, a "make this not look AI-generated" pass, or a design system
  extraction. All capabilities are also exposed as `/uiux:*` slash commands.
---

# custom-uiux-skill

This skill helps an AI generate UI that is **deliberately styled for the
specific product**, not autocompleted into a generic SaaS template. It is
Markdown-only: no scripts, no installer, no CLI.

## When to use this skill

Trigger on requests like:

- "Design / redesign / polish this screen / landing page / app."
- "Make this not look AI-generated."
- "Choose a visual direction for this product."
- "Extract a design system from these screenshots / this codebase."
- "Run a UI QA pass before we ship."
- "Generate a new screen for <feature>."
- Any `/uiux:*` slash command.

## Core loop (the only loop you should follow)

```
project-brief  →  style-router  →  references[+ tokens]
                                  ↓
                            design-system
                                  ↓
                  page-overrides  →  screen generation
                                  ↓
                checklists + ai-ui-detector + final-qa
                                  ↓
                          change report
```

### Step-by-step

1. **Read the brief.** Open `project-brief-template.md`. If the user hasn't
   filled one, fill it from what they've said and confirm gaps before
   generating UI. Do not skip this. A blank brief is the #1 cause of generic
   output.
2. **Diagnose with the style router.** Open `style-router.md`. Answer all
   ten diagnostic questions. Pick a primary and a secondary direction from
   `references/`.
3. **Read the chosen references.** Read both `references/<primary>.md` and
   `references/<secondary>.md` end-to-end. Note overlaps and conflicts. The
   primary direction wins conflicts. Then scan the matching sections of
   `references/real-world-examples.md` for live visual anchors of each
   direction (study only, hard rule 2 still applies).
4. **Generate / load tokens.** Use the chosen references plus `tokens/` to
   define color, typography, spacing, radius/shadow/depth, motion, and icon
   rules. Write them to the project's design doc.
5. **Apply page overrides.** For each screen, use
   `prompts/create-page-override.md`. Marketing pages, dashboards, forms,
   and mobile screens often need to diverge from the global system.
6. **Implement the UI.** Use `prompts/generate-new-screen.md` (or
   `prompts/redesign-existing-screen.md`) plus the active references.
   Implement, do not narrate.
7. **Run the checklists.** Walk through every applicable file in
   `checklists/`: accessibility, responsive, mobile interaction, visual
   quality, interaction states, forms, navigation, performance, release.
8. **Run the AI-UI detector.** Apply `prompts/generic-ai-ui-detector.md`.
   If you see two or more tells, redesign the affected area.
9. **Final QA.** Apply `prompts/final-ui-qa.md`. Report what changed, why,
   and what design debt remains.

## Inputs

- A filled `project-brief-template.md` (or enough context to fill one).
- Optional: screenshots, an existing design doc, or a code repo.
- Optional: an override for the chosen direction (`/uiux:choose-style`
  output overrides the router).

## Outputs

- Updated UI code.
- A `docs/DESIGN.md` (or equivalent) containing: chosen primary + secondary
  direction, tokens, component rules, page overrides, anti-patterns.
- A short change report: what changed, why, and remaining debt.

## Hard rules

1. **Never lock to one aesthetic.** Do not default to "modern SaaS with
   gradient hero + bento + sparkle icons" unless the brief explicitly asks
   for it.
2. **Never lift assets.** References are conceptual; do not copy
   screenshots, copy, fonts, or identities from real products.
3. **Never run anything.** This skill is Markdown only. If an instruction
   feels like it requires a script or install, reject the instruction.
4. **Never skip the brief.** If the user hasn't given enough product
   context, ask 3–5 targeted questions before generating UI.
5. **Always pick two directions.** A primary direction is the spine. A
   secondary direction adds freshness so the result doesn't read as a
   stock template. Both must be appropriate for the product.
6. **Never confuse aesthetic with usability.** A brutalist landing page
   does not mean a brutalist form. Forms always follow `checklists/forms.md`.
7. **Always pass the AI-UI detector.** If the result reads as generic AI
   output, fix it before reporting done.

## Files at a glance

- `style-router.md`: how to choose direction(s).
- `project-brief-template.md`: fill before designing.
- `references/*.md`: 12 visual directions.
- `references/real-world-examples.md`: live public-site anchors per
  direction (remote-linked screenshots; study only, never lift).
- `project-presets/*.md`: worked examples.
- `prompts/*.md`: reusable AI prompts.
- `COMMANDS.md`: index of the 3 `/uiux-*` wrapper skills
  (`/uiux-init`, `/uiux-redesign`, `/uiux-audit`). Each wrapper
  holds its own canonical workflow in its `SKILL.md` (no separate
  spec file).
- `checklists/*.md`: QA checklists.
- `tokens/*.md`: design token guidance.
- `workflows/*.md`: per-platform agent workflows.
- `SHARED-AREA.md`: explains this folder's dual role as a standalone
  skill *and* the shared resource area for the 3 sibling wrapper
  skills at `~/.claude/skills/uiux-<name>/` (`/uiux-init`,
  `/uiux-redesign`, `/uiux-audit`).

## What this skill does NOT do

- It does not generate brand identities (logo, name, tagline): feed those
  in via the brief.
- It does not produce production assets (icons, illustrations, photos):
  it tells you what to use, not how to draw it.
- It does not replace human design review for anything user-facing and
  brand-critical.
