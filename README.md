# DevByAlex

An autonomous, stage-gated workflow that takes an app from a one-line idea to
launch-ready — packaged as a Claude Code plugin (skills + specialist agents).

**Plan** it (spec → implementation guide → wireframes, human-approved), **build**
it (scaffold → auth → a per-feature build/validate loop that runs unattended on
a schedule), then **verify** it for launch. State lives in each target repo's
`docs/STATUS.md`; one command — `init-ai` — brings any repo, blank or existing,
under the workflow.

## Quick start

```bash
# 1. Make the skills + agents live in ~/.claude (symlinks back to this repo)
./install.sh
#    (restart Claude Code, or it'll re-scan skills/agents on next launch)

# 2. In a chat, bootstrap a target app (blank or existing):
/init-ai /path/to/your/app

# 3. Plan it (human-gated):
/plan-spec        # interview → docs/SPEC.md
/plan-guide       # → docs/IMPLEMENTATION_GUIDE.md + docs/features/*
/plan-wireframes  # → Figma frames (needs a Figma MCP)
#    …then YOU approve the spec, guide, and wireframes in docs/STATUS.md

# 4. Build it (autonomous once gates are approved):
/dev-scaffold     # one-time baseline
/dev-auth         # authentication first
/dev-autopilot .  # advance the build one safe step (run repeatedly / on a schedule)

# 5. Launch readiness (staging deploy is manual):
/launch-acceptance
```

To run the dev stage unattended, see **[docs/SCHEDULING.md](docs/SCHEDULING.md)**.

## What's in here

```
.claude-plugin/plugin.json   plugin manifest
install.sh                   symlink (or --copy) skills + agents into ~/.claude
skills/                      the 9 stage skills (init-ai, plan-*, dev-*, launch-*)
agents/                      the 5 specialist agents the feature loop deploys
templates/                   the docs/ files init-ai stamps into a target repo
docs/WORKFLOW.md             the full architecture and invariants
docs/SCHEDULING.md           how to run the loop unattended (ready-to-run recipes)
IMPLEMENT.md                 the original brief this implements
```

See **[docs/WORKFLOW.md](docs/WORKFLOW.md)** for the stage map, every skill and
agent, the existing skills it reuses, and the invariants that make autonomy safe.

## How it stays safe to automate

- **Human gates** between plan and dev (spec/guide/wireframes approval) and a
  manual staging deploy — agents never self-approve.
- **One safe step per autopilot run**, all state in the repo, so the loop is
  bounded, resumable, and reviewable (PR per step).
- **Tests trace to the spec** (test-author and implementer run blind, in
  parallel); **validators judge but don't fix**; **branches + green suite** at
  every stop.
- **Security & privacy first**, most of all in auth.

## Requirements

- Claude Code with the **BuildsByAlex MCP** connected (supplies Alex's encoded
  best-practice playbooks and stack conventions).
- A **Figma MCP** for the wireframing stage (`/plan-wireframes` stops and points
  you to setup if none is connected).
- The reused skills in `~/.claude/skills`: `test-suite-developer`, `scout`,
  `issue-checker`, `fix-errors`, `staging-smoke-test`, `launch-readiness`.
