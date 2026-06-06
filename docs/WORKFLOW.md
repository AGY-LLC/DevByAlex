# DevByAlex — the workflow

An autonomous, stage-gated pipeline that takes an app from a one-line idea to
launch-ready. Three macro stages — **plan**, **dev**, **launch** — with human
approval gates between plan and dev, and a manual staging deploy before launch.
`init-ai` brings any repo (blank or existing) under the workflow; `docs/STATUS.md`
is the live control file every skill reads and writes.

## Map of the stages

```
                         ┌──────────────────────────── PLAN (human-gated) ───────────────────────────┐
  /init-ai  ──────────►  │  /plan-spec ──► /plan-guide ──► /plan-wireframes                            │
  (bootstrap STATUS)     │   SPEC.md        GUIDE.md +      Figma frames +                             │
                         │                  feature cards   wireframes/README                          │
                         └───────────────────────────────┬───────────────────────────────────────────┘
                                      Alex approves spec + guide + wireframes  (3 gates)
                                                          │
                         ┌────────────────────────────── DEV (autonomous) ──────────────────────────┐
                         │  /dev-scaffold ──► /dev-auth ──►  ┌──── /feature-loop  (per feature) ───┐ │
                         │   (once)            (security      │ 1. test-author ∥ feature-implementer│ │
                         │                      first)        │ 2. feature-validator   (loop on ✗)  │ │
                         │                                    │ 3. integration-validator (loop on ✗)│ │
                         │   driven unattended by             │ 4. align to guide+wireframes, STATUS│ │
                         │   /dev-autopilot (1 step/run) ◄────┴─────────────────────────────────────┘ │
                         └───────────────────────────────┬───────────────────────────────────────────┘
                                          all features done
                                                          │
                         ┌──────────────────────────── LAUNCH READINESS ────────────────────────────┐
                         │  (manual staging deploy)  ──►  /launch-acceptance  ──►  /staging-smoke-test │
                         │                                 ACCEPTANCE_TESTS.md      + /launch-readiness │
                         └──────────────────────────────────────────────────────────────────────────┘
```

## The pieces this plugin ships

### Skills (the stages)

| Skill | Stage | Does |
|-------|-------|------|
| `init-ai` | entry | Bootstraps/integrates the workflow into a repo; reconciles STATUS from what's already done. |
| `plan-spec` | plan | Interviews to a complete spec; `reverse` mode backfills from code. |
| `plan-guide` | plan | Expands the spec into a granular, ordered guide + feature cards. |
| `plan-wireframes` | plan | Drives a Figma MCP to wireframe each feature. |
| `dev-scaffold` | dev | One-time baseline: skeleton, tooling, tests, CI. |
| `dev-auth` | dev | Authentication first, security & privacy prioritized. |
| `feature-loop` | dev | The per-feature 4-step build/validate engine. |
| `dev-autopilot` | dev | Advances the build one safe step per run (what a schedule calls). |
| `launch-acceptance` | launch | Writes the computer-use-runnable staging acceptance test. |

### Agents (the specialists the feature loop deploys)

| Agent | Role |
|-------|------|
| `feature-builder` | Owns one feature; deploys the four steps. |
| `feature-implementer` | Writes the feature code (not its tests). |
| `test-author` | Writes tests from the spec, blind to the code. |
| `feature-validator` | Runs tests + reviews feature code; reports, doesn't fix. |
| `integration-validator` | Runs full suite + reviews whole repo; reports, doesn't fix. |

### Existing skills it reuses (not reinvented)

The workflow leans on skills already in `~/.claude/skills` rather than
duplicating them:

- `test-suite-developer` — the test-author's engine.
- `scout` — the validators' adversarial review (feature-scoped and whole-repo).
- `issue-checker` — confirms a finding is real before it's fixed.
- `fix-errors` — drives a findings queue to zero during the validation loops.
- `staging-smoke-test` — human-walkable config/integration check at launch.
- `launch-readiness` — codebase go/no-go audit at launch.
- `uiux-init` / `uiux-audit` — optional design-doc + UI alignment alongside
  wireframes.

And it pulls Alex's encoded conventions from the **BuildsByAlex MCP**:
`project-kickoff` (spec), `auth`, `data-modeling`, `payments`, `testing`,
`code-review`, `launch-readiness` best practices, plus his stack/profile rules.

## The control file: `docs/STATUS.md`

Every skill reads it first and writes it last. It holds: the macro stage, the
approval gates (Alex-only), the plan/dev/launch checkboxes, the **feature table**
(per-feature per-step status), the single `## Next action` line `dev-autopilot`
keys off, the blockers list, and a log. Keep it short; detail lives in feature
cards and the log.

## Invariants the whole system upholds

- **Gates are human.** Agents never self-approve spec/guide/wireframes/deploy.
- **Tests trace to the spec.** Test-author and implementer run in parallel and
  blind, so tests verify behavior, not whatever the code happens to do.
- **Validators judge, they don't fix.** Separation keeps the gates honest; the
  orchestrator turns findings into failing tests + fixes.
- **One safe step per autopilot run.** Bounded, resumable, reviewable.
- **Branches + green suite at every stop.** Nothing marked done with red tests
  or open findings; work lands on branches for human merge.
- **Security & privacy beat convenience**, most of all in auth.

See `docs/SCHEDULING.md` for running the dev stage unattended.
