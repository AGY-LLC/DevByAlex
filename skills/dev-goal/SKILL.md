---
name: dev-goal
description: "The driver of the DevByAlex dev stage. Give it a goal and it pushes the build until the goal is met, not one rationed step at a time. It reads docs/STATUS.md, confirms the approval gates, then loops: drain docs/BUGS.md, drain docs/TWEAKS.md (via dev-tweak), drain docs/TODO.md (via dev-todo), then advance the next build unit (scaffold if missing, auth if missing, else the next not-done feature via feature-loop), repeating until the goal is reached or only human-blocked work remains. The orchestrator stays slim: every unit of work runs in a subagent that returns a bounded report; the driver itself never reads diffs, test output, or feature code, so a multi-feature rollout never drowns the main context. The repo (STATUS, the lanes, the ADRs) is the memory, and every unit ends in a green commit pushed straight to the working branch, so the run is safe to interrupt and resume. It stops at the launch gate, surfaces blockers instead of guessing, and never self-approves a gate. Use when the user says 'push to done', 'finish the dev stage', 'run the build to the goal', or gives a concrete build goal to reach."
argument-hint: "[path to the app repo: defaults to cwd] [--branch <name>] [goal: defaults to dev-stage-complete]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-goal: Push the build until the goal is met

The engine of the dev stage. You hand it a goal; it keeps advancing the build,
unit by unit, until the goal is reached or a human is genuinely needed. There is
no schedule and no step ration: one run is expected to cover many units.

## The goal

- **Default goal: dev stage complete.** Scaffold done, auth built and validated,
  every feature built through its loop, `docs/BUGS.md` + `docs/TWEAKS.md` +
  `docs/TODO.md` all drained, suite green. That is the launch-gate boundary; this
  skill never crosses into the launch stage.
- **A narrower goal can be passed** ("features 03 through 05", "drain all three
  lanes", "get auth validated"). The run stops when *that* goal is met, even if
  more build work remains.
- The goal is the finish line; blockers are the brake. The run ends at whichever
  comes first.

## Operating principles

**The orchestrator stays slim.** The main agent NEVER does build work inline.
Every unit of work is dispatched to a subagent that works in its own context and
returns a bounded report. Between units the driver re-reads `docs/STATUS.md` and
the lanes' `## Open` sections: **the repo is the memory, not the conversation.**
The driver never reads diffs, test output, or feature code itself; if it catches
itself doing so, it is doing the subagent's job and burning the context a
multi-feature rollout needs. What the driver holds is only: the goal, the gate
state, the current unit, and the last report.

**Every unit ends in a green commit pushed to the working branch.** That makes
the run interruptible and resumable: kill it at any point and a later run picks
up from STATUS exactly where this one stopped. Never batch several units into
one commit.

**Bugs, then tweaks, then todos, before building.** Known-broken code is never a
foundation for new work, the cosmetic lane is cheap by definition, and planned
changes land before new scope. Each lane drains fully when it has open entries,
and open entries in any lane block the launch stage.

## Working branch (the iteration rule)

The dev stage **commits and pushes straight to one working branch: no per-unit
branches, no PRs.** Resolve it once at the start and pass it down to every
subagent and skill this run invokes:

- **`--branch <name>` passed** → check it out and use it.
- **No `--branch`** → use the **current branch** (whatever `HEAD` is on).

Push with `git push origin HEAD:<working-branch>` after each unit's suite is
green. Use a dedicated iteration branch (e.g. `staging`), never a protected
default.

## Workflow

### Step 1: Load state
Resolve the repo path (arg or cwd) and the goal (arg or default). Read
`docs/STATUS.md`. If there's no STATUS file, stop and tell the user to run
`/init-ai` first.

### Step 2: Check the gates (hard stop)
Confirm the **spec, implementation guide, and wireframes approval gates are
checked**. If any is unchecked, **stop**: the dev stage is blocked on Alex's
approval. Report exactly what's awaiting approval. Never self-approve a gate.

### Step 3: The loop
Repeat until the goal is met or only blocked work remains. Each pass:

1. **Re-read the state**: `docs/STATUS.md` plus the `## Open` sections of
   `docs/BUGS.md`, `docs/TWEAKS.md`, and `docs/TODO.md`. Nothing else.
2. **Pick the next unit**, first match wins:
   1. **Open bugs** → dispatch a subagent to drain `docs/BUGS.md`: work them
      worst-first (`blocker` → `high` → `medium` → `low`), fix each through
      `fix-errors` (or `issue-checker` first if it needs reproducing), check the
      feature's ADR before fixing (a documented deliberate decision is not a
      bug: punt it to blockers, never silently break it), move each fixed entry
      to `## Fixed` with a one-line summary, and punt anything unreproducible or
      ambiguous to `## Blockers / open questions` rather than silently closing it.
   2. **Open tweaks** → dispatch a subagent to run `/dev-tweak` (the cosmetic
      light lane; it qualifies, applies, and reclassifies anything heavier).
   3. **Open todos** → dispatch a subagent to run `/dev-todo` (the planned-change
      lane; it routes misfiled entries and applies the qualified ones through
      their proportional gate).
   4. **Scaffold not done** → subagent runs `/dev-scaffold`.
   5. **Auth not done** → subagent runs `/dev-auth`.
   6. **Any feature missing its ADR** (`docs/adr/<NN>-<slug>.md`) → subagent runs
      `/plan-guide adr-backfill`. Feature work stays blocked until every feature
      has its decision record.
   7. **A feature not done** → spawn the **feature-builder** agent to run
      `/feature-loop <id>` for the highest-priority not-done feature (respect
      build order and dependencies). One feature at a time: its integration
      validation must see the repo as the next feature will find it.
   8. **Nothing left inside the goal** → the goal is met; go to Step 4.
