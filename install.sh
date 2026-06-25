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
# It ALSO provisions the workflow's reused skills, in two tiers:
#   * LIVE reused skills (scout, fix-errors, launch-readiness, … — the ones the
#     BuildsByAlex MCP brain serves) are installed as THIN STUBS from live-stubs/.
#     A stub loads the canonical body live from the brain on every run, so
#     improving a skill on the brain updates every onboarded repo with no
#     re-vendoring. See live-stubs/README.md.
#   * VENDORED reused skills (marketer-brand-generation, marketer-copywriting —
#     not yet on the brain) are copied from the operator's user scope
#     (~/.claude/skills), as before, so a cloud/CI checkout still carries them.
# Pass --no-reused to skip both; set DEVBYALEX_REUSED_SKILLS_DIR to source the
# vendored ones from elsewhere.
#
# Usage:
#   ./install.sh <app-path>             # install skills + agents + templates (live stubs + vendored reused) into <app>/.claude
#   ./install.sh <app-path> --symlink   # symlink the native skills instead (live link back to this repo; not portable)
#   ./install.sh <app-path> --no-reused # skip the reused skills (both tiers)
#   ./install.sh <app-path> --update    # re-sync the managed files of an already-onboarded app to this repo's version
#   ./install.sh --update-all           # --update every app in the onboarded-apps registry (no <app-path>)
#   ./install.sh <app-path> --migrate   # convert an already-onboarded repo's heavy reused-skill COPIES to live stubs
#   ./install.sh <app-path> --uninstall # remove only the DevByAlex-managed files from <app>/.claude
#
# UPDATES (skills stay local/committed; updates are a manual command, not live).
# Each install stamps <app>/.claude/.devbyalex.json (this repo's version + git
# ref) and records the app in the onboarded-apps registry (.onboarded-apps in
# this repo, gitignored). To push a skill improvement out:
#   * one app:   ./install.sh <app-path> --update
#   * every app: ./install.sh --update-all
# --update only re-vendors the DevByAlex-managed files; it never touches the
# app's docs/STATUS.md or any non-managed .claude entry.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TARGET=""
MODE="copy"
REUSED="yes"
for arg in "$@"; do
  case "$arg" in
    --symlink)    MODE="link" ;;
    --copy)       MODE="copy" ;;
    --no-reused)  REUSED="no" ;;
    --update)     MODE="update" ;;
    --update-all) MODE="update-all" ;;
    --migrate)    MODE="migrate" ;;
    --uninstall)  MODE="uninstall" ;;
    -* ) echo "unknown flag: $arg" >&2; exit 1 ;;
    *  ) if [ -z "$TARGET" ]; then TARGET="$arg"; else echo "unexpected arg: $arg" >&2; exit 1; fi ;;
  esac
done

# Registry of onboarded apps (absolute paths, one per line), used by --update-all.
# Gitignored — it's a local operator convenience, not repo state.
REGISTRY="$REPO_DIR/.onboarded-apps"

# This repo's version (plugin manifest) and current git ref — stamped into each
# onboarded app so `--update` can report old -> new and the app records its lineage.
DEVBYALEX_VERSION="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$REPO_DIR/.claude-plugin/plugin.json" 2>/dev/null | head -1)"
DEVBYALEX_VERSION="${DEVBYALEX_VERSION:-unknown}"
DEVBYALEX_REF="$(git -C "$REPO_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"

# --update-all: re-sync every registered app, then stop. No <app-path> needed.
if [ "$MODE" = "update-all" ]; then
  if [ ! -f "$REGISTRY" ]; then
    echo "no onboarded-apps registry ($REGISTRY) — nothing to update. Run a normal install first." >&2; exit 1
  fi
  rc=0
  while IFS= read -r app; do
    [ -z "$app" ] && continue
    if [ ! -d "$app/.claude" ]; then
      echo "skip  $app (no .claude — not onboarded or moved)"; continue
    fi
    echo "==> updating $app"
    "$REPO_DIR/install.sh" "$app" --update || { echo "FAILED $app" >&2; rc=1; }
  done < "$REGISTRY"
  exit "$rc"
