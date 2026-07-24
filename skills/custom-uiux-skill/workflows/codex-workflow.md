# Codex workflow

Using this skill with Codex (OpenAI's Codex / `codex` CLI and
adjacent agentic coding tools).

## Where to put the files

Codex reads from the workspace. Drop `custom-uiux-skill/` anywhere
sensible: `tools/custom-uiux-skill/` or `docs/uiux/` are common.

## Wiring it up

Codex respects an `AGENTS.md` (or `CODEX.md`, depending on version)
file at the repo root that gives the agent project-wide instructions.
Add a short pointer there:

```
# AGENTS.md

## UI/UX work
For any UI, design, redesign, polish, critique, page generation, or
final UI QA task, use the custom-uiux-skill at
`tools/custom-uiux-skill/`. Start with `SKILL.md` and follow
`workflows/general-agent-workflow.md`. Pick a primary and secondary
direction from `references/`: never default to one fixed aesthetic.
Run the AI-UI detector before declaring any screen done.
```

## Slash commands

Codex's slash-command support varies. Two practical approaches:

1. **Plain directives.** Type `/uiux-choose-style` (or just
   `uiux-choose-style`) in the chat. Codex will treat it as an
   instruction and look up the matching wrapper skill at
   `~/.claude/skills/uiux-choose-style/SKILL.md` (the wrapper holds
   the full workflow).
2. **Custom prompts.** If your Codex install supports user-defined
   prompts or "snippets," create one per command. Each snippet should
   point at the corresponding wrapper skill's `SKILL.md`.

Use the colon-namespaced form since nested slash commands aren't
universally supported in Codex:

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

## Typical session

1. Open the repo. Confirm `AGENTS.md` references the skill.
2. Tell Codex: "We're starting UI work on `<feature>`."
3. Run `/uiux:choose-style` against `docs/UIUX-BRIEF.md`.
4. Run `/uiux:extract-system`.
5. Iterate with `/uiux:generate-screen` and `/uiux:redesign`.
6. Wrap with `/uiux:final-qa`.

## Best-practices for Codex specifically

- Codex tends to be aggressive about applying changes. Tell it
  explicitly when to stop and ask for review, particularly after the
  style choice block is produced (you want a human to confirm before
  cascading the system).
- Codex's tool use sometimes glosses over context. Keep `SKILL.md`,
  `style-router.md`, and the chosen references explicitly referenced
  in the prompt for every UI session.
- For long sessions, periodically remind Codex of the active style
  choice block: model drift to "modern SaaS default" is common.

## Common Codex pitfalls

- Codex deciding it knows a "better" aesthetic mid-session and
  cascading changes: re-anchor it with the brief.
- Codex installing UI libraries (radix, shadcn variants) without
  consulting the token system. Tell it: stack changes require human
  approval; design changes do not require library swaps.
- Codex running through the loop without producing `docs/DESIGN.md`:
  enforce the file output as a hard requirement.

## Recommendations to add to `AGENTS.md`

Same blurb as above. Plus, if you have a checklist culture:

```
Before merging any UI PR, the description must include:
- Style basis (primary + secondary)
- Page overrides used
- AI-UI detector verdict
- Final UI QA report verdict
```