3. **Dispatch and wait.** Tell the subagent the working branch and require the
   report contract below. Let the unit own its internal validation loops; don't
   second-guess its checks, and don't re-open its diff to admire it.
4. **Record the unit.** From the report alone, update `docs/STATUS.md`: the
   step's checkboxes/row, the `## Next action` line, and a log entry (branch,
   commit, what changed, time; bug/tweak/todo IDs cleared for a drain unit).
   **Leave a visual pulse** when the unit changed customer-facing UI: end the
   log entry with `pulse: <staging URL> · <1-3 screenshot paths>`, reusing the
   screenshots the unit itself captured (the feature loop's design-critic gate,
   `/dev-tweak`, and `/dev-todo` all save under `docs/visual-qa/<run-date>/`);
   `pulse: n/a` when no UI changed. Confirm the unit's commit is pushed. Loop.

**The report contract** (what every subagent must return, and all the driver
keeps): what changed (one short paragraph), the commit hash pushed, the verdict
(done / blocked), IDs cleared or filed (BUG/TWK/TODO/CRIT/FIND), and any blocker
with the exact question a human must answer. No diffs, no logs, no file dumps.

### Step 4: Finish and report
Stop when the goal is met, or when everything remaining inside the goal is
blocked. Report: the goal and whether it was reached, the units completed (with
commits), the lanes' end state, every blocker recorded, and the next action
(`/launch-observability` when the dev stage is complete and all three lanes are
clear: launch itself stays human-triggered).

## Blocker handling (brake, not kill switch)

A unit stops and records a blocker in STATUS `## Blockers / open questions` when:
- An approval gate is unmet (that one ends the whole run).
- A feature card / acceptance criteria is ambiguous about *what* to build.
- The unit would contradict an `active` decision in `docs/adr/` (cite the entry;
  never silently supersede an ADR).
- The same validation finding survives two fix attempts.
- It needs a secret, an external service, a manual deploy, or a decision only
  Alex can make.
- Tests can't go green for a reason that isn't a code bug (environment/config).

**A blocker stops the unit, not necessarily the run.** Record it, then continue
with units that don't depend on the blocked one (a blocked feature doesn't stop
an independent feature; a blocked bug is punted and the drain continues). End
the run only when the goal is met or nothing unblocked remains, and say plainly
which parts of the goal are waiting on a human.

## Rules

- **The goal is the boundary.** Work until it's met; never cross it into the
  launch stage, and never run `/launch-submit` from here.
- **Slim orchestrator.** All build work happens in subagents; the driver holds
  reports, not diffs. The repo is the memory.
- **Bugs, then tweaks, then todos, before building.** Open entries in any of the
  three lanes also block the launch stage.
- **One unit = one green commit pushed** to the working branch: no per-unit
  branches, no PRs. Green suite is the gate, not a human merge.
- **Never silently close a bug.** A bug leaves `## Open` only when its fix is
  verified green, or it's punted to a STATUS blocker for the human.
- **Never cross a gate** or self-approve.
- **Leave no orphans.** Each unit removes what its work left unreferenced;
  substantial orphans are surfaced to Alex as keep-or-remove blockers, never
  silently deleted.
- Always leave STATUS accurate and the suite green before stopping; if you
  can't, record it as a blocker.
- Prefer stopping with a clear question over building the wrong thing.

## Output

The goal reached (or every remaining piece of it named as an explicit blocker),
STATUS accurate with a log entry (and visual pulse) per unit, one green commit
per unit pushed to the working branch, and a closing report of what was built,
what's blocked, and what comes next.
