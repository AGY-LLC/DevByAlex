#!/usr/bin/env bash
# Regenerate the live-skill stubs under live-stubs/.
#
# A "live" reused skill is one whose canonical body is served by the BuildsByAlex
# MCP brain (https://buildsbyalex.com/mcp). Instead of vendoring a full copy of
# that skill into every target app — which goes stale the moment the skill is
# improved and forces a re-vendor across every repo — we ship a THIN STUB that
# loads the live body from the brain on every run. Update the brain once and
# every onboarded repo is current on its next run, with no re-vendoring.
#
# This generator is the single source of truth for (a) which reused skills are
# live and (b) the stub text. Edit the LIVE registry below, run this, and commit
# the regenerated live-stubs/. install.sh copies these stubs into target apps.
#
# Keep the registry in sync with the BuildsByAlex brain: a skill may only be
# listed here once `list_skills` on the brain returns it (otherwise the stub
# would point at a tool that does not exist).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$REPO_DIR/live-stubs"

# name|short routing description (first clause of the brain's full description;
# the authoritative full description + body live on the brain).
LIVE=(
  "test-suite-developer|Builds a comprehensive, outcome-driven test suite — maps every behavior, contract, and invariant, then writes and runs the tests until green."
  "scout|Deep full-repo adversarial audit that partitions the codebase and debates each section, compiling confirmed issues into an IDed FIND-xxx fix queue."
  "issue-checker|Verifies whether a claimed issue is real and/or still present, returning PRESENT / NOT-PRESENT / INCONCLUSIVE backed by reproducible evidence."
  "fix-errors|Works through a list of errors or FIND-xxx findings one minimal fix at a time, verifying each, until zero remain."
  "staging-smoke-test|Generates a human-walkable manual smoke-test checklist covering every surface, integration, and config path before promoting staging to prod."
  "launch-readiness|Runs a pre-launch readiness checklist against the codebase — legal/policy, data-protection, security, performance, and copy quality."
  "prose-check|Strips AI tells from user-facing prose and repo docs — throat-clearing, false contrasts, passive voice, em dashes, vague declaratives."
  "seo-audit|Audits a repo's SEO surface from the code — semantic HTML, framework metadata, JSON-LD, canonical/hreflang, robots/sitemap (requires docs/BRAND.md)."
  "accessibility-critique|Adversarial accessibility audit against WCAG 2.2 AA, emitting a prioritized IDed A11Y-xxx fix queue."
  "ios-audit|Audits a mobile app against Apple App Store Review Guidelines and Google Play policy, emitting an IDed IOS-xxx fix queue with file:line evidence."
  "create-demo|Plans, scripts, and records marketing-grade product demo footage (Playwright for web, Maestro for mobile) under marketing/demos/."
)

rm -rf "$OUT"
mkdir -p "$OUT"

for entry in "${LIVE[@]}"; do
  name="${entry%%|*}"
  desc="${entry#*|}"
  slug="${name//-/_}"          # scout -> scout, test-suite-developer -> test_suite_developer
  tool="skill_${slug}"
  dir="$OUT/$name"
  mkdir -p "$dir"
  cat > "$dir/SKILL.md" <<EOF
---
name: $name
description: "$desc (Served live via the BuildsByAlex MCP — \`$tool\`.)"
---

> **Live skill — thin pointer, not the skill itself.** The real, always-current
> instructions for \`$name\` live on the BuildsByAlex brain and update in real
> time. This repo is never re-vendored when the skill changes; the live body is
> loaded fresh on every run.

When this skill is invoked:

1. Load the live skill by calling the MCP tool \`$tool\` (BuildsByAlex server) and
   follow exactly what it returns — that is the source of truth. If it names
   supporting files, fetch them with \`get_skill_resource\` (skill: \`$name\`).
2. If the BuildsByAlex MCP is not connected — \`$tool\` is unavailable or the call
   fails — STOP and tell the user to connect the BuildsByAlex MCP token
   (https://buildsbyalex.com/mcp). Do not improvise a local substitute.

Never paraphrase or cache the body here; always load it fresh so improvements on
the brain take effect immediately.
EOF
  echo "wrote $dir/SKILL.md"
done

echo "done: ${#LIVE[@]} live stubs -> $OUT"
