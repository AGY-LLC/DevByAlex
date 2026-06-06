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
| `plan-wireframes` | plan | Wireframe each feature — GENERATE via Figma MCP (greenfield) or CAPTURE existing screens from code (existing app, no Figma). |
| `dev-scaffold` | dev | One-time baseline: skeleton, tooling, tests, CI. |
| `dev-auth` | dev | Authentication first, security & privacy prioritized. Validate-existing mode audits + hardens auth an existing repo already has. |
| `feature-loop` | dev | The per-feature 4-step build/validate engine. |
| `dev-autopilot` | dev | Advances the build one safe step per run (what a schedule calls). |
| `dev-schedule` | dev/ops | Sets up the unattended schedule that calls `dev-autopilot` off an explicitly named working branch; wires the cloud runner's BBA token as a secret. |
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

The workflow leans on skills that already exist rather than duplicating them —
and so any runner has them, `install.sh` **vendors these into each app's
`.claude/skills`** at provision time (sourced from `~/.claude/skills`):

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

## Integrating an existing (not-yet-launch-ready) repo

`init-ai` works on a half-built repo, not just a blank one — but "finish my app"
routes through the same gates, so the path is **backfill → validate → build the
rest**:

1. **Backfill the plan from code.** No spec/guide exist, so `init-ai` routes to
   `/plan-spec reverse` (infer the spec from code, tag inferences) → `/plan-guide`.
   The wireframe gate is satisfied by `/plan-wireframes capture` — an inventory of
   the screens already in the code, **no Figma needed** — since the UI exists.
2. **Alex approves the three gates.** Dev stays blocked until then; an existing
   codebase doesn't bypass approval.
3. **Validate before building.** `init-ai` does **not** check off existing work as
   done: auth that exists but was never security-validated stays unchecked
   (`/dev-auth validate` audits + hardens it), and existing features are recorded
   impl-present / validation-pending. So autopilot's **first phase is
   validate-and-harden** — backfill spec-traced tests, run the validators, fix —
   re-certifying what's there before adding anything new.
4. **Then build the rest** via the normal feature loop, pushing to the working
   branch (use a dedicated iteration branch on a repo with a real `main`).

The principle: code existing is not the same as code being correct, validated, or
aligned to an approved spec — none of which can be known from the code alone. The
integration path makes that gap explicit instead of marking a working-but-unproven
app "done."

## Invariants the whole system upholds

- **Gates are human.** Agents never self-approve spec/guide/wireframes/deploy.
- **Tests trace to the spec.** Test-author and implementer run in parallel and
  blind, so tests verify behavior, not whatever the code happens to do.
- **Validators judge, they don't fix.** Separation keeps the gates honest; the
  orchestrator turns findings into failing tests + fixes.
- **One safe step per autopilot run.** Bounded, resumable, reviewable.
- **Green suite at every stop; push straight to the working branch.** Nothing
  marked done with red tests or open findings. To keep iteration fast the dev
  stage commits and pushes to one working branch — no per-step branches, no PR
  pile-up. Green suite is the gate, not a human merge. Interactive runs use the
  current branch; a cron names the branch explicitly. Use a dedicated iteration
  branch (e.g. `staging`/`autopilot`), not a protected default.
- **Security & privacy beat convenience**, most of all in auth.

See `docs/SCHEDULING.md` for running the dev stage unattended.
