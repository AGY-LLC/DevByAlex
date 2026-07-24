# SHARED-AREA: how this skill is wired to the `/uiux-*` commands

The `custom-uiux-skill/` folder plays **two roles**:

1. **Standalone skill.** Its `SKILL.md` is auto-loaded by Claude Code
   and triggers on UI-work prompts (redesign, polish, design-system
   extraction, etc.). When triggered, the agent follows the core loop
   in `SKILL.md`.

2. **Shared resource area** for three sibling wrapper skills, one
   per slash command:

   ```
   ~/.claude/skills/uiux-init/SKILL.md
   ~/.claude/skills/uiux-redesign/SKILL.md
   ~/.claude/skills/uiux-audit/SKILL.md
   ```

   Each wrapper is a **self-contained skill**: its `SKILL.md` holds
   the full workflow (When to Activate / Workflow / Output Format),
   no separate spec file. See `COMMANDS.md` for the index and the
   typical flow.

## What's shared (and how)

Each wrapper folder exposes the shared subdirectories and the two
top-level shared files via symlinks that point back here:

```
~/.claude/skills/uiux-<name>/
  SKILL.md
  references                → ../custom-uiux-skill/references
  tokens                    → ../custom-uiux-skill/tokens
  checklists                → ../custom-uiux-skill/checklists
  prompts                   → ../custom-uiux-skill/prompts
  style-router.md           → ../custom-uiux-skill/style-router.md
  project-brief-template.md → ../custom-uiux-skill/project-brief-template.md
```

So inside a wrapper's `SKILL.md`, paths like `references/luxury-
commerce.md`, `tokens/color.md`, `checklists/forms.md`,
`prompts/critique-ui.md`, `style-router.md`, and
`project-brief-template.md` all resolve through the symlinks to the
real files in this folder. One copy, ten consumers.

Shared content kept here:

- `references/*.md`: 12 visual directions (dir symlinked).
- `tokens/*.md`: color, typography, spacing, radius/shadow/depth,
  motion, icons (dir symlinked).
- `checklists/*.md`: accessibility, responsive, mobile-interaction,
  visual-quality, interaction-states, forms, navigation, performance,
  release (dir symlinked).
- `prompts/*.md`: reusable AI prompts (dir symlinked).
- `style-router.md`: 10-question diagnostic (file symlinked into
  every wrapper).
- `project-brief-template.md`: fill before any UI work (file
  symlinked into every wrapper).
- `workflows/*.md`: per-platform agent workflows.
- `project-presets/*.md`: worked examples.

## How sharing works mechanically

Claude Code skills have **no import system**. A skill is just a
folder with a `SKILL.md` (plus any supporting files). One mechanism
is in play here:

- **Symlinks.** Each wrapper folder symlinks the shared
  subdirectories (`references/`, `tokens/`, `checklists/`,
  `prompts/`) **and** the two shared top-level files
  (`style-router.md`, `project-brief-template.md`) back to this
  folder. Reading any of those paths from inside a wrapper resolves
  to `custom-uiux-skill/<...>` transparently: no absolute paths,
  works on any user's system.

There is no synchronization step. Edit any file in this folder and
the next `/uiux-<name>` invocation picks up the change automatically.

**Maintainers note.** The library `SKILL.md` (this folder) and each
wrapper `SKILL.md` describe overlapping pieces of the same workflow
on purpose: the library covers the full loop, each wrapper covers
its one command. When you change the canonical loop (steps,
ordering, output format), update **both** the library `SKILL.md`
and any affected wrapper `SKILL.md`. They will not auto-sync.

This matches the pattern used by
`nextlevelbuilder/ui-ux-pro-max-skill`'s umbrella skill, which
symlinks `data` and `scripts` into its skill folder from a shared
`src/` directory.

## Adding a new `/uiux-<name>` command

1. Create the wrapper skill folder at
   `~/.claude/skills/uiux-<new>/` and write its `SKILL.md` using one
   of the existing wrappers as a template. The body contains the
   full workflow inlined (When to Activate / Workflow / Files
   referenced / Output Format / Skills used / Safety / Example).
2. Symlink the shared subdirectories and the two shared top-level
   files into the new wrapper:
   ```
   cd ~/.claude/skills/uiux-<new>
   ln -s ../custom-uiux-skill/references                references
   ln -s ../custom-uiux-skill/tokens                    tokens
   ln -s ../custom-uiux-skill/checklists                checklists
   ln -s ../custom-uiux-skill/prompts                   prompts
   ln -s ../custom-uiux-skill/style-router.md           style-router.md
   ln -s ../custom-uiux-skill/project-brief-template.md project-brief-template.md
   ```
3. If the workflow needs a new prompt, add it at
   `~/.claude/skills/custom-uiux-skill/prompts/<related>.md`. All
   wrappers automatically see it through their `prompts` symlink.
4. Add the row to `COMMANDS.md`.

## Removing a `/uiux-<name>` command

Delete the wrapper folder at `~/.claude/skills/uiux-<name>/` and
remove its row from `COMMANDS.md`. The shared area is untouched and
nothing else needs to change.
