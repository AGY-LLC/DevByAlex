#!/usr/bin/env bash
# DevByAlex provisioner — installs the workflow's skills, agents, and templates
# into a TARGET APP's project scope (<app>/.claude/) so they load only in that
# app, and so a cron/headless run on that app carries its own workflow logic.
#
# This is project-scoped on purpose: the user scope (~/.claude) would load the
# workflow into every repo and couldn't keep per-project STATUS context pinned
# to one app. Each app gets its own copy of the skills + templates and its own
# docs/STATUS.md (stamped by init-ai), so an unattended run reads that app's
# state to know its stage and next action.
#
# `init-ai` calls this same provisioning as part of bootstrapping an app; you
# can also run it by hand to drop the skills into a brand-new app *before*
# init-ai is loaded there.
#
# Default is COPY (self-contained, survives clone/CI, commit-able). Use
# --symlink only for dogfooding on this machine, where a live link back to this
# repo is wanted and the repo will always be present at this path.
#
# It ALSO vendors the workflow's reused skills (test-suite-developer, scout,
# issue-checker, fix-errors, staging-smoke-test, launch-readiness, prose-check,
# seo-audit, accessibility-critique, marketer-brand-generation,
# marketer-copywriting) from the operator's user scope (~/.claude/skills) into the
# app, so a cloud/CI checkout carries them too — they are not otherwise in this
# repo. Pass --no-reused to skip; set DEVBYALEX_REUSED_SKILLS_DIR to source them
# from elsewhere.
#
# Usage:
#   ./install.sh <app-path>             # copy skills + agents + templates (+ reused skills) into <app>/.claude
#   ./install.sh <app-path> --symlink   # symlink instead (live link back to this repo; not portable)
#   ./install.sh <app-path> --no-reused # skip vendoring the reused skills
#   ./install.sh <app-path> --uninstall # remove only the DevByAlex-managed files from <app>/.claude
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TARGET=""
MODE="copy"
REUSED="yes"
for arg in "$@"; do
  case "$arg" in
    --symlink)   MODE="link" ;;
    --copy)      MODE="copy" ;;
    --no-reused) REUSED="no" ;;
    --uninstall) MODE="uninstall" ;;
    -* ) echo "unknown flag: $arg" >&2; exit 1 ;;
    *  ) if [ -z "$TARGET" ]; then TARGET="$arg"; else echo "unexpected arg: $arg" >&2; exit 1; fi ;;
  esac
done

if [ -z "$TARGET" ]; then
  echo "usage: ./install.sh <app-path> [--symlink|--no-reused|--uninstall]" >&2
  echo "  installs the DevByAlex workflow into <app>/.claude (project scope)." >&2
  exit 1
fi
if [ ! -d "$TARGET" ]; then
  echo "target app dir does not exist: $TARGET" >&2; exit 1
fi

TARGET_DIR="$(cd "$TARGET" && pwd)"
CLAUDE_DIR="$TARGET_DIR/.claude"
SKILLS_DST="$CLAUDE_DIR/skills"
AGENTS_DST="$CLAUDE_DIR/agents"
TEMPLATES_DST="$CLAUDE_DIR/templates"

if [ "$MODE" != "uninstall" ]; then
  mkdir -p "$SKILLS_DST" "$AGENTS_DST"
fi

# Place one source path into a destination dir. Only ever touches the
# DevByAlex-managed name, so the target's own unrelated .claude skills/agents
# are left alone.
place_one() {
  local src="$1" dst="$2"
  local name; name="$(basename "$src")"
  local target="$dst/$name"
  if [ "$MODE" = "uninstall" ]; then
    # Only DevByAlex-managed names reach here (the loops iterate this repo's
    # skills/agents), so the app's own unrelated .claude entries are never
    # visited. Remove our copy or link, whichever it is.
    if [ -e "$target" ] || [ -L "$target" ]; then rm -rf "$target"; echo "removed $target"; fi
    return
  fi
  if [ -e "$target" ] && [ ! -L "$target" ] && [ "$MODE" = "link" ]; then
    echo "SKIP $target (exists as real file; not replacing with a symlink)"; return
  fi
  rm -rf "$target"
  if [ "$MODE" = "copy" ]; then
    cp -R "$src" "$target"; echo "copied  $name"
  else
    ln -s "$src" "$target"; echo "linked  $name -> $src"
  fi
}

echo "DevByAlex: $MODE  (repo: $REPO_DIR  ->  $CLAUDE_DIR)"

for d in "$REPO_DIR"/skills/*/; do
  [ -f "$d/SKILL.md" ] && place_one "${d%/}" "$SKILLS_DST"
done

for f in "$REPO_DIR"/agents/*.md; do
  [ -f "$f" ] && place_one "$f" "$AGENTS_DST"
done

# Reused skills: the workflow CALLS these rather than reinventing them. They
# normally live in the operator's user scope (~/.claude/skills) — which a local
# run sees but a cloud/CI checkout of the app does NOT. Vendor them into the
# app's project scope too so any runner carries the full toolset. Override the
# source with DEVBYALEX_REUSED_SKILLS_DIR; pass --no-reused to skip.
REUSED_SRC="${DEVBYALEX_REUSED_SKILLS_DIR:-$HOME/.claude/skills}"
REUSED_SKILLS="test-suite-developer scout issue-checker fix-errors staging-smoke-test launch-readiness prose-check seo-audit accessibility-critique marketer-brand-generation marketer-copywriting ios-audit create-demo"
if [ "$MODE" = "uninstall" ]; then
  for name in $REUSED_SKILLS; do place_one "$REUSED_SRC/$name" "$SKILLS_DST"; done
elif [ "$REUSED" = "yes" ]; then
  for name in $REUSED_SKILLS; do
    src="$REUSED_SRC/$name"
    if [ -d "$src" ] && [ -f "$src/SKILL.md" ]; then
      place_one "$src" "$SKILLS_DST"
    else
      echo "WARN  reused skill '$name' not found at $src — a cloud/CI run will lack it; install it there and re-run." >&2
    fi
  done
fi

# templates/ ships alongside the skills so init-ai's ../../templates/ resolves
# whether it runs from this repo (<repo>/skills/init-ai -> <repo>/templates) or
# from a provisioned app (<app>/.claude/skills/init-ai -> <app>/.claude/templates).
place_one "$REPO_DIR/templates" "$CLAUDE_DIR"

echo "done. Open $TARGET_DIR in Claude Code (or /agents, /help) so it picks up the project-scoped skills + agents."
