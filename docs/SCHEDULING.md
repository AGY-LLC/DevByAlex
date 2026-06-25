# Scheduling the autonomous dev loop

This is the answer to "what's the best way to implement the scheduled actions so
the app is constantly improving and working toward launch-ready." Everything
here is **ready to run** — but nothing is scheduled until you choose to flip it
on. **`/dev-schedule` automates all of this** — it preflights, picks a tier,
takes the explicit working branch, and (for cloud) wires the runner's BuildsByAlex
MCP token in as a secret; read on for what it sets up under the hood.

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

A cron has no "current branch" intent, so **name the working branch explicitly**
(use a dedicated iteration branch like `staging` or `autopilot`, not a protected
default). The run commits and **pushes straight to that branch — no PR.**

```
/schedule create a routine that runs "/dev-autopilot /home/alex/dev/Startups/<app> --branch autopilot"
          every 3 hours on weekdays, and notifies me with a summary + the commit it pushed
```

Equivalent raw call (the `/schedule` skill wraps this `RemoteTrigger` create):

```jsonc
// RemoteTrigger action:"create"
{
  "name": "devbyalex-autopilot:<app>",
  "schedule": "17 */3 * * 1-5",          // off-minute on purpose; weekdays, every 3h
  "prompt": "cd /home/alex/dev/Startups/<app> && /dev-autopilot . --branch autopilot — do one bounded run (fix every open bug in docs/BUGS.md if any, else advance one build step), commit, push straight to the autopilot branch (no PR), and reply with a one-paragraph summary + the pushed commit + any blockers.",
  "repo": "AGY-LLC/<app>"
}
```

Pair it with: a notification so you see each pushed step + any blocker
immediately. Watch the branch (not a PR queue) to review progress; the point is
to not stack branches you have to merge while iterating fast.

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
  "prompt": "/dev-autopilot /home/alex/dev/Startups/<app> --branch autopilot — one bounded run (drain docs/BUGS.md if it has open bugs, else one build step), commit, push straight to the autopilot branch (no PR), summarize + surface blockers."
}
```

### Tier 3 — In-session grind (watch it work now)

`/loop` runs a command on an interval in the current session — good for an
active push while you're at the desk:

```
/loop 30m /dev-autopilot /home/alex/dev/Startups/<app>
```

Omit the interval to let it self-pace between steps. Interactive runs push to
your **current branch**; add `--branch <name>` to pin a different one.

### Tier 4 — CI-native (the loop lives in the repo)

If you'd rather the loop live in the app's own CI, run Claude Code headless on a
schedule. It checks out and pushes straight to a dedicated iteration branch (set
it explicitly — CI has no "current branch" intent), **no PR**. Drop
`.github/workflows/devbyalex-autopilot.yml` into the target repo:

```yaml
name: DevByAlex Autopilot
on:
  schedule:
    - cron: "19 */6 * * 1-5"   # weekdays, every 6h, off-minute (UTC in Actions)
  workflow_dispatch: {}         # manual "run now" button
env:
  WORKING_BRANCH: autopilot      # the dedicated iteration branch to push to
jobs:
  autopilot:
    runs-on: ubuntu-latest
    permissions: { contents: write }
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0, ref: "${{ env.WORKING_BRANCH }}" }
      - name: Run one autopilot step
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx -y @anthropic-ai/claude-code -p \
            "/dev-autopilot . --branch $WORKING_BRANCH — do one bounded run (fix every open bug in docs/BUGS.md if any, else advance one build step), commit, and stop. Do not open a PR." \
            --permission-mode acceptEdits
      - name: Push the step straight to the working branch
        run: git push origin "HEAD:$WORKING_BRANCH"
```

(The DevByAlex skills **and** the reused skills now travel in the app's committed
`.claude/` — `install.sh` vendors the reused skills — so a checkout has them. The
runner still needs the **BuildsByAlex MCP token** as a secret and
`ANTHROPIC_API_KEY` as a repo secret; `/dev-schedule` wires the BBA token in.)

## Cadence & cost guidance

- **During active dev:** every 3–6 hours on weekdays is plenty — each run is a
  meaningful step, not a poll. Don't go sub-hourly; there's nothing to gain and
  it just stacks commits faster than you can skim.
- **Approaching launch:** drop to once or twice a day; most remaining work is
  human (the `staging → main` production promotion, approvals, acceptance runs).
- **Review on your cadence, not per-step.** Each run pushes a green commit to the
  working branch, so you read the branch history when you choose instead of
  clearing a PR queue. When you want a merge gate back (e.g. promoting the
  iteration branch toward `main`), open one PR for the accumulated branch — not
  one per step.
- **It self-limits.** When STATUS shows all features done, autopilot stops at the
  launch stage. The loop ends on its own — you don't have to babysit a kill
  switch.

## Turning it on (checklist)

1. `/init-ai <app>` — bootstrap STATUS.
2. Plan stage done and **all three gates approved** (autopilot won't move
   otherwise).
3. Pick the **working branch** (a dedicated iteration branch like `autopilot` or
   `staging`) and make sure it exists and isn't a protected default.
4. Run **`/dev-schedule`** to create it — it preflights, picks a tier, names that
   branch explicitly (`--branch <name>`) for the cron, and (for cloud) wires the
   BuildsByAlex MCP token in as a secret.
5. Skim the commits the run pushes to the working branch; clear any blocker it
   logs in STATUS.
6. When STATUS reaches the launch stage, staging is already deployed by Pipeline
   by Alex (CI, on push to `staging`); run `/launch-acceptance` against it.
