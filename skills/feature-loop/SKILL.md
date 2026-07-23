---
name: feature-loop
description: "The DevByAlex per-feature build engine. It takes one feature from its card to done by running the four-step loop the workflow defines: (1) write tests and implement the feature IN PARALLEL via two separate subagents (test-author works from the spec, feature-implementer writes the code; keeping them apart means tests aren't written just to match the implementation); (2) a feature-validator agent runs the tests and reviews the feature's code for quality/security/logic/best-practices, looping back to write a failing test + fix on any issue; (3) an integration-validator agent runs the full suite and reviews the whole codebase, looping back the same way; (4) confirm the finished feature aligns with the implementation guide and wireframes. For any customer-facing UI, capture screenshots of the running screens and have the design-critic agent vet them (looping on its findings), and for any feature with a user-facing flow, run its golden-path E2E flow green against the running app (Playwright web / Maestro native, the e2e gate) before the feature may be marked done. Then update docs/STATUS.md. Use to build one specific feature, or as the unit of work dev-goal dispatches per feature."
argument-hint: "[feature id or slug from docs/features/: e.g. 03-billing]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# feature-loop: Build one feature to done

The orchestrator for a single feature. It owns that feature end-to-end and
deploys specialist subagents for each step. This is the "agent assigned to the
feature that deploys the subagent steps" from the workflow spec; `dev-goal`
dispatches it once per feature.

> **Gate + order check.** Requires approval gates met, **Scaffold** and
> **Authentication** done. If not, route to the right earlier stage.

## How it runs

Each step runs in its **own subagent** via the Agent tool, so the orchestrator's
context stays clean and the roles stay independent. Brief every subagent to pick
up cold: give it the target repo, paste the relevant feature card and acceptance
criteria, and tell it exactly what to return. The named agent types live in this
plugin's `agents/` dir; if they aren't registered, fall back to
`subagent_type: general-purpose` and tell the subagent which skill to invoke.

**Route models by reasoning difficulty, not importance**
(`../../knowledge/workflow/model-routing.md`): each agent carries its tier in
frontmatter, fast discovery feeds capable implementation, and the strong tier
is spent on verification, not on re-searching the repo. Every brief that
follows discovery includes the evidence package and the line "don't repeat
completed searches unless the evidence appears incorrect or insufficient."

The agents, their tiers, and the skills they lean on:

| Step | Agent | Tier | Leans on |
|------|-------|------|----------|
| 0 discovery (existing code) | `explorer` | 1 fast | Grep/Glob/Bash: evidence package |
| 1a tests | `test-author` | 2 capable | `test-suite-developer` |
| 1b code | `feature-implementer` | 2 capable | the feature card + guide + evidence package |
| 2 feature validation | `feature-validator` | 3 strong | `scout` (feature-scoped), `issue-checker`, `fix-errors` |
| 3 integration validation | `integration-validator` | 3 strong | `scout` (whole repo), `fix-errors` |
| 4 design vetting (UI features) | `design-critic` | 2 capable | screenshots vs. `docs/DESIGN.md` + wireframes + universal rules |
| 4 E2E gate (user-facing flows) | `explorer` (runs the flows) | 1 fast | `../../knowledge/workflow/e2e-gate.md` |

## Workflow

### Step 0: Load the feature
Read the feature card `docs/features/<id>.md`, its acceptance criteria, **its
ADR `docs/adr/<id>.md`** (plus `docs/adr/scaffold.md` / `docs/adr/auth.md` if
the feature touches those seams), the relevant section of
`docs/IMPLEMENTATION_GUIDE.md`, the wireframe screens for this feature, and
`docs/STATUS.md`. Build on the **working branch**: the branch you're on, or
the one `dev-goal` passed down; **don't create a per-feature branch.**
Mark the feature row **in-progress** in STATUS.

**The ADR is a gate on the work itself.** If the feature has no ADR, stop and
route to `/plan-guide adr-backfill`: never build a feature with no decision
record. If anything this loop is about to do would contradict an `active`
decision or omission in the ADR, **stop and surface the conflict** (cite the
entry, explain what the change needs and why): breaking an architecture
decision is Alex's call, never the loop's. On explicit confirmation, record it
before building: mark the old entry superseded, add the new decision with its
why. Pass the ADR to every subagent brief alongside the card so none of them
re-litigates a settled decision.

