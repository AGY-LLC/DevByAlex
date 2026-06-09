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
                         │   (+legal+SEO)   feature cards   wireframes/README · copy prose-checked     │
                         │   └► /marketer-brand-generation → BRAND.md (if public-facing, before guide)  │
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
                         │   ▲ each run first DRAINS docs/BUGS.md (human-logged bugs) before building │
                         └───────────────────────────────┬───────────────────────────────────────────┘
                                  all features done  AND  docs/BUGS.md has no open bugs
                                                          │
                         ┌──────────────────────────── LAUNCH READINESS ────────────────────────────┐
                         │  (manual staging deploy) ─► /launch-acceptance ─► /launch-verify ─►         │
                         │   ACCEPTANCE_TESTS.md   (write the test)   (computer-use RUN + fix loop:     │
                         │   ─► /launch-compliance ─► + /staging-smoke-test + /launch-readiness         │
                         │   legal·a11y·SEO·prose   Chrome DevTools MCP · shadcn MCP · design skills)   │
                         │   ⮡ Legal & Accessibility = HARD gates (block ship)                          │
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
| `launch-verify` | launch | RUNS that acceptance test against staging with a computer-use browser (Chrome DevTools MCP), evaluates the live UI against a front-end design floor (Vercel `web-interface-guidelines` + `frontend-design` skills), and drives a test→fix→re-test loop — functional breakages to `docs/BUGS.md`, design polish through `fix-errors` with `shadcn` MCP components. |
| `launch-compliance` | launch | Legal (ToS / privacy policy / cookie consent), accessibility (WCAG 2.2 AA), SEO, and prose scans; drives the two hard launch gates + a fix queue. Reuses `launch-readiness`, `accessibility-critique`, `seo-audit`, `prose-check`. |

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
- `launch-readiness` — codebase go/no-go audit at launch (incl. legal/policy).
- `prose-check` — strips AI tells from copy (plan wireframes + launch prose pass).
- `seo-audit` — code-level SEO audit at launch (needs `docs/BRAND.md`).
- `accessibility-critique` — WCAG 2.2 AA audit at launch → `A11Y-xxx` fix queue.
- `web-interface-guidelines` — Vercel's web interface guidelines; the design floor
  `launch-verify` judges the live UI against.
- `frontend-design` — front-end design critique `launch-verify` runs over the
  rendered screens (paired with the guidelines + the `shadcn` MCP on the fix side).
- `marketer-brand-generation` — writes `docs/BRAND.md` in the plan stage (seeds
  SEO + voice; required by `seo-audit`).
- `marketer-copywriting` — on-brand copy when wireframe/launch prose needs more
  than a cleanup pass.
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

## The bug log: `docs/BUGS.md`

The human-written counterpart to STATUS. You drop bugs you hit into its `## Open`
section; `dev-autopilot` drains it **before any build step** — fixing every open
bug through its verify loop, moving each to `## Fixed`, and stopping the run there
(a bug-fix run does nothing else). Open bugs are also a **soft launch gate**: the
autopilot won't enter `/launch-acceptance` while any remain. This is the one place
the "one step per run" rule bends — the whole log drains in a single run, because
known-broken code is never a base for new work.

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

- **Gates are human.** Agents never self-approve spec/guide/wireframes/deploy, or
  the legal-compliance / accessibility ship gates.
- **Tests trace to the spec.** Test-author and implementer run in parallel and
  blind, so tests verify behavior, not whatever the code happens to do.
- **Validators judge, they don't fix.** Separation keeps the gates honest; the
  orchestrator turns findings into failing tests + fixes.
- **One safe step per autopilot run.** Bounded, resumable, reviewable — except a
  bug-fix run, which drains all of `docs/BUGS.md` before any build step resumes.
- **Bugs before building.** Open bugs in `docs/BUGS.md` preempt scaffold/auth/
  feature work and block entry to the launch stage until fixed.
- **Green suite at every stop; push straight to the working branch.** Nothing
  marked done with red tests or open findings. To keep iteration fast the dev
  stage commits and pushes to one working branch — no per-step branches, no PR
  pile-up. Green suite is the gate, not a human merge. Interactive runs use the
  current branch; a cron names the branch explicitly. Use a dedicated iteration
  branch (e.g. `staging`/`autopilot`), not a protected default.
- **Security & privacy beat convenience**, most of all in auth.
- **Legal & accessibility are hard launch gates.** Terms of Service, a privacy
  policy accurate to real data flows, a web cookie-consent banner, and WCAG 2.2 AA
  conformance are designed for in the plan and verified by `/launch-compliance`
  before ship — no launch with either gate open.

See `docs/SCHEDULING.md` for running the dev stage unattended.
