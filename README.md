# DevByAlex

An autonomous, stage-gated workflow that takes an app from a one-line idea to
launch-ready — packaged as a Claude Code plugin (skills + specialist agents).

**Plan** it (spec → implementation guide → wireframes, human-approved), **build**
it (scaffold → auth → a per-feature build/validate loop that runs unattended on
a schedule), then **verify** it for launch. State lives in each target repo's
`docs/STATUS.md`; one command — `init-ai` — brings any repo, blank or existing,
under the workflow.

## Quick start

The workflow installs **per project** (`<app>/.claude/`), never user-scoped —
so it loads only inside the target app and each app's `docs/STATUS.md` stays its
own context. `/init-ai` does this for you; `install.sh` is the same provisioning
you can run by hand to bootstrap a brand-new app before `init-ai` is loaded.

```bash
# 1. Bootstrap a target app (blank or existing). This provisions the workflow
#    into <app>/.claude/ AND stamps its docs/:
/init-ai /path/to/your/app
#    — or, before init-ai is available there, drop the skills in from the shell:
#    ./install.sh /path/to/your/app   (copies skills+agents+templates; --symlink to dogfood)
#    then open that app and run: /init-ai .

# 2. Plan it (human-gated):
/plan-spec        # interview → docs/SPEC.md
/plan-guide       # → docs/IMPLEMENTATION_GUIDE.md + docs/features/*
/plan-wireframes  # → Figma frames (needs a write-capable Figma MCP)
#    …then YOU approve the spec, guide, and wireframes in docs/STATUS.md

# 3. Build it (autonomous once gates are approved):
/dev-scaffold     # one-time baseline
/dev-auth         # authentication first
/dev-autopilot .  # advance the build one safe step (run repeatedly / on a schedule)
#    Hit a bug? Jot it in docs/BUGS.md — each autopilot run drains the bug log
#    (fixing + verifying every open bug) BEFORE it touches any feature work.

# 4. Launch readiness (staging deploy is manual):
/launch-acceptance     # Playwright (web) + Maestro (iOS/Android) acceptance suites
/launch-visual-qa      # boot iOS + Android, screenshot every screen, critique → fix
/launch-compliance     # legal / a11y / SEO / prose gates
/launch-store-assets   # App Store + Play icon, screenshots, listing copy
/launch-submit         # YOU run this — build + ship to TestFlight + Play internal
```

To run the dev stage unattended, use **`/dev-schedule`** — it preflights, picks a
tier, takes the explicit working branch (e.g. `staging`, never assumed `main`),
and wires the runner's BuildsByAlex MCP token in as a secret. See
**[docs/SCHEDULING.md](docs/SCHEDULING.md)** for the underlying recipes.

## What's in here

```
.claude-plugin/plugin.json   plugin manifest
install.sh                   provision skills+agents+templates into <app>/.claude (live stubs + vendored reused; --migrate to update existing repos)
skills/                      the 14 stage/ops skills (init-ai, plan-*, dev-*, dev-schedule, launch-*)
agents/                      the 5 specialist agents the feature loop deploys
live-stubs/                  thin pointers to reused skills served LIVE by the BuildsByAlex MCP (no re-vendoring on change)
sync/gen-live-stubs.sh       regenerates live-stubs/ from the live-skill registry
templates/                   the docs/ files init-ai stamps into a target repo (STATUS, BUGS, SPEC, …)
docs/WORKFLOW.md             the full architecture and invariants
docs/LIVE-SYNC.md            how the live model works + the plan to host DBA's own skills in BBA
docs/SCHEDULING.md           how to run the loop unattended (ready-to-run recipes)
IMPLEMENT.md                 the original brief this implements
```

See **[docs/WORKFLOW.md](docs/WORKFLOW.md)** for the stage map, every skill and
agent, the existing skills it reuses, and the invariants that make autonomy safe.

## How it stays safe to automate

- **Human gates** between plan and dev (spec/guide/wireframes approval) and a
  manual staging deploy — agents never self-approve.
- **One safe step per autopilot run**, all state in the repo, so the loop is
  bounded, resumable, and reviewable (one commit per step).
- **Push straight to the working branch** — no per-step branches, no PR pile-up
  that slows iteration. Interactive runs use the current branch; a cron names the
  **working branch it builds off explicitly** (e.g. `staging`, not assumed
  `main`). Green suite is the gate.
- **Tests trace to the spec** (test-author and implementer run blind, in
  parallel); **validators judge but don't fix**; **green suite** at every stop.
- **Security & privacy first**, most of all in auth.

## Requirements

- Claude Code with the **BuildsByAlex MCP** connected (supplies Alex's encoded
  best-practice playbooks and stack conventions).
- A **write-capable Figma MCP** for the wireframing stage — the official remote
  server with **write-to-canvas** (`claude plugin install figma@claude-plugins-official`,
  then `/plugin` → OAuth). Read-only "design → code" servers can't create frames;
  write-to-canvas needs a Full seat (or a Dev seat writing into a draft file).
  `/plan-wireframes` stops and points you to setup if none is connected.
- The reused skills, provisioned in two tiers (see
  [live-stubs/README.md](live-stubs/README.md)):
  - **Live** — the 11 skills the **BuildsByAlex MCP brain** serves
    (`test-suite-developer`, `scout`, `issue-checker`, `fix-errors`,
    `staging-smoke-test`, `launch-readiness`, `prose-check`, `seo-audit`,
    `accessibility-critique`, `ios-audit`, `create-demo`) install as thin stubs
    that load the canonical body **live** from the brain. Improve a skill on the
    brain and every onboarded repo is current on its next run — no re-vendoring.
  - **Vendored** — `marketer-brand-generation`, `marketer-copywriting` (not on
    the brain yet) are copied from `~/.claude/skills`, so a committed checkout
    still carries them.

  Both tiers need the **BuildsByAlex MCP token** on the runner (live stubs to
  load their body; vendored skills already pull Alex's conventions from it) —
  `/dev-schedule` wires that in. See `docs/SCHEDULING.md`. To bring an
  already-onboarded repo onto the live model: `./install.sh <app> --migrate`.