First decide whether this feature is **greenfield** (no real implementation yet)
or **existing** (already built: common when `init-ai` integrated an existing
repo and marked the row impl-present-but-unvalidated). The check: does the
feature's code already exist and roughly work?

**Discovery is Tier 1 work.** When the feature touches existing code (the
existing path, or a greenfield feature that integrates with built seams),
spawn the **`explorer`** agent first to collect the evidence package: the
relevant files, existing patterns, current tests, and observed behavior, with
exact references. Paste that package into every subsequent brief so the
implementer and validators start from findings instead of re-running
repository-wide discovery. A purely greenfield feature on an empty seam can
skip this: there is nothing to discover.

**Greenfield: build:** Spawn **two separate subagents in the same message** so
they run concurrently and independently:
- **`test-author`**: writes tests purely from the feature card's acceptance
  criteria and behaviors (success paths, failure paths, edge cases, security
  boundaries). It must **not** read or shape itself around the implementation,
  tests come from the spec, not the code. If the feature has a user-facing
  flow, this includes its **golden-path E2E flow**
  (`../../knowledge/workflow/e2e-gate.md`): a Playwright spec under the repo's
  `e2e/acceptance/` dir for web, a Maestro flow under `.maestro/acceptance/`
  for native, env-parameterized so the same flow later runs against staging.
- **`feature-implementer`**: implements the feature from the card + guide,
  following the project's conventions and Alex's stack rules (TS strict, Zod
  boundaries, thin handlers + services, ORM with reviewed migrations).

Keeping them apart is the point: it stops tests from being written just to pass
whatever code happens to exist. Wait for both, then run the suite once to see
where they meet (some failures are expected and good: they reveal real gaps).

