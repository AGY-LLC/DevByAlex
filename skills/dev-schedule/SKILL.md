---
name: dev-schedule
description: "DevByAlex ops skill — set up (or tear down) the unattended schedule that drives /dev-autopilot so an app keeps progressing toward launch-ready on a cadence. Preflights the gates and the explicit working branch the build runs off of (e.g. staging, never assumed main — a cron has no current-branch intent) and provisioning, then picks a tier (cloud remote routine, local durable cron, or in-session loop) and creates the schedule. The whole workflow — native skills, reused library skills, and the best-practice knowledge/ — is vendored into the app's committed .claude by install.sh, so a runner needs no MCP token or network brain; a committed checkout is fully self-sufficient. Use when the user says 'schedule the autopilot', 'set up the scheduled task', 'run the build unattended', or 'create the cron/routine'."
argument-hint: "[app path] [--branch <name>] [tier: cloud | local | loop]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-schedule — Schedule the autonomous dev loop

Sets up the schedule that calls `/dev-autopilot` on a cadence so the dev stage
advances unattended — one bounded, reviewable step per run — until it reaches the
manual launch gate. This skill owns the DevByAlex-specific **preflight**; it
delegates the actual routine/cron creation to the host (`/schedule` for cloud,
`CronCreate` / `/loop` locally). The committed `.claude/` is fully self-contained,
so there is no secret or MCP dependency to wire onto the runner.

It **never schedules without the user's explicit go-ahead** — scheduling is an
outward, recurring action — and it **never crosses an approval gate**.

## When to activate

- The user says "schedule the autopilot," "set up the scheduled task," "run the
  build unattended," or "create the cron/routine."
- The plan stage is done, all three gates are approved, and the user wants the
  dev stage to progress on its own.

## Step 1 — Preflight (refuse to schedule if any check fails)

Read `docs/STATUS.md` and the repo, and confirm:

- **Gates approved.** Spec + guide + wireframes gates are checked. If not,
  **stop** — a schedule would only no-op against the gate. Route to the missing
  plan stage instead.
- **The explicit working branch.** Ask which branch the build runs off of and
  **do not assume `main`** — many of these apps build off `staging` (or a release
  branch). A cron has no "current branch" intent, so the schedule must name it
  explicitly and pass `--branch <name>`; `dev-autopilot` checks it out and
  **pushes each step straight to it — no per-step PRs.** Use a dedicated iteration
  branch (`staging`, `autopilot`, …), never a protected default. Detect the repo's
  default branch only as a *suggestion*; have the user confirm the branch
  explicitly — getting it wrong points the whole loop at the wrong branch.
- **Provisioned and committed.** `<app>/.claude/{skills,agents,templates,knowledge}`
  exist **and are committed**, so a remote checkout carries the whole workflow.
  Confirm the vendored reused skills are present (`scout`, `fix-errors`,
  `test-suite-developer`, `issue-checker`, `staging-smoke-test`,
  `launch-readiness`) and that `.claude/knowledge/practices/` is there — these are
  what make a fresh checkout self-sufficient. If any are missing, re-run the
  provisioner (`install.sh <app>`).
- **A connected repo** (cloud only): a GitHub remote the routine can run against.

## Step 2 — Pick a tier

See `docs/SCHEDULING.md` for the full rationale. Default by intent:

- **cloud** (Tier 1, ⭐ hands-off): a claude.ai remote routine via the built-in
  `/schedule`. Runs in the cloud on a cron even when your machine is off. Works
  off the committed `.claude/` — see the runner note in Step 3.
- **local** (Tier 2): a `CronCreate` durable cron in a running session on this
  machine. Auto-expires after 7 days; re-create weekly.
- **loop** (Tier 3): `/loop <interval> /dev-autopilot <app>` in the current
  session — good for an active push at the desk.

