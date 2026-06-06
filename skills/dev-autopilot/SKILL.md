---
name: dev-autopilot
description: "The autonomous driver of the DevByAlex dev stage — the skill scheduled actions invoke to push an approved app toward launch-ready without a person in the loop. It reads docs/STATUS.md, confirms the approval gates are met, then advances exactly one step: scaffold if missing, auth if missing, otherwise the next not-done feature via feature-loop. It commits and pushes straight to the working branch (the branch you're on, or one passed explicitly for a cron) — no per-step branches, no PR pile-up — updates STATUS, and stops cleanly at a natural boundary (one unit of work per run) or whenever it hits a blocker, ambiguity, or a gate it must not cross — surfacing that for a human instead of guessing. Designed to be safe to run repeatedly on a cron. Use to make unattended forward progress, or run it manually to advance the build by one step."
argument-hint: "[path to the app repo — defaults to cwd] [--branch <name>]"
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
completion (including its validation loop), update `docs/STATUS.md`, commit, push
to the working branch, and stop. Don't try to build the whole app in one run —
let the schedule call it again. This keeps each run bounded, reviewable, and
resumable.

## Working branch (the iteration rule)

To keep iteration fast, the dev stage **commits and pushes straight to one
working branch — no per-step branches, no PRs to merge.** Resolve the working
branch once at the start and pass it down to every skill this run invokes:

- **`--branch <name>` passed** → check it out and use it. **A cron must set this
  explicitly** — an unattended run has no meaningful "current branch" intent, so
  name the branch in the schedule (e.g. `--branch staging`).
- **No `--branch`** → use the **current branch** (whatever `HEAD` is on). This is
  the interactive case: you're on `staging`, you call it, it pushes to `staging`.

Push with `git push origin HEAD:<working-branch>` after the suite is green. Pick
a dedicated iteration branch (e.g. `staging` or `autopilot`) rather than a
protected default; pushing to the working branch is the point — don't open PRs.

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
Run the chosen skill to completion, including its internal validation loops. Tell
it which working branch to use (resolved above). Let the underlying skill own its
own verification — don't second-guess its per-step checks.

### Step 5 — Record and stop
- Update `docs/STATUS.md`: the step's checkboxes/row, the `## Next action`
  line, and a log entry (branch, commit, what changed, time).
- Commit and **push to the working branch** (`git push origin HEAD:<branch>`)
  once the suite is green — no PR. If the project is tracked, append an agent-log
  entry and any decision records via the BuildsByAlex MCP.
- **Stop.** Report what was advanced, the branch + commit pushed, and what the
  next run will pick up.

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
- **Commit and push straight to the working branch — no per-step branches, no
  PRs.** Green suite is the gate, not a human merge. (A cron must name the branch
  explicitly; interactive runs use the current branch.)
- Prefer stopping with a clear question over building the wrong thing.

## Output

One step advanced (or a clearly-reported blocker), STATUS updated, a commit
pushed to the working branch, and a statement of what the next run will do. See
`docs/SCHEDULING.md` in the DevByAlex repo for how to run this on a schedule.