fi

if [ -z "$TARGET" ]; then
  echo "usage: ./install.sh <app-path> [--symlink|--no-reused|--update|--migrate|--uninstall]" >&2
  echo "       ./install.sh --update-all" >&2
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
STAMP="$CLAUDE_DIR/.devbyalex.json"

# --update is "re-vendor the managed files of an app that's already onboarded".
# Mechanically identical to a copy install, so remap to copy after asserting the
# app really is onboarded (don't silently first-time-install under an --update).
IS_UPDATE="no"
if [ "$MODE" = "update" ]; then
  if [ ! -d "$CLAUDE_DIR" ]; then
    echo "cannot --update $TARGET: no .claude/ (not onboarded). Run a normal install first." >&2; exit 1
  fi
  PREV_REF="$(sed -n 's/.*"source_ref"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$STAMP" 2>/dev/null | head -1)"
  IS_UPDATE="yes"; MODE="copy"
fi

if [ "$MODE" != "uninstall" ]; then
  mkdir -p "$SKILLS_DST" "$AGENTS_DST"
fi

# Reused skills, split by where their source of truth lives.
#   LIVE  — served by the BuildsByAlex MCP brain; installed as thin stubs from
#           live-stubs/ so the canonical body loads live (no re-vendoring).
#   VENDORED — not on the brain yet; copied from the operator's user scope.
# Keep LIVE_REUSED_SKILLS in sync with live-stubs/ (regenerated by
# sync/gen-live-stubs.sh) and with what `list_skills` on the brain returns.
LIVE_REUSED_SKILLS="test-suite-developer scout issue-checker fix-errors staging-smoke-test launch-readiness prose-check seo-audit accessibility-critique ios-audit create-demo"
VENDORED_REUSED_SKILLS="marketer-brand-generation marketer-copywriting"
STUBS_SRC="$REPO_DIR/live-stubs"

# Convert an already-onboarded repo from the old all-copies layout to the live
# model: replace each LIVE reused skill's heavy copy with its stub. Touches only
# those skills — native skills, vendored skills, agents, templates, and docs/ are
# left exactly as-is.
if [ "$MODE" = "migrate" ]; then
  if [ ! -d "$SKILLS_DST" ]; then
    echo "nothing to migrate: $SKILLS_DST does not exist (run a normal install first)" >&2; exit 1
  fi
  echo "DevByAlex migrate: $CLAUDE_DIR  (heavy reused-skill copies -> live stubs)"
  converted=0; skipped=0
  for name in $LIVE_REUSED_SKILLS; do
    stub="$STUBS_SRC/$name"
    dst="$SKILLS_DST/$name"
    if [ ! -f "$stub/SKILL.md" ]; then
      echo "WARN  no stub for '$name' in live-stubs — skipping" >&2; continue
    fi
    if [ ! -e "$dst" ]; then
      echo "skip  $name (not installed in this app)"; skipped=$((skipped+1)); continue
    fi
    if [ -f "$dst/.live-stub" ]; then
      echo "skip  $name (already a live stub)"; skipped=$((skipped+1)); continue
    fi
    rm -rf "$dst"
    cp -R "$stub" "$dst"
    : > "$dst/.live-stub"   # marker so re-running migrate is idempotent
    echo "live  $name  (was a full copy, now a stub)"
    converted=$((converted+1))
  done
  echo "done. converted $converted, skipped $skipped. Native skills/agents/templates and docs/ untouched."
  echo "The app now loads these skills live from the BuildsByAlex MCP — connect its token on any runner (see /dev-schedule)."
  exit 0
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

