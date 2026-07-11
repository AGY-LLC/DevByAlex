# DevByAlex

An autonomous, stage-gated workflow that takes an app from a one-line idea to
launch-ready — packaged as a Claude Code plugin (skills + specialist agents).

**Plan** it (spec → implementation guide → wireframes, human-approved), **build**
it (scaffold → auth → a per-feature build/validate loop that runs unattended on
a schedule), **verify** it for launch, then keep it improving **live** (production
errors and user feedback triaged back into the same build loop). State lives in
each target repo's
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
/plan-spec        # interview → docs/SPEC.md — drop screenshots of apps you like
                  #   into docs/design/references/; a picture beats adjectives
/plan-guide       # → docs/IMPLEMENTATION_GUIDE.md + docs/features/*
/plan-design      # → docs/DESIGN.md — pick the named style (PRIMARY × SECONDARY) + web-search real references of it
/plan-wireframes  # → Figma frames (needs a write-capable Figma MCP), drawn to that style
#    …then YOU approve the spec, guide, and wireframes in docs/STATUS.md

# 3. Build it (autonomous once gates are approved):
/dev-scaffold     # one-time baseline
/dev-auth         # authentication first
/dev-autopilot .  # advance the build one safe step (run repeatedly / on a schedule)
#    Hit a bug? Jot it in docs/BUGS.md — each autopilot run drains the bug log
#    (fixing + verifying every open bug) BEFORE it touches any feature work.
#    Small cosmetic change (copy, spacing, a color)? Jot it in docs/TWEAKS.md —
#    the light lane (/dev-tweak) drains it right after bugs, without paying the
#    full feature loop. Every UI-changing run leaves a visual pulse in STATUS
#    (staging URL + screenshots), so you can judge unattended runs at a glance.

# 4. Launch readiness (staging deploys via Pipeline by Alex on push to staging):
/launch-observability  # error monitoring + consent-gated analytics + uptime, proven on staging
/launch-acceptance     # Playwright (web) + Maestro (iOS/Android) acceptance suites
/launch-visual-qa      # boot iOS + Android, screenshot every screen, critique → fix
/launch-compliance     # legal / a11y / SEO / prose gates
/launch-store-assets   # App Store + Play icon, screenshots, listing copy
/launch-submit         # YOU run this — build + ship to TestFlight + Play internal

# 5. Live (post-launch — the loop keeps running):
#    Paste user feedback / error reports into docs/FEEDBACK.md, then:
/live-triage           # routes each item → BUGS.md [prod] / TWEAKS.md / a question
                       #   for you — and the autopilot drains those as usual
```

To run the dev stage unattended, use **`/dev-schedule`** — it preflights, picks a
tier, and takes the explicit working branch (e.g. `staging`, never assumed
`main`). The committed `.claude/` is fully self-contained, so a runner needs no
MCP token or network brain. See **[docs/SCHEDULING.md](docs/SCHEDULING.md)** for
the underlying recipes.

## What's in here

```
.claude-plugin/plugin.json   plugin manifest
install.sh                   provision skills+agents+templates+knowledge into <app>/.claude; --update / --update-all re-vendor an onboarded app to the latest (version-stamped)
skills/                      all 34 skills — the workflow stages (init-ai, plan-*, dev-*, launch-*, live-*) and the supporting skills they call (scout, fix-errors, seo-audit, marketer-*, …) — full committed copies, no external brain
agents/                      the 6 specialist agents the feature loop deploys (incl. design-critic — vets screenshots of every design change before it counts as done)
knowledge/                   the vendored best-practice brain the skills read (practices/*.yaml, stack/*.md, checklists/*.md, design/design-styles.md — the 50-style vocabulary /plan-design picks from — and design/universal-design-rules.md — the 31 style-independent rules every screen holds)
templates/                   the docs/ files init-ai stamps into a target repo (STATUS, BUGS, TWEAKS, FEEDBACK, SPEC, DECISIONS, adr/, …)
docs/WORKFLOW.md             the full architecture and invariants
docs/LIVE-SYNC.md            the fully-vendored skill model (everything committed, nothing served live) + the --update pipeline
docs/SCHEDULING.md           how to run the loop unattended (ready-to-run recipes)
IMPLEMENT.md                 the original brief this implements
```

See **[docs/WORKFLOW.md](docs/WORKFLOW.md)** for the stage map, every skill and
agent, the existing skills it reuses, and the invariants that make autonomy safe.

## How it stays safe to automate

- **Human gates** between plan and dev (spec/guide/wireframes approval) and
  before the `staging → main` promotion to production — agents never self-approve.
  Staging itself deploys automatically via Pipeline by Alex on push to `staging`.
- **One safe step per autopilot run**, all state in the repo, so the loop is
  bounded, resumable, and reviewable (one commit per step).
- **Push straight to the working branch** — no per-step branches, no PR pile-up
  that slows iteration. Interactive runs use the current branch; a cron names the
  **working branch it builds off explicitly** (e.g. `staging`, not assumed
  `main`). Green suite is the gate.
- **Tests trace to the spec** (test-author and implementer run blind, in
  parallel); **validators judge but don't fix**; **green suite** at every stop.
- **ADRs govern change** — every feature carries a decision record in
  `docs/adr/` (what it has, what it deliberately doesn't, and why). Automated
  reviews can't flag a documented conscious choice, and breaking an active
  decision needs explicit human confirmation, never a silent divergence.
- **Security & privacy first**, most of all in auth.

## Requirements

- **Claude Code.** That's it for the dev loop — DevByAlex is fully self-contained.
  Every skill and the best-practice `knowledge/` are vendored into the app's
  committed `.claude/`, so there's no external brain, MCP, or token to connect for
  the build to run (locally or on a CI/cloud runner).
- A **write-capable Figma MCP** for the wireframing stage — the official remote
  server with **write-to-canvas** (`claude plugin install figma@claude-plugins-official`,
  then `/plugin` → OAuth). Read-only "design → code" servers can't create frames;
  write-to-canvas needs a Full seat (or a Dev seat writing into a draft file).
  `/plan-wireframes` stops and points you to setup if none is connected. This is
  the one optional MCP, and it's plan-time and human-run — not part of the
  unattended loop.
- The **supporting skills** the workflow calls (`test-suite-developer`, `scout`,
  `issue-checker`, `fix-errors`, `staging-smoke-test`, `launch-readiness`,
  `prose-check`, `seo-audit`, `accessibility-critique`, `ios-audit`,
  `create-demo`, `marketer-brand-generation`, `marketer-copywriting`) live in
  `skills/` alongside the stage skills and install into `<app>/.claude/skills/` the
  same way. A committed checkout carries them — nothing is loaded over the network.
  See [docs/LIVE-SYNC.md](docs/LIVE-SYNC.md) for the vendored model and the
  `--update` pipeline.
- For a **GitHub-Actions** runner, the only secret needed is `ANTHROPIC_API_KEY`
  (authenticates Claude Code itself; not project-specific). `/dev-schedule` covers
  it. See `docs/SCHEDULING.md`.
