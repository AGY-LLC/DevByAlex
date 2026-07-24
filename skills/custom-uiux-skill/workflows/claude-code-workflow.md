# Claude Code workflow

Using this skill with Claude Code (CLI / desktop / web / IDE
extensions).

## Where to put the files

Claude Code looks for skills in standard locations: `~/.claude/skills/`
(global) or `.claude/skills/` (per-project). You can keep this skill
alongside the rest of your skills:

```
.claude/skills/custom-uiux-skill/
  SKILL.md
  …
```

Claude Code uses the `SKILL.md` frontmatter `name` and `description` to
decide when to trigger.

## Wiring it up

1. Drop the folder into `.claude/skills/custom-uiux-skill/` (project)
   or `~/.claude/skills/custom-uiux-skill/` (user).
2. Claude Code reads the YAML frontmatter on `SKILL.md` automatically.
3. When the user's request matches the description (UI work, redesign,
   polish, critique, etc.), the skill activates.

## Slash commands

Claude Code supports nested slash commands. Use the preferred form:

```
/uiux choose-style
/uiux generate-screen
/uiux redesign
/uiux critique
/uiux extract-system
/uiux landing-polish
/uiux mobile-polish
/uiux detect-ai-ui
/uiux page-override
/uiux final-qa
```

Each `/uiux-<name>` is implemented as its own wrapper skill at
`~/.claude/skills/uiux-<name>/SKILL.md`. The wrapper holds the full
workflow inlined (When to Activate / Workflow / Files referenced /
Output Format / Skills used / Safety / Example): no separate spec
file. The wrappers symlink `references/`, `tokens/`, `checklists/`,
and `prompts/` from this shared `custom-uiux-skill/` folder. See
`SHARED-AREA.md` for the architecture and
`COMMANDS.md` for the wrapper index.

## Typical session

1. User asks for UI work. Claude Code activates the skill via
   `SKILL.md`.
2. The skill follows `workflows/general-agent-workflow.md`.
3. The skill writes `docs/DESIGN.md` and any
   `docs/page-overrides/*.md`.
4. Implementation happens with the chosen references in context.
5. The skill runs the checklists and the AI-UI detector.
6. Final QA produces a report.

## Combining with other skills in this repo

This repo also has `designer`, `accessibility-critique`, and
`code-review` skills. They overlap with `custom-uiux-skill` but serve
different intents:

- **`designer`**: does its own audit + complete overhaul with
  brand/voice/audience clarification first. Best when a user wants a
  full design overhaul of an existing app.
- **`accessibility-critique`**: a deep-dive a11y review. Best when
  the user explicitly wants an accessibility audit.
- **`code-review`**: general code review, including some UI smells.
- **`custom-uiux-skill`**: a *flexible* UI/UX generation skill that
  always re-picks aesthetics per product, exposes `/uiux:*` commands,
  and produces a tailored design system.

When multiple skills could fire, prefer:

- `custom-uiux-skill` when the user is *generating* or *redesigning*
  UI.
- `designer` when the user is doing a full-app overhaul and wants the
  durable design doc + clarification flow.
- `accessibility-critique` when the user is doing an a11y-specific
  pass.
- `code-review` for general engineering review.

You can chain them: `code-review` → `accessibility-critique` →
`custom-uiux-skill final-qa`.

## Best-practices for Claude Code specifically

- The `Read` tool will pull these files in; you don't need to inline
  them.
- Use the `Plan` agent for complex redesigns before touching files.
- Use the `Explore` agent to find UI files quickly.
- The `verify` skill (if you have it) can confirm a UI change actually
  works in a browser.

## Recommendations for the project's CLAUDE.md

```
## UI/UX work
Use `.claude/skills/custom-uiux-skill/` whenever a request involves
design, redesign, polish, critique, page generation, landing-page
work, mobile polish, design-system extraction, or final UI QA. Start
from `docs/UIUX-BRIEF.md` (create one from
`project-brief-template.md` if missing). Pick a primary and secondary
direction from `references/`: never default to one fixed aesthetic.
Run the AI-UI detector before declaring any screen done.
```