# Reused skills: the workflow CALLS these rather than reinventing them.
#   LIVE  — installed as a thin stub from live-stubs/ (canonical body loads live
#           from the BuildsByAlex brain; no re-vendoring on change).
#   VENDORED — copied from the operator's user scope (~/.claude/skills), which a
#           local run sees but a cloud/CI checkout does NOT, so we carry a copy.
# Override the vendored source with DEVBYALEX_REUSED_SKILLS_DIR; --no-reused skips both.
REUSED_SRC="${DEVBYALEX_REUSED_SKILLS_DIR:-$HOME/.claude/skills}"
if [ "$MODE" = "uninstall" ]; then
  for name in $LIVE_REUSED_SKILLS $VENDORED_REUSED_SKILLS; do
    t="$SKILLS_DST/$name"
    if [ -e "$t" ] || [ -L "$t" ]; then rm -rf "$t"; echo "removed $t"; fi
  done
elif [ "$REUSED" = "yes" ]; then
  # LIVE: drop the stub (which already loads from the brain).
  for name in $LIVE_REUSED_SKILLS; do
    stub="$STUBS_SRC/$name"
    if [ -f "$stub/SKILL.md" ]; then
      place_one "$stub" "$SKILLS_DST"
      # marker: this is a live stub, not a copy (skip in link mode — the target
      # is a symlink back into the repo and we must not write through it).
      [ "$MODE" = "copy" ] && : > "$SKILLS_DST/$name/.live-stub"
    else
      echo "WARN  live stub '$name' missing from live-stubs/ — run ./sync/gen-live-stubs.sh" >&2
    fi
  done
  # VENDORED: copy from user scope as before.
  for name in $VENDORED_REUSED_SKILLS; do
    src="$REUSED_SRC/$name"
    if [ -d "$src" ] && [ -f "$src/SKILL.md" ]; then
      place_one "$src" "$SKILLS_DST"
    else
      echo "WARN  vendored reused skill '$name' not found at $src — a cloud/CI run will lack it; install it there and re-run." >&2
    fi
  done
fi

# templates/ ships alongside the skills so init-ai's ../../templates/ resolves
# whether it runs from this repo (<repo>/skills/init-ai -> <repo>/templates) or
# from a provisioned app (<app>/.claude/skills/init-ai -> <app>/.claude/templates).
place_one "$REPO_DIR/templates" "$CLAUDE_DIR"

# Stamp the app with this repo's version/ref and record it in the registry, so
# `--update` can report old -> new and `--update-all` can find every onboarded
# app. Uninstall removes the stamp; the registry is left (a stale path is just
# skipped on the next --update-all).
if [ "$MODE" = "uninstall" ]; then
  [ -f "$STAMP" ] && { rm -f "$STAMP"; echo "removed $STAMP"; }
else
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo unknown)"
  cat > "$STAMP" <<EOF
{
  "name": "devbyalex",
  "version": "$DEVBYALEX_VERSION",
  "source_ref": "$DEVBYALEX_REF",
  "source_path": "$REPO_DIR",
  "updated_at": "$now"
}
EOF
  # Record this app in the registry (dedup; create if absent).
  touch "$REGISTRY"
  if ! grep -Fxq "$TARGET_DIR" "$REGISTRY" 2>/dev/null; then
    printf '%s\n' "$TARGET_DIR" >> "$REGISTRY"
  fi
fi

if [ "$IS_UPDATE" = "yes" ]; then
  if [ -n "${PREV_REF:-}" ] && [ "$PREV_REF" != "$DEVBYALEX_REF" ]; then
    echo "updated $TARGET_DIR: $PREV_REF -> $DEVBYALEX_REF (v$DEVBYALEX_VERSION)."
  else
    echo "updated $TARGET_DIR: now at $DEVBYALEX_REF (v$DEVBYALEX_VERSION)."
  fi
elif [ "$MODE" != "uninstall" ]; then
  echo "done ($DEVBYALEX_REF, v$DEVBYALEX_VERSION). Open $TARGET_DIR in Claude Code (or /agents, /help) so it picks up the project-scoped skills + agents."
else
  echo "done. Removed DevByAlex-managed files from $CLAUDE_DIR."
fi
