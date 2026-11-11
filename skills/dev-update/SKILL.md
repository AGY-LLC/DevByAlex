---
name: dev-update
description: "Re-vendors the latest DevByAlex (skills, agents, templates, knowledge/) into the current app's .claude/ with install.sh --update, using the .claude/.devbyalex.json stamp to find the checkout, and reports old to new version. Never touches docs/ or non-managed .claude entries. Use when the user says 'update the workflow', 'pull the latest DevByAlex skills' or 'refresh the skills', or after DevByAlex improved and an onboarded app is stale."
argument-hint: "[optional: path to the DevByAlex checkout, if the stamp is missing]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# dev-update: Re-vendor the latest DevByAlex into this app

## Goal

The current app's DevByAlex-managed files in `.claude/` match the latest
DevByAlex, and the user knows which version it moved from and to. The
workflow is vendored (committed copies) so a clone or CI checkout carries it
with no external brain or MCP; the cost is that an upstream improvement only
reaches an app when it is re-vendored, which is what this does.

## Done when

- The DevByAlex checkout is found from `.claude/.devbyalex.json`
  (`source_path`, with `source_ref` / `version` as the current lineage), or
  from the argument or the user when the stamp is missing (the app predates
  stamping).
- The checkout was refreshed with `git -C "<source_path>" pull --ff-only`, or,
  when that fails (local edits, detached, offline), used as-is with the ref
  noted.
- `"<source_path>/install.sh" "<app-root>" --update` ran: it re-syncs only
  managed files, prunes ones this version no longer ships, rewrites the stamp
  and prints `old_ref -> new_ref`.
- The report gives the old and new version (or says it was already current),
  flags skill changes that could shift an in-flight build, and, if
  `docs/secrets.manifest.json` is missing, flags the one-time passworder
  migration (`knowledge/stack/secrets-passworder.md`, run through
  `/init-ai`'s additive backfill); if `docs/DECISIONS.md` has no
  `## Hard rules` section, it flags that `/init-ai` should be re-run to
  backfill the Goal and Hard rules.

## Decisions (and why)

- **Manual and per app only; goal runs never self-update.** Why: a build
  should not shift underfoot mid-run. Updating every onboarded app is the
  operator command `install.sh --update-all`, not this skill.
- **The secrets migration is flagged, never run here.** Why: it registers the
  project and imports env files, which needs a deliberate step.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Never force the checkout pull.
- Never touch `docs/`, `STATUS.md` or a `.claude` entry DevByAlex doesn't own.
