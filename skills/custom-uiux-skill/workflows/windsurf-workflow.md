# Windsurf workflow

Using this skill with Windsurf (Codeium's agentic IDE).

## Where to put the files

Windsurf reads from the workspace. Drop `custom-uiux-skill/` at any
sensible path: `tools/custom-uiux-skill/` is common.

## Wiring it up

Windsurf supports:

- **Cascade memories / rules**: persistent context that the agent
  always reads.
- **Workflows**: Windsurf's named, reusable command sequences
  (sometimes called "flows" or "rules").
- **`@`-mentions**: to pull specific files into context for a chat
  turn.

Add a top-level workspace rule that points Cascade at the skill:

```
# .windsurf/rules/uiux.md (or wherever Windsurf stores rules)

For UI / design / redesign / polish / critique / generation / landing /
mobile / a11y / final-QA tasks, use the custom-uiux-skill at
`tools/custom-uiux-skill/`. Start with SKILL.md and follow
workflows/general-agent-workflow.md. Pick a primary and secondary
direction from references/: never default to one fixed aesthetic.
Run the AI-UI detector before declaring any screen done.
```

## Slash commands

Windsurf supports nested-style commands as workflows. Either form is
acceptable, but the colon-namespaced form is the safer default:

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

If your Windsurf install supports nested commands well, you can also
expose them as `/uiux choose-style` etc., backed by individual
workflow files.

To make each into a Windsurf workflow:

1. Create a workflow with the name `uiux:choose-style`.
2. Its body is a one-liner: "Read
   `tools/uiux-choose-style/SKILL.md` (the wrapper skill that holds
   the full inlined workflow) and follow its steps. Use
   `docs/UIUX-BRIEF.md` as the brief."
3. Repeat for each command: each command has its own wrapper skill
   at `~/.claude/skills/uiux-<name>/SKILL.md`.

## Typical session

1. Cascade opens the project. The UIUX rule is loaded.
2. The user invokes `/uiux:choose-style` against
   `docs/UIUX-BRIEF.md`.
3. Cascade produces the style choice block, writes
   `docs/DESIGN.md`.
4. For each screen, the user invokes `/uiux:generate-screen` or
   `/uiux:redesign`.
5. Cascade runs checklists per `workflows/general-agent-workflow.md`.
6. Wrap with `/uiux:final-qa`.

## Best-practices for Windsurf specifically

- @-mention `SKILL.md`, `docs/DESIGN.md`, and the chosen reference at
  the start of any new chat to lock context.
- Use Cascade's "edit" mode for redesigns: it can keep large files
  consistent across multi-step edits.
- Windsurf's "Flows" can chain multiple `/uiux:*` workflows; a "Full
  UI pass" flow can run choose-style → extract-system → generate
  screen(s) → critique → final QA.

## Common Windsurf pitfalls

- Cascade going off on a tangent and modifying tokens halfway through
  a feature. Re-anchor by referencing `docs/DESIGN.md` explicitly.
- Letting Windsurf bulk-edit without verifying interaction states are
  preserved: diffs can wipe out hover/focus/loading inadvertently.
- Forgetting that Windsurf may not have read the references unless
  you @-mention them.

## Recommendations to add to Windsurf rules

```
# Always
- For UI work, anchor every chat with SKILL.md, docs/DESIGN.md, and
  the active references/<chosen>.md.
- For any new screen, run /uiux:generate-screen, not a free-form
  build.
- Before declaring any screen done, run /uiux:detect-ai-ui.
```
