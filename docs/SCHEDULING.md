# Scheduling the autonomous dev loop

This is the answer to "what's the best way to implement the scheduled actions so
the app is constantly improving and working toward launch-ready." Everything
here is **ready to run** — but nothing is scheduled until you choose to flip it
on.

## The idea in one paragraph

The dev stage is already designed to be driven by a schedule: `dev-autopilot`
does **one safe step per run**, keeps all state in the repo (`docs/STATUS.md`),
refuses to cross an approval gate, and stops at any blocker. So "scheduling" is
just calling `/dev-autopilot <repo>` on a cadence. Because each run is bounded,
idempotent, and resumable, you can run it ten times or a hundred times and it
simply walks the build forward one reviewable step at a time, then halts when it
reaches the launch stage (which is manual). The schedule is **stateless**; the
repo is the memory.

## Why this design (and not "build the whole app in a loop")

A naive "keep building until done" loop drifts, burns tokens, and produces giant
unreviewable diffs. The DevByAlex loop is safe to automate because of four
properties baked into `dev-autopilot`:

1. **One unit of work per run** — scaffold, or auth, or one feature (with its
   full validate loop). Bounded blast radius; each run is a reviewable commit.
2. **Durable state in the repo** — `docs/STATUS.md` is read at the start and
   written at the end of every run, so progress survives across runs and across
   machines. No external state to manage.
3. **Hard gates** — it will not enter the dev stage until the spec, guide, and
   wireframes are approved, and never self-approves. Plan and launch stay human.
4. **Stop-on-blocker** — ambiguity, a finding that won't fix, a needed secret or
   decision → it writes the blocker to STATUS and stops instead of guessing.

That's what makes "constantly improving" safe rather than reckless.

## Recommended setup (tiered)

### Tier 1 — Hosted remote routine  ⭐ best for hands-off progress

A **claude.ai remote routine** runs `/dev-autopilot` in the cloud on a cron —
durable, survives your machine being off, true unattended. This is what the
`/schedule` skill manages.

Run this when you're ready (it does **not** run yet):

```
/schedule create a routine that runs "/dev-autopilot /home/alex/dev/Startups/<app>"
          every 3 hours on weekdays, and notifies me with a summary + branch each run
```

Equivalent raw call (the `/schedule` skill wraps this `RemoteTrigger` create):

```jsonc
// RemoteTrigger action:"create"
{
  "name": "devbyalex-autopilot:<app>",
  "schedule": "17 */3 * * 1-5",          // off-minute on purpose; weekdays, every 3h
  "prompt": "cd /home/alex/dev/Startups/<app> && /dev-autopilot . — advance one step, commit on a branch, open a PR with the STATUS diff, and reply with a one-paragraph summary + any blockers.",
  "repo": "AGY-LLC/<app>"
}
```

Pair it with: **one PR per run** so you review/merge each step, and a
notification so you see blockers immediately.

### Tier 2 — Local durable cron (machine on, Claude session alive)

`CronCreate` schedules within a running Claude Code session on your machine.
Use `durable: true` so it persists to `.claude/scheduled_tasks.json` across
restarts. Note: fires only while the REPL is idle, and **recurring jobs
auto-expire after 7 days** (re-create weekly).

```jsonc
// CronCreate
{
  "cron": "23 */4 * * *",                 // every 4h, off-minute
  "recurring": true,
  "durable": true,
  "prompt": "/dev-autopilot /home/alex/dev/Startups/<app> — one step, commit on a branch, summarize + surface blockers."
}
```

### Tier 3 — In-session grind (watch it work now)

`/loop` runs a command on an interval in the current session — good for an
active push while you're at the desk:

```
/loop 30m /dev-autopilot /home/alex/dev/Startups/<app>
```

Omit the interval to let it self-pace between steps.

### Tier 4 — CI-native (the loop lives in the repo)

If you'd rather the loop live in the app's own CI and open PRs, run Claude Code
headless on a schedule. Drop `.github/workflows/devbyalex-autopilot.yml` into the
target repo:

```yaml
name: DevByAlex Autopilot
on:
  schedule:
    - cron: "19 */6 * * 1-5"   # weekdays, every 6h, off-minute (UTC in Actions)
  workflow_dispatch: {}         # manual "run now" button
jobs:
  autopilot:
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write }
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Run one autopilot step
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx -y @anthropic-ai/claude-code -p \
            "/dev-autopilot . — advance exactly one step, commit on a feature branch, and stop." \
            --permission-mode acceptEdits
      - name: Open a PR for this step
        run: gh pr create --fill --base main --head "$(git rev-parse --abbrev-ref HEAD)" || true
        env: { GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
```

(Requires the DevByAlex skills to be available to the headless run — install them
into the runner via the repo's `.claude/` or a plugin install step.)

## Cadence & cost guidance

- **During active dev:** every 3–6 hours on weekdays is plenty — each run is a
  meaningful, reviewable step, not a poll. Don't go sub-hourly; there's nothing
  to gain and it just stacks PRs faster than you can review.
- **Approaching launch:** drop to once or twice a day; most remaining work is
  human (staging deploy, approvals, acceptance runs).
- **Always pair with review.** The point of one-step-per-run + PR-per-step is
  that you stay the merge gate. Autonomy moves the work; you keep the judgment.
- **It self-limits.** When STATUS shows all features done, autopilot stops at the
  launch stage. The loop ends on its own — you don't have to babysit a kill
  switch.

## Turning it on (checklist)

1. `/init-ai <app>` — bootstrap STATUS.
2. Plan stage done and **all three gates approved** (autopilot won't move
   otherwise).
3. Pick a tier above and create the schedule.
4. Review/merge the PR each run produces; clear any blocker it logs in STATUS.
5. When STATUS reaches the launch stage, deploy staging (manual) and run
   `/launch-acceptance`.
