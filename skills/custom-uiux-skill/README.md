# custom-uiux-skill

A Markdown-only UI/UX skill for AI coding agents (Claude Code, Cursor, Codex,
Windsurf, etc.). Helps an AI go from a vague product brief to a coherent,
non-generic UI by:

1. Diagnosing what the product actually is (audience, density, tone, goal).
2. Routing to an appropriate **style direction** (one of 12 references).
3. Generating a design system + page-level overrides.
4. Applying component polish, accessibility, responsive, and motion rules.
5. Catching generic "AI-generated UI" patterns before they ship.
6. Running a final visual QA pass.

## What this is NOT

- Not a CLI, not an installer, not an npm package, not a script.
- Not a single fixed aesthetic. Every reference direction is one of many.
- Not a copy of any existing reference repo. It is inspired by the *structure*
  of large UI/UX skill packs (style catalogs, checklists, page overrides,
  slash-command workflows) but the contents are written from scratch.

## How an agent should use it

For an end-to-end pass, follow `workflows/general-agent-workflow.md`. For
platform specifics, see `workflows/cursor-workflow.md`,
`workflows/claude-code-workflow.md`, `workflows/codex-workflow.md`, and
`workflows/windsurf-workflow.md`.

The short loop is:

1. Read or fill `project-brief-template.md`.
2. Run `prompts/choose-style.md` (or `/uiux choose-style`) to pick a primary
   and secondary direction from `references/`.
3. Generate or load a design system using `tokens/` + the chosen references.
4. For each screen, apply `prompts/generate-new-screen.md` or
   `prompts/redesign-existing-screen.md`, with any
   `prompts/create-page-override.md` rules.
5. Run the checklists in `checklists/` plus
   `prompts/generic-ai-ui-detector.md`.
6. Finish with `prompts/final-ui-qa.md`.

## Folder map

```
custom-uiux-skill/
  README.md                 ← you are here
  SKILL.md                  ← the canonical entry point for AI agents
  SHARED-AREA.md            ← how this folder is wired to the /uiux-* wrappers
  COMMANDS.md               ← index of the 10 /uiux-* wrapper skills
  style-router.md           ← how to choose a visual direction
  project-brief-template.md ← fill this before generating UI
  references/               ← 12 reference directions (premium, playful, …)
  project-presets/          ← worked examples for common app types
  prompts/                  ← reusable prompts (generate, critique, QA, …)
  checklists/               ← a11y, responsive, forms, perf, release, …
  tokens/                   ← color, typography, spacing, motion, …
  workflows/                ← per-platform agent workflows

~/.claude/skills/uiux-<name>/    ← one self-contained wrapper skill per
                                   /uiux-<name> command. Each one
                                   symlinks references/, tokens/,
                                   checklists/, and prompts/ from this
                                   shared resource area.
```

## Safety principles

- Markdown only. No code execution, no install steps, no hidden behavior.
- References are *concepts*, not assets to copy. Do not lift screenshots,
  copy, fonts, or brand identities from real products.
- Do not rely on this skill to ship without human design review on anything
  user-facing and brand-critical.

## Extending

Add new references as `references/<name>.md` using the same 13-section
template. Add new presets in `project-presets/`.

To add a new slash command:

1. Create the wrapper skill folder at
   `~/.claude/skills/uiux-<name>/` and write its `SKILL.md` using one
   of the existing wrappers as a template. The wrapper's body holds
   the full workflow inlined (When to Activate / Workflow / Files
   referenced / Output Format / Skills used / Safety / Example).
   There is no separate spec file.
2. Symlink the shared subdirectories and the two shared top-level
   files into the new wrapper folder:
   ```
   cd ~/.claude/skills/uiux-<name>
   ln -s ../custom-uiux-skill/references                references
   ln -s ../custom-uiux-skill/tokens                    tokens
   ln -s ../custom-uiux-skill/checklists                checklists
   ln -s ../custom-uiux-skill/prompts                   prompts
   ln -s ../custom-uiux-skill/style-router.md           style-router.md
   ln -s ../custom-uiux-skill/project-brief-template.md project-brief-template.md
   ```
3. If the workflow needs a new prompt, add it at
   `prompts/<related>.md` in this folder. All wrappers see it
   automatically through their `prompts` symlink.
4. Add the row to `COMMANDS.md`.

See `SHARED-AREA.md` for the architecture (standalone skill +
shared resource area for the 10 wrapper skills) and rationale.

Avoid scattered top-level commands: keep everything under the
`uiux-*` namespace.
