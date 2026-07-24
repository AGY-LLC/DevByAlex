# General agent workflow

The platform-agnostic way to use this skill. Other workflow files
(Cursor, Claude Code, Codex, Windsurf) layer on platform-specific
mechanics, but the core loop is the same.

## The loop

```
read brief → diagnose → pick references → load tokens →
generate / redesign → checklists → AI-UI detector → final QA → report
```

## Detailed steps

### 1. Read the brief

- Open `project-brief-template.md` (the user's filled copy is usually
  in `docs/UIUX-BRIEF.md` or in the conversation).
- If 3+ fields are missing or unclear, ask 3–5 targeted questions
  before proceeding. Do not invent a brief.

### 2. Diagnose

- Open `style-router.md`.
- Walk all 10 diagnostic questions.
- Run the three sanity checks.
- Produce the canonical style choice block.

### 3. Pick references

- Open `references/<primary>.md` and `references/<secondary>.md`
  end-to-end. Note overlaps and conflicts.
- Apply the conflict rules from `style-router.md`.

### 4. Load tokens

- Read all six `tokens/*.md` files relevant to the project.
- Combine the references' guidance with the tokens to produce concrete
  values.
- Write or update `docs/DESIGN.md` (use `prompts/extract-design-
  system.md` for the document structure).

### 5. Apply page overrides

- For each surface that meaningfully diverges, generate a page
  override using `prompts/create-page-override.md` and write to
  `docs/page-overrides/<page>.md`.

### 6. Generate / redesign

- For each screen, use `prompts/generate-new-screen.md` or
  `redesign-existing-screen.md`.
- Implement code, not just descriptions.

### 7. Run the checklists

- For every screen, walk:
  - `checklists/accessibility.md`
  - `checklists/responsive.md`
  - `checklists/interaction-states.md`
  - `checklists/visual-quality.md`
  - `checklists/forms.md` (if applicable)
  - `checklists/mobile-interaction.md` (if applicable)
  - `checklists/navigation.md`
  - `checklists/performance.md`

### 8. Run the AI-UI detector

- Apply `prompts/generic-ai-ui-detector.md`.
- If two or more tells are present on a screen, redesign that screen.

### 9. Final QA

- Apply `prompts/final-ui-qa.md` and produce the report.
- If the verdict is "block," fix and re-run.

### 10. Report

- Produce a short change report: what changed, why, what design debt
  remains.

## Hard rules

1. Never default to one fixed aesthetic.
2. Never skip the brief.
3. Always pick two references (primary + secondary).
4. Never sacrifice accessibility for aesthetic.
5. Never confuse the marketing-site aesthetic with the product
   surfaces' aesthetic.
6. The brief's "avoid" list is non-negotiable.

## Output expectations

For every UI task, return:

- Updated code.
- Updated `docs/DESIGN.md` (if tokens changed).
- Updated `docs/page-overrides/*` (if overrides changed).
- A short change report.

## When the user gives a one-line UI request

Translate it into the loop:

- "Make this prettier." → run `/uiux critique` first, then `/uiux
  redesign`.
- "Build a settings page." → run `/uiux choose-style` if not yet, then
  `/uiux page-override` for settings, then `/uiux generate-screen`.
- "This looks AI-generated." → run `/uiux detect-ai-ui`, then `/uiux
  redesign`.
- "Polish the landing." → `/uiux landing-polish`.
- "Audit before ship." → `/uiux final-qa`.

## When the user is on a platform without slash commands

Just point to the prompt files directly: "Use `prompts/<name>.md` on
`<file>` with style basis from `docs/DESIGN.md`."
