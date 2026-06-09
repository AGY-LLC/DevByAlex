---
name: launch-verify
description: "Launch-readiness stage of the DevByAlex workflow — the computer-use TEST→FIX→RE-TEST loop that actually RUNS the acceptance test launch-acceptance wrote. Drives a real browser against the staging environment via the Chrome DevTools MCP to execute docs/ACCEPTANCE_TESTS.md step by step (navigating, clicking, typing, reading the DOM/accessibility tree, capturing screenshots, and watching the console + network for errors), then evaluates the live UI against a front-end design floor using the Vercel web-interface-guidelines skill and the frontend-design skill. Failures drive a fix loop: functional breakages are logged to docs/BUGS.md and/or fixed through fix-errors and the acceptance pass re-run until the critical path is green; front-end/design gaps route to a remediation queue where the shadcn MCP supplies on-spec components. Loops until the critical-path pass is clean or a finding survives two fix attempts (then it stops and surfaces a blocker). Needs a deployed staging URL, the Chrome DevTools MCP, and (for the design pass) the shadcn MCP. Read+act: it runs the app and routes fixes; it does not self-approve any gate. Use after launch-acceptance has written the tests and staging is deployed, when the user says 'run the acceptance test', 'verify staging', 'computer-use test the app', or 'run the launch verify loop'."
argument-hint: "[optional: staging URL, or a single flow/scenario to run]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-verify — Run the staging acceptance test, then fix what it finds

The launch-readiness stage's **execution** step. `launch-acceptance` *writes* the
computer-use-runnable acceptance test; this skill *runs* it against the deployed
staging environment, watches the real app behave, evaluates the live UI against a
front-end design floor, and drives a **test → fix → re-test loop** until the
critical path is green. It closes the loop that `launch-acceptance` opens.

It **acts** (it runs the app and routes fixes), but it **never self-approves** a
gate — the Legal & Accessibility hard gates and the staging/deploy decisions stay
Alex's.

## When to activate

- `docs/ACCEPTANCE_TESTS.md` exists (written by `/launch-acceptance`) and the app
  is deployed to a reachable **staging** URL.
- The user says "run the acceptance test," "verify staging," "computer-use test
  the app," or "run the launch verify loop."
- An optional argument narrows the run to a single flow/scenario or supplies the
  staging URL.

## Prerequisites — the tools this loop drives

Verify these before running; if a required one is missing, **stop and route to
setup** rather than faking a pass (same discipline as `plan-wireframes` with the
Figma MCP). Detect each with `ToolSearch` (look for the tool prefixes named).

- **Staging URL** — read from `docs/STATUS.md` / `docs/ACCEPTANCE_TESTS.md`
  preconditions or the argument. No URL → stop; staging deploy is Alex's manual
  step (confirm the **Staging deployed** gate is checked first).
- **Chrome DevTools MCP** *(required — the computer-use driver)* — the browser
  the loop drives to execute the test: navigate, click, type, read the DOM and
  the accessibility tree, capture screenshots, and inspect the **console**,
  **network**, and **performance** traces for errors a click-through alone misses.
  Look for `chrome`-prefixed tools. If absent, stop and tell the user to connect
  it (e.g. `claude mcp add chrome-devtools npx chrome-devtools-mcp@latest`); do
  **not** substitute by reading code instead of running the app.
- **shadcn MCP** *(needed for the design-fix side)* — supplies on-spec
  shadcn/ui components when remediating front-end findings. Look for
  `shadcn`-prefixed tools. If absent, the test+functional-fix loop still runs;
  note that UI remediation will hand-write components instead of pulling them.
