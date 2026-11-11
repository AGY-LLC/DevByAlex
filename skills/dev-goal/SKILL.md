---
name: dev-goal
description: "Drives the DevByAlex dev stage to a goal. Use when the user says 'push to done', 'finish the dev stage', 'run the build to the goal', or names a concrete build goal. Reads docs/STATUS.md, confirms approval gates, then loops: drain BUGS, TWEAKS (dev-tweak), TODO (dev-todo), then the next build unit (scaffold, auth, or the next feature via feature-loop). Every unit runs in a subagent and ends in a green commit on the working branch, so runs resume safely. Stops at the launch gate; never self-approves a gate."
argument-hint: "[path to the app repo: defaults to cwd] [--branch <name>] [goal: defaults to dev-stage-complete]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# dev-goal: Push the build until the goal is met

## Goal

The goal you're handed is met, or every part of it still open is a named
blocker only a human can clear. No schedule and no step ration: one run is
expected to cover many units.

- **Default goal: dev stage complete.** Scaffold done, auth built and
  validated, every feature built through its loop, `docs/BUGS.md`,
  `docs/TWEAKS.md` and `docs/TODO.md` drained, suite green. That is the launch
  gate; this skill never crosses it and never runs `/launch-submit`.
- **A narrower goal can be passed** ("features 03 through 05", "drain all three
  lanes", "get auth validated"); the run stops when that goal is met.

Before starting: resolve the repo (arg or cwd), the goal and the working
branch (`--branch`, checked out; else the current branch; never a protected
default). Read `docs/STATUS.md` (missing: tell the user to run `/init-ai`) and
the Goal and Hard rules in `docs/DECISIONS.md`, and pass the working branch,
the Goal and the Hard rules into every unit's brief.
If the spec, guide or wireframe gate is unchecked, stop and report what awaits
Alex's approval.

## Done when

- Every unit inside the goal is done, or recorded as a blocker in STATUS
  `## Blockers / open questions` with the exact question for Alex.
- Each unit ended in its own green commit pushed to the working branch
  (`git push origin HEAD:<branch>`).
- STATUS is reconciled after every unit, from the unit's report alone
  (`../../knowledge/workflow/doc-maintenance.md`): its row or checkboxes, `## Next
  action`, and a log line (branch, commit, what changed, IDs cleared) ending
  `pulse: <staging URL> · <1-3 screenshot paths>` when customer-facing UI
  changed (reusing the unit's own `docs/visual-qa/` captures), else
  `pulse: n/a`. Resolved blockers are deleted and the log stays near 15 lines.
- The closing report gives the goal and whether it was reached, units done with
  commits, the lanes' end state, every blocker, and the next action
  (`/launch-observability` once the dev stage is complete; launch stays
  human-triggered).

## Decisions (and why)

- **The driver stays slim.** All build work runs in subagents that return the
  report contract below; between units the driver re-reads only STATUS and the
  lanes' `## Open` sections. It never reads diffs, test output or feature code.
  Why: a multi-feature run would drown its own context, and the repo (STATUS,
  lanes, ADRs) is the memory, so any run can resume where the last stopped.
- **One unit, one green commit.** Never batch units. Why: the run is safe to
  interrupt at any point.
- **Next unit, first match wins:** open bugs (worst first, through
  `fix-errors`, `issue-checker` to reproduce; fixed entries move to `## Fixed`,
  unreproducible ones to blockers), then `/dev-tweak`, then `/dev-todo`, then
  `/dev-scaffold`, then `/dev-auth`, then `/plan-guide adr-backfill` for any
  feature without an ADR, then the highest-priority not-done feature via the
  **feature-builder** agent running `/feature-loop <id>`. Why: broken code is no
  foundation, cosmetic work is cheap, planned changes land before new scope,
  and no feature is built without its decision record.
- **One feature at a time.** Why: its integration gate must see the repo as the
  next feature will.
- **Trust the unit's gates.** Don't second-guess its checks or re-open its
  diff. Why: the validators already ran strong.
- **Route models by the unit's hardest reasoning, not its label**
  (`../../knowledge/workflow/model-routing.md`): a mechanical drain is fast or
  capable tier; auth, payments, migrations, concurrency or an unclear root
  cause keep strong verification. Each subagent builds on earlier evidence
  instead of re-deriving it. Why: routing lowers cost, never the gates.
- **A blocker stops the unit, not the run.** Continue with units that don't
  depend on it; end only when the goal is met or nothing unblocked remains.

**Report contract** (all the driver keeps): what changed in one paragraph, the
commit pushed, done or blocked, IDs cleared or filed
(BUG/TWK/TODO/CRIT/FIND), and any blocker as the exact question for a human.
No diffs, logs or file dumps.

## When a unit blocks

- A card is ambiguous about *what* to build.
- The work would contradict an `active` ADR entry (cite it).
- The same finding survives two fix attempts.
- It needs an external account, a manual deploy, or a decision only Alex can
  make, or tests can't go green for a non-code reason.
- It needs a secret passworder can't self-serve
  (`../../knowledge/stack/secrets-passworder.md`): `generated` secrets are
  minted, never a blocker; a `provided` one is requested at once and blocks
  only the units that need it until Alex fills it (poll `list_secrets`).
  Without passworder, any needed secret is a blocker.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply. For the driver in particular:

- Never cross the launch gate or self-approve any gate.
- Never silently close a bug: it leaves `## Open` only verified green or punted
  to a blocker.
- A bug fix that would break an `active` ADR decision is a blocker, not a fix.
- Never stop with STATUS inaccurate or the suite red without recording why.
- Prefer stopping with a clear question over building the wrong thing.
