#!/usr/bin/env bash
# DevByAlex installer — makes the workflow's skills and agents live in ~/.claude
# so they can be invoked from any project.
#
# It symlinks (not copies) each skill and agent out of this repo so the repo
# stays the single source of truth — edits here take effect immediately.
#
# Usage:
#   ./install.sh            # symlink skills + agents into ~/.claude
#   ./install.sh --copy     # copy instead of symlink (for machines where you
#                           # don't want a live link back to this repo)
#   ./install.sh --uninstall
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SKILLS_DST="$CLAUDE_DIR/skills"
AGENTS_DST="$CLAUDE_DIR/agents"
MODE="link"

case "${1:-}" in
  --copy) MODE="copy" ;;
  --uninstall) MODE="uninstall" ;;
  "" ) ;;
  * ) echo "unknown arg: $1" >&2; exit 1 ;;
esac

mkdir -p "$SKILLS_DST" "$AGENTS_DST"

link_one() {
  local src="$1" dst="$2"
  local name; name="$(basename "$src")"
  local target="$dst/$name"
  if [ "$MODE" = "uninstall" ]; then
    if [ -L "$target" ]; then rm "$target"; echo "removed link $target"; fi
    return
  fi
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "SKIP $target (exists and is not a symlink — not touching it)"; return
  fi
  rm -f "$target"
  if [ "$MODE" = "copy" ]; then
    cp -R "$src" "$target"; echo "copied  $name"
  else
    ln -s "$src" "$target"; echo "linked  $name -> $src"
  fi
}

echo "DevByAlex: $MODE  (repo: $REPO_DIR  ->  $CLAUDE_DIR)"

for d in "$REPO_DIR"/skills/*/; do
  [ -f "$d/SKILL.md" ] && link_one "${d%/}" "$SKILLS_DST"
done

for f in "$REPO_DIR"/agents/*.md; do
  [ -f "$f" ] && link_one "$f" "$AGENTS_DST"
done

echo "done. Restart Claude Code (or run /agents and /help) so it re-scans skills + agents."