If the user is just trying it out, recommend **local** or **loop** first;
graduate to **cloud** once they want progress while the machine is off. Every
tier reads the same committed workflow, so none of them needs a token.

## Step 3 — Cloud only: confirm the runner has the committed workflow

There is **no external dependency to wire** — the whole workflow (native skills,
reused library skills, and the best-practice `knowledge/`) is vendored into the
committed `.claude/`, so a fresh cloud/CI checkout already carries everything the
run needs. Just confirm:

- `<app>/.claude/` (with `skills/`, `agents/`, `templates/`, `knowledge/`) is
  **committed** to the branch the routine checks out — not gitignored. A cloud
  runner only sees what's in the repo.
- **GitHub-Actions runner (Tier 4):** add `ANTHROPIC_API_KEY` as a **repo secret**
  and reference it from the workflow file. That key authenticates Claude Code
  itself — it is the only secret a CI run needs, and it is not project-specific.

## Step 4 — Create the schedule (only after explicit go-ahead)

Confirm the concrete plan with the user, then create it via the host:

- **cloud** — invoke the built-in `/schedule` to create a routine:
  - name: `devbyalex-autopilot:<app>`
  - schedule: an off-minute cron, weekdays, every 3–6h during active dev (drop to
    1–2×/day near launch). e.g. `17 */3 * * 1-5`.
  - prompt: `cd <app> && /dev-autopilot . --branch <branch> — do one bounded run
    (fix every open bug in docs/BUGS.md if any, else advance one build step),
    commit, push it straight to <branch> (no PR), and reply with a one-paragraph
    summary + the pushed commit + any blockers.` Let the skill decide the unit —
    don't hard-code "exactly one step," or a bug-fix run stops half-drained.
  - plus the connected repo, the named working branch, and a per-run notification.
- **local** — `CronCreate` with `durable: true`, an off-minute cron, and the same
  autopilot prompt (keep `--branch <branch>`).
- **loop** — `/loop <interval> /dev-autopilot <app> --branch <branch>` (omit the
  interval to self-pace; interactive runs default to your current branch).

Pair every tier with a per-run **notification** and the **one-commit-per-run**
discipline, so the user stays the judgment gate — skim the working branch's
history when you choose (or open one PR for the accumulated branch when promoting
it toward `main`); the loop doesn't stack a PR per step.

## Step 5 — Record and report

- Add a `docs/STATUS.md` log line noting a schedule was set up (tier, cadence,
  working branch).
- Report: the tier, cadence, **working branch**, the notify target, and how to
  pause/remove it (`/schedule` manage, `CronDelete`, or stop the loop). For a
  GitHub-Actions runner, note that `ANTHROPIC_API_KEY` lives in repo secrets (by
  reference, not value).

## Rules

- **Never schedule without explicit user go-ahead.** It's a recurring outward
  action.
- **Never cross a gate.** Only schedule once the three gates are approved; the
  loop runs `dev-autopilot`, which self-limits and stops at the launch gate.
- **Secrets never touch the repo.** A CI run's only secret is `ANTHROPIC_API_KEY`
  — it goes to the runner's secret store; never commit, log, or echo it.
- **Protected branches stay protected.** Name a dedicated working branch
  explicitly (`staging` / `autopilot` / release — never assumed `main`); the loop
  pushes straight to it, so it must not be a protected default.
- **One bounded run, one commit per run** on the working branch — no per-step PR
  stacking. A run is one build step, or a full drain of `docs/BUGS.md` when it has
  open bugs; either way it ends in a single green commit. Green suite is the gate;
  the human merges the branch when ready. Don't word the routine prompt to force
  "exactly one step" — it would cut a bug-drain run short.
- Don't create the schedule from `init-ai` — this skill is the dedicated place.

## Output

A live (or ready-to-confirm) schedule driving `/dev-autopilot` on the chosen
tier, off the self-contained committed `.claude/` (no token or MCP to wire), a
STATUS log line, and clear instructions to pause or remove it.