**Existing: harden, don't rebuild:** the code is already there, so do **not**
re-implement it. Spawn `test-author` only, to **backfill tests from the card's
acceptance criteria** (still blind to the implementation, so the tests certify
the spec's behavior rather than rubber-stamping the current code), including
the golden-path E2E flow if the acceptance suite doesn't cover this feature
yet. Run them: any
failure is a real gap between what's built and what the spec requires: those
feed the validation loop below as fixes, not rewrites. Reserve a fresh
implementation for a screen/behavior the card requires that genuinely doesn't
exist yet.

### Step 2: Feature validation
Spawn the **`feature-validator`** agent. It:
- runs the tests, and
- inspects the **feature-related code** for quality, security, logic issues,
  and best practices (via `scout` scoped to this feature, plus `issue-checker`
  on any claim).

If it passes, go to Step 3. **If it fails**, for each confirmed issue: write a
test that captures the issue, then fix the code to resolve it (use `fix-errors`
to drive the queue to zero), and re-run Step 2. Loop until clean.

### Step 3: Integration validation
Spawn the **`integration-validator`** agent. It:
- runs the **entire** test suite, and
- inspects the **whole codebase** for quality, security, logic issues, and best
  practices introduced by integrating this feature (via `scout` over the repo).

If it passes, go to Step 4. **If it fails**, same remedy: write a test that
captures the issue, fix the code (`fix-errors` to zero), and re-run Step 3.
Loop until clean. (If an integration fix reopens the feature, re-run Step 2.)

### Step 4: Align and update status
With the feature fully built and both validations clean:
- Confirm it **aligns with `docs/IMPLEMENTATION_GUIDE.md` and the wireframes**
  for this feature: behavior, screens, and states all match. If something
  drifted, fix it (or, if the drift is intentional and better, note it and flag
  the guide/wireframe for Alex to update: don't silently diverge).
- **Screenshot + critic gate (any feature with customer-facing UI): required.**
  Run the app and capture screenshots of the feature's screens in their key
  states (populated, empty, loading, error; light + dark where supported),
  web via Playwright, native via the simulator/Maestro capture flow from
  `/launch-visual-qa`: saved under `docs/visual-qa/<run-date>/`. Spawn the
  **`design-critic`** agent with the screenshot paths, `docs/DESIGN.md` (style
  choice + tokens + real-world references), the feature's wireframes, and the
  universal design rules (`knowledge/design/universal-design-rules.md`). Route
  its `CRIT-xxx` findings to `fix-errors`, re-capture, and re-submit: **the
  feature's design work is not done until the critic passes.** A feature with
  no customer-facing UI records `design vetting: n/a` instead; never silently
  skip the gate.
- **E2E gate (any feature with a user-facing flow): required**
  (`../../knowledge/workflow/e2e-gate.md`). Against the same running app the
  screenshot capture uses, run the feature's golden-path flow(s) green: web
  via the Playwright spec in `e2e/acceptance/`, native via the Maestro flow
  in `.maestro/acceptance/`, both written by `test-author` in Step 1 and
  targeted at the local build via env vars. A red flow is a loop-back like
  any failed validation (capture, fix via `fix-errors`, re-run). Record the
  result in the features table's `E2E` column; a feature with no user-facing
  flow records `e2e: n/a` instead; never silently skip the gate. These flows
  are the launch acceptance suite accreting one feature at a time:
  `/launch-acceptance` reconciles and backfills, it no longer authors from
  scratch.
- **Bring the ADR current.** Record any material decision the build made that
  the plan didn't (an approach chosen over a real alternative, a capability
  consciously deferred → a new `O`-entry), and any confirmed supersessions from
  Step 0. The ADR must leave this loop describing the feature as it now stands,
  it's what the next change and the next automated review are checked against.
- **Leave no orphans.** Sweep for what this feature's work superseded or left
  dangling: scratch/debug scripts, temp files, dead code and unused
  imports/exports, components/assets/styles nothing references anymore, stale
  fixtures, `.bak`/`.old` copies, superseded doc fragments. Remove them in this
  run: cleanliness is part of done. Two carve-outs: anything **explicitly
  recorded as kept** (an ADR entry or `docs/DECISIONS.md` line) is not an
  orphan and stays; and an orphan that is **substantial work** (a part-built
  module, a whole screen, real content) is never silently deleted: punt it to
  STATUS › `## Blockers / open questions` as a keep-or-remove question for
  Alex, and record his "keep" so the next sweep doesn't re-flag it.
- Mark every step for this feature ✅ and the row **done** in
  `docs/STATUS.md`; add a log line (branch, commit, what shipped). The STATUS
  write is a **reconcile pass** (`knowledge/workflow/doc-maintenance.md`):
  also delete blockers this feature resolved and keep the log inside its
  rotation cap: never a bare append above stale state.
- Commit and **push to the working branch** (`git push origin HEAD:<branch>`),
  no PR. Leave the suite green before pushing.
- Set `## Next action` to the next not-done feature (or `/launch-observability`,
  the first launch step, if this was the last).

## Rules

- **Step 1 is genuinely parallel and the two roles are blind to each other.**
  Tests trace to the spec; never weaken a test to make code pass.
- A failing validation is a loop-back, not a stop: capture it as a test, fix,
  re-validate. Don't mark done with red tests or open findings.
- **UI isn't done until it's been seen.** A feature with customer-facing
  screens requires the screenshot + `design-critic` pass in Step 4; the builder
  never vets its own screenshots, and a failed critique loops back like any
  failed validation.
- **A flow isn't done until it's been walked.** A feature with a user-facing
  flow requires its golden-path E2E flow green against the running app in
  Step 4 (`../../knowledge/workflow/e2e-gate.md`); `e2e: n/a` is recorded
  explicitly for features with none. The gate rides the feature lane only:
  tweaks are exempt by qualification, and light-lane changes just keep
  existing flows green.
- **The ADR governs.** Never contradict an `active` ADR entry without explicit
  human confirmation + a recorded supersession; never mark done with the ADR
  stale. A validator finding that just re-litigates a documented deliberate
  decision is rejected with a citation, not fixed (security/legal/a11y
  excepted: those go to Alex, as does any `ADR-challenge`: concrete evidence
  a decision is causing real harm gets surfaced, never silently fixed or
  silently dropped).
- **Leave no orphans.** A feature isn't done while its work's leftovers
  linger. Trivial orphans are removed in the same run; substantial orphaned
  work goes to Alex as a keep-or-remove question: never silently deleted,
  never silently kept.
- Don't expand scope beyond the feature card; surface new ideas as proposals.
- Keep STATUS the live source of truth: update it as you move through steps.
- **Existing code is hardened, not rebuilt.** On a feature that's already built
  (or partially built), resume: backfill spec-traced tests, validate, and fix,
  don't re-implement working behavior or restart from scratch.

## Output

One feature built, tested, validated at the feature and integration level,
aligned to guide + wireframes, with STATUS updated and the next feature queued.