- **Front-end design skills** *(the design floor)* — the **web-interface-guidelines**
  skill (Vercel's web interface guidelines) and the **frontend-design** skill,
  vendored into the app's `.claude/skills` by `install.sh`. Used to judge the
  live UI in the design pass. If a skill is missing on this runner, evaluate
  against the wireframes + `docs/DESIGN.md` and note the reduced rigor.

## Workflow

### Step 1 — Load state
Read `docs/STATUS.md`, `docs/ACCEPTANCE_TESTS.md`, the wireframe artifact
(`docs/wireframes/README.md`), and `docs/DESIGN.md` if present. Confirm the
**Staging deployed (manual)** gate is checked and the acceptance tests exist. If
either is missing, stop and route (`/launch-acceptance` first, or ask Alex to
deploy + check the gate). Resolve the staging URL and the working branch (same
rule as `dev-autopilot`: the arg/`--branch`, else the current branch).

### Step 2 — Run the acceptance test (computer-use, against staging)
Drive the **Chrome DevTools MCP** through `docs/ACCEPTANCE_TESTS.md` exactly as
written — one scenario at a time, in order. For each step: perform the action,
then check the **explicit expected result** the doc states. Capture as evidence:
- a **screenshot** at each meaningful state (and on every failure),
- any **console errors / warnings**, failed **network** requests (4xx/5xx), and
  obvious **performance** cliffs,
- the **accessibility tree** snapshot for key screens (feeds the design pass and
  cross-checks the a11y gate).

Use placeholder test credentials from the preconditions — **never real secrets**.
Run the non-happy paths too (bad input, unauthorized access). Record each
scenario **pass/fail** with the evidence.

### Step 3 — Front-end design pass on the live UI
With the app already open, evaluate the rendered screens against the design floor
(don't just trust the markup):
- Run the **web-interface-guidelines** skill (Vercel) and the **frontend-design**
  skill over the captured screenshots + accessibility tree + key DOM, screen by
  screen.
- Compare each screen to its **wireframe** and `docs/DESIGN.md` tokens — flag
  drift in layout, hierarchy, spacing, states (empty/loading/error), focus
  order, contrast, and responsive behavior.
- Classify findings: **functional/broken** (treated like acceptance failures,
  below) vs **design polish** (advisory queue).

### Step 4 — Triage into the fix loop
Turn the results into two queues:
- **Functional failures** (a scenario failed, a console/network error, a broken
  flow, a hard-blocking UI defect) → **blockers**. Log each to `docs/BUGS.md`
  `## Open` with repro steps + the captured evidence, OR fix it directly this run
  (see Step 5). These already **block launch** via the existing soft gate
  (`dev-autopilot` won't enter/clear launch while `docs/BUGS.md` has open bugs).
- **Design-polish findings** (guideline deviations, wireframe drift, minor a11y
  nits not already on the WCAG hard gate) → an **advisory** `UI-xxx` fix queue in
  STATUS, routed to `fix-errors`. Advisory: they don't block ship, but the loop
  should clear what it can.

Anything that is genuinely an **accessibility** WCAG 2.2 AA issue belongs to the
`launch-compliance` hard gate — note it and route there; don't silently absorb it.

### Step 5 — Fix, then re-test (the loop)
This is the loop the user asked for. Drive it to a clean critical path:
1. **Confirm the finding is real** — use `issue-checker` for anything ambiguous so
   you fix a real defect, not a flaky run.
2. **Fix** — route to `fix-errors`, which adds/updates a spec-traced test that
   captures the defect and amends the code. For **UI** remediation, apply the
   **frontend-design** + **web-interface-guidelines** skills and pull on-spec
   components from the **shadcn MCP** rather than hand-rolling. Keep the working
   branch green (`dev-autopilot`'s push rule: `git push origin HEAD:<branch>`
   only on a green suite).
3. **Re-run** the affected scenario(s) via the Chrome DevTools MCP against the
   redeployed/updated staging. (Note: a code fix needs the staging deploy
   refreshed — if staging is a manual deploy, surface that the fix is pushed and
   awaits re-deploy before re-run, and stop rather than testing stale staging.)
4. **Repeat** until every critical-path scenario passes and the advisory queue is
   drained or consciously punted.

**Bound the loop.** If the **same finding survives two fix attempts**, stop —
write it to STATUS `## Blockers / open questions` and surface it for Alex (same
rule as `dev-autopilot`). Never loop indefinitely or weaken a test to force green.

### Step 6 — Reconcile STATUS and route
- Check **Launch → Acceptance pass run on staging (computer-use)** only when
  every critical-path scenario passes; leave it unchecked while any fails.
- Check **Launch → Front-end design review passed** only when the advisory
  `UI-xxx` queue is clear (or all remaining items are explicitly accepted).
- Any functional failures you logged but couldn't fix this run stay in
  `docs/BUGS.md` `## Open` — they keep the launch stage blocked until drained.
- Add a log line (scenarios run, pass/fail, fixes pushed, branch · commit) and
  set `## Next action` — typically `/launch-compliance` and `/staging-smoke-test`
  next if the pass is green, else `/fix-errors` (or a re-deploy + re-run) while
  findings remain.
- If the project is tracked, append an agent-log entry via the BuildsByAlex MCP.

## Rules

- **Run the real app, don't simulate it.** This step's value is executing against
  staging with a computer-use browser. No staging URL or no Chrome DevTools MCP →
  stop and route to setup; never substitute a code read for a live run.
- **Never embed real secrets** — placeholder test credentials only.
- **Functional failures are blockers; design polish is advisory.** Mirror the
  existing hard/soft split — broken flows block launch (via `docs/BUGS.md`),
  guideline polish goes to an advisory queue.
- **Accessibility belongs to the hard gate.** Route WCAG 2.2 AA issues to
  `launch-compliance`; don't quietly fix-and-forget them here.
- **Fixes go through `fix-errors` with a test that captures the defect** — same
  discipline as the dev loop; don't patch without a regression test. UI fixes use
  the design skills + shadcn MCP, not ad-hoc markup.
- **Bound the loop** — a finding surviving two fix attempts is a blocker to
  surface, not a loop to spin on.
- **Green suite, push to the working branch, no PRs** — same as the dev stage.
- **Never self-approve a gate** and never test stale staging after a fix that
  needs a manual re-deploy.

## Output

The acceptance test executed against staging with per-scenario pass/fail +
evidence, a front-end design pass on the live UI, functional failures fixed (or
logged to `docs/BUGS.md`) and design findings driven through `fix-errors`, the
loop re-run to a green critical path, `docs/STATUS.md` reconciled, and a pointer
to `/launch-compliance` + `/staging-smoke-test` for the remaining launch checks.
