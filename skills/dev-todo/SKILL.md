---
name: dev-todo
description: "Planned-change lane of the DevByAlex dev stage: drains docs/TODO.md. Use for 'adjust how X works', 'rework this flow', 'improve Y'; not for broken behavior (bug), cosmetic-only changes (tweak) or new scope (feature). Reroutes misfiled entries to BUGS or TWEAKS and surfaces feature-sized ones to Alex in STATUS blockers. Applies each entry with a failing test first where behavior changes, typecheck, lint and full suite green, and prose and design-critic passes where relevant. ADRs govern. Called by dev-goal after bugs and tweaks; also runnable by hand."
argument-hint: "[path to the app repo: defaults to cwd] [--branch <name>]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# dev-todo: Drain the planned-change lane

## Goal

`docs/TODO.md` has no open entries: every bounded, decided change to existing
behavior, structure or flows is applied and proven, or routed to the lane it
belongs in. `BUGS.md` holds what's broken, `TWEAKS.md` what's cosmetic, and
`TODO.md` what Alex decided to change without new scope; once an app is
stable, most iteration happens here.

`dev-goal` calls this after bugs and tweaks are clear; it also runs by hand
("drain the todos"). Work on the branch you're on or the one `dev-goal`
passed, never a per-entry branch. Read `docs/TODO.md`, `docs/STATUS.md` and
the ADRs of whatever each entry touches.

## Done when

- Every open entry was routed before any work: broken behavior to
  `docs/BUGS.md`; cosmetic-only (passes `/dev-tweak`'s qualification test) to
  `docs/TWEAKS.md`; feature-sized (a new capability, data model, API surface,
  substantial dependency, or anything needing a spec conversation) to Alex as
  a feature proposal in STATUS blockers; a conflict with an `active` ADR entry
  as a blocker citing it. Each moved entry notes where it went.
- Each qualified entry, in listed order and respecting dependencies:
  - a behavior change has a test for the new behavior that failed first and
    now passes; a change with no behavior change proves itself by the
    existing suite;
  - typecheck, lint and the full suite are green;
  - changed copy passed a prose pass, and anything visual passed
    `design-critic` on screenshots under `docs/visual-qa/<run-date>/`;
  - a reshaped user-facing flow covered by an acceptance flow
    (`knowledge/workflow/e2e-gate.md`) has its Playwright or Maestro flow
    updated and re-run green;
  - a material decision is recorded (that feature's `docs/adr/<id>.md`, or
    `docs/DECISIONS.md` when cross-cutting);
  - the entry is in `## Done` with branch, commit and date, not deleted.
- An entry that failed its gate twice is a STATUS blocker with what was
  tried.
- Nothing the batch superseded is left orphaned. STATUS has a log line naming
  the IDs drained, rerouted and punted, with a visual pulse if UI changed, and
  the work is pushed to the working branch with the suite green.

## Decisions (and why)

- **Route before work.** Why: qualification first is what keeps this lane
  from becoming a way around the feature loop and the plan gates.
- **Drain the whole open list in one run;** rerouted and punted entries count
  as drained. Why: a half-drained lane hides what is still pending.
- **Open todos block the launch stage**, like open bugs and tweaks. Why: a
  known planned change never ships unaddressed.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Nothing feature-sized is built from this lane.
- Suite green at every stop.
