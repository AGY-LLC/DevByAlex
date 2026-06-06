---
name: dev-autopilot
description: "The autonomous driver of the DevByAlex dev stage — the skill scheduled actions invoke to push an approved app toward launch-ready without a person in the loop. It reads docs/STATUS.md, confirms the approval gates are met, then advances exactly one step: scaffold if missing, auth if missing, otherwise the next not-done feature via feature-loop. It commits on a branch, updates STATUS, and stops cleanly at a natural boundary (one unit of work per run) or whenever it hits a blocker, ambiguity, or a gate it must not cross — surfacing that for a human instead of guessing. Designed to be safe to run repeatedly on a cron. Use to make unattended forward progress, or run it manually to advance the build by one step."
argument-hint: "[path to the app repo — defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-autopilot — Advance the build one safe step

The unattended engine. Each run does one well-scoped unit of work, records it,
and stops — so it's safe to schedule on a cron and safe to interrupt. Run it
repeatedly (by hand or on a schedule) and the app marches toward launch-ready.

## Operating principle

**One run = one step.** Pick the single highest-priority not-done item, do it to
completion (including its validation loop), update `docs/STATUS.md`, commit, and
stop. Don't try to build the whole app in one run — let the schedule call it
again. This keeps each run bounded, reviewable, and resumable.

## Workflow

### Step 1 — Load state
Resolve the repo path (arg or cwd). Read `docs/STATUS.md` (and the guide +
feature cards as needed). If there's no STATUS file, stop and tell the user to
run `/init-ai` first.

### Step 2 — Check the gates (hard stop)
Confirm the **spec, implementation guide, and wireframes approval gates are
checked**. If any is unchecked, **stop** — the dev stage is blocked on Alex's
approval. Report exactly what's awaiting approval. Never self-approve a gate.

### Step 3 — Pick the next step
In priority order, choose the first that isn't done:
1. **Scaffold** not done → run `/dev-scaffold`.
2. **Authentication** not done → run `/dev-auth`.
3. A **feature** not done → pick the highest-priority not-done feature from the
   table (respect build order / dependencies) and run `/feature-loop <id>`.
4. **All features done** → set next action to `/launch-acceptance` and stop
   (launch stage begins; staging deploy is manual).

Honor dependencies: don't start a feature whose prerequisites aren't done.

### Step 4 — Do exactly that one step
Run the chosen skill to completion, including its internal validation loops. The
work happens on a branch (Alex's rule). Let the underlying skill own its own
verification — don't second-guess its per-step checks.

### Step 5 — Record and stop
- Update `docs/STATUS.md`: the step's checkboxes/row, the `## Next action`
  line, and a log entry (branch, commit, what changed, time).
- Commit the branch. If the project is tracked, append an agent-log entry and
  any decision records via the BuildsByAlex MCP.
- **Stop.** Report what was advanced and what the next run will pick up.

## Blocker handling (when to stop and ask)

Stop the run and surface the situation — do not guess — when:
- An approval gate is unmet (Step 2).
- A feature card / acceptance criteria is ambiguous about *what* to build.
- The same validation finding survives two fix attempts (hand to a human).
- A step needs a secret, external service, manual deploy, or a decision only
  Alex can make.
- Tests can't be made green for a reason that isn't a code bug (e.g.
  environment/config).

Write the blocker into `## Blockers / open questions` in STATUS so the next run
(and the human) see it, and stop.

## Rules

- **One step per run.** Bounded, resumable, reviewable.
- **Never cross a gate** or self-approve.
- Always leave STATUS accurate and the suite green before stopping; if you can't,
  record it as a blocker.
- Work on branches; don't merge to the default branch unless told.
- Prefer stopping with a clear question over building the wrong thing.

## Output

One step advanced (or a clearly-reported blocker), STATUS updated, a commit, and
a statement of what the next run will do. See `docs/SCHEDULING.md` in the
DevByAlex repo for how to run this on a schedule.
