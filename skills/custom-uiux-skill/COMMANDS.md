# /uiux-* commands: index

Each command is its own skill at `~/.claude/skills/uiux-<name>/`.
The wrapper skill's `SKILL.md` contains the full workflow inlined
(no separate spec file). Each wrapper symlinks
`references/`, `tokens/`, `checklists/`, `prompts/`,
`style-router.md`, and `project-brief-template.md` from this folder
(the shared resource area).

| Command           | Wrapper skill                       | Purpose                                                                                  |
|-------------------|-------------------------------------|------------------------------------------------------------------------------------------|
| `/uiux-init`      | `~/.claude/skills/uiux-init/`       | Ask diagnostic questions, pick primary + secondary, write `docs/DESIGN.md`.              |
| `/uiux-redesign`  | `~/.claude/skills/uiux-redesign/`   | Ask redesign questions, then drive a repo-wide theme / style shift.                      |
| `/uiux-audit`     | `~/.claude/skills/uiux-audit/`      | Audit the repo against `docs/DESIGN.md` and apply tweaks. Refuses to run without the doc.|

## Typical flow

1. `/uiux-init`: once per project, to bootstrap the design doc.
2. Build screens.
3. `/uiux-audit`: sweep and tweak. Run before ship and whenever
   drift is suspected.
4. `/uiux-redesign`: only when the whole theme needs to shift.
   After it finishes, run `/uiux-audit` as the final sweep.

## Adding a new command

1. Create the wrapper skill folder at
   `~/.claude/skills/uiux-<new>/` with its `SKILL.md` (use any
   existing wrapper as a template).
2. Inside the new folder, symlink the shared subdirectories and
   top-level files:
   ```
   ln -s ../custom-uiux-skill/references                references
   ln -s ../custom-uiux-skill/tokens                    tokens
   ln -s ../custom-uiux-skill/checklists                checklists
   ln -s ../custom-uiux-skill/prompts                   prompts
   ln -s ../custom-uiux-skill/style-router.md           style-router.md
   ln -s ../custom-uiux-skill/project-brief-template.md project-brief-template.md
   ```
3. Add the row to the table above.

## Removing a command

Delete the wrapper folder at `~/.claude/skills/uiux-<name>/` and
remove its row from the table above. The shared area is untouched.
