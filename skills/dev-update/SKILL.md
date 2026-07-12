---
name: dev-update
description: "DevByAlex ops skill for pulling the latest DevByAlex workflow into the CURRENT app's project scope. The whole workflow, including native skills, reused library skills, agents, templates, and the best-practice knowledge/, is vendored (copied) into each app's .claude/ on purpose, so it survives clone/CI and stays 'part of the project' with no external brain or MCP; the trade-off is that improving a skill doesn't reach an already-onboarded app until it's re-vendored. This skill does that re-vendor for the current app: it reads the .claude/.devbyalex.json stamp to find the DevByAlex checkout, optionally refreshes it, and runs install.sh --update so the app's managed files match the latest version. Does NOT touch docs/STATUS.md or any non-managed .claude entry. Use when the user says 'update the workflow', 'pull the latest DevByAlex skills', 'refresh the skills', or after DevByAlex itself has been improved and an onboarded app is stale."
argument-hint: "[optional: path to the DevByAlex checkout, if the stamp is missing]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-update: Re-vendor the latest DevByAlex into this app

DevByAlex skills (native + reused), agents, templates, and `knowledge/` are
**committed copies** in each app's `.claude/`: fully self-contained, with no
external brain or MCP. That keeps them portable (a clone or CI checkout carries
the whole workflow) but means an improvement upstream doesn't reach this app until
it's re-vendored. This skill performs that re-vendor for the **current app**: a
manual, explicit update, never automatic.

## When to activate

- The user says "update the workflow", "pull the latest skills", "refresh DevByAlex".
- DevByAlex itself was just improved and this onboarded app is on an older version.

## Workflow

### Step 1: Find this app's DevByAlex lineage
Read `.claude/.devbyalex.json` at the app root. It records:
- `source_ref` / `version`: what this app was last vendored from.
- `source_path`: the DevByAlex checkout that installed it.

If the stamp is missing, the app predates stamping (or was hand-copied). Ask the
user for the DevByAlex checkout path, or take it from the skill argument.

### Step 2: Refresh the DevByAlex checkout (optional but recommended)
So "latest" really is latest:
```bash
git -C "<source_path>" pull --ff-only
```
If the pull fails (local edits, detached, offline), don't force it: update from
the checkout as-is and note the ref the app lands on.

### Step 3: Re-vendor into this app
```bash
"<source_path>/install.sh" "<app-root>" --update
```
`--update` requires the app to already be onboarded (it refuses to first-time
install), re-syncs only the DevByAlex-managed files, rewrites the stamp, and
prints `old_ref -> new_ref`. It never touches `docs/`, `STATUS.md`, or any
`.claude` entry the workflow doesn't own.

### Step 4: Report
State the version/ref the app moved from and to. If nothing changed (already
current), say so. If skill bodies changed in ways that affect an in-flight build,
flag it so the user knows behavior may shift on the next run.

## Notes

- **One app at a time.** To refresh every app this operator has onboarded, run
  `"<source_path>/install.sh" --update-all` from the DevByAlex checkout: it walks
  the onboarded-apps registry and updates each. That's an operator command, not
  this per-app skill.
- **No auto-update.** Scheduled/autopilot runs do **not** self-update: updates
  are deliberate so a build can't shift underfoot mid-run. Run this when you want
  the new version, not before.

## Output

The current app's `.claude/` skills, agents, templates, and knowledge re-vendored
to the latest DevByAlex, the stamp rewritten, and a one-line old → new version
report.
