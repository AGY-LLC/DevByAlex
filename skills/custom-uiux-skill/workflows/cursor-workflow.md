# Cursor workflow

Using this skill inside Cursor.

## Where to put the files

Drop `custom-uiux-skill/` anywhere in your repo. Cursor reads files
from the workspace, so the path is mostly cosmetic. A reasonable
location: `tools/custom-uiux-skill/` or `docs/uiux/`.

## Wiring it up

Cursor has a few ways to surface this skill:

1. **`.cursorrules`**: add a short blurb pointing the AI at the
   skill:

   ```
   When the user asks for UI generation, redesign, polish, critique,
   or final QA, use the custom-uiux-skill at tools/custom-uiux-skill/.
   Start with SKILL.md. Follow workflows/general-agent-workflow.md.
   ```

2. **Rules for AI** (project-level rules): same content as above,
   but framed as a rule with a scope (UI files / .tsx / .css).

3. **`@`-referencing**: when you start a Cursor chat about UI, type
   `@SKILL.md` to put the canonical entry point in context.

4. **Reusable prompts**: create your own Cursor commands that just
   reference the prompt files. Example: a "UI Critique" reusable
   prompt that says "Use prompts/critique-ui.md on the currently
   selected file."

## Slash commands

Cursor does not have nested slash commands at the time of writing. Use
the colon-namespaced fallback form:

```
/uiux:choose-style
/uiux:generate-screen
/uiux:redesign
/uiux:critique
/uiux:extract-system
/uiux:landing-polish
/uiux:mobile-polish
/uiux:detect-ai-ui
/uiux:page-override
/uiux:final-qa
```

If your Cursor workspace doesn't surface them as real slash commands,
type the name as a directive and the AI will follow the corresponding
file in `slash-commands/`.

## Typical session

1. Tell Cursor: "We're starting UI work on `<feature>`. Use
   custom-uiux-skill. Read SKILL.md."
2. Run `/uiux:choose-style` (or paste the directive).
3. Run `/uiux:extract-system` to generate `docs/DESIGN.md`.
4. For each screen, run `/uiux:generate-screen` or
   `/uiux:redesign`.
5. Use `/uiux:detect-ai-ui` aggressively, especially on marketing.
6. Wrap with `/uiux:final-qa`.

## Best-practices for Cursor specifically

- Cursor's @-references put files in context: use `@SKILL.md`,
  `@docs/DESIGN.md`, and `@references/<chosen>.md` at the start of any
  significant UI chat.
- Don't rely on Cursor's "Apply" auto-fix for design changes: design
  changes need to be reviewed visually.
- Keep `docs/DESIGN.md` open while working: Cursor will pick it up.
- For complex redesigns, use Composer mode and reference the prompt
  file directly.

## Common Cursor pitfalls

- Asking Cursor to "make this look better" without grounding it in the
  skill: you'll get default Vercel-template output.
- Letting Cursor auto-apply Tailwind classes without consulting the
  tokens file.
- Skipping the brief because Cursor "just builds."

## Recommendations to add to `.cursorrules`

```
# UI/UX work
Use the custom-uiux-skill at <path>/SKILL.md whenever the task
involves design, redesign, polish, critique, page generation,
landing-page work, mobile polish, design-system extraction, or
final UI QA. Always start from the project brief at docs/UIUX-BRIEF.md
(create one from project-brief-template.md if it doesn't exist). Pick
a primary and secondary direction from references/: never default to
one fixed aesthetic. Run the AI-UI detector before declaring any
screen done.
```
