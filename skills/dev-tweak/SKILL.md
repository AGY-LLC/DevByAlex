---
name: dev-tweak
description: "The light lane of the DevByAlex dev stage. It applies small, provably low-risk cosmetic changes (user-facing copy, design tokens, spacing/color/radius, static asset swaps, ordering/visibility of existing elements) without paying the full per-feature build/validate loop. Each entry in docs/TWEAKS.md is put through a hard qualification test first (no logic, no data model, no API, no auth, no new dependency, no test changes; anything heavier gets reclassified to docs/BUGS.md, docs/TODO.md, or a feature proposal, never forced through); qualified tweaks are applied with a proportional gate: typecheck + lint + the existing suite green, a prose pass on changed copy, and the screenshot + design-critic pass for anything visual. ADRs still govern. A tweak that contradicts an active decision is a blocker, not a change. Drains the whole open list in one run and moves each entry to Done with its commit. Called by dev-goal after the bug log is clear; also runnable by hand for a one-off tweak. Use when the change is 'make this label say X', 'tighten this spacing', 'swap this icon'; not when behavior is wrong (that's a bug) or something new is wanted (that's a feature)."
argument-hint: "[path to the app repo: defaults to cwd] [optional: a single tweak described inline, else drains docs/TWEAKS.md]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-tweak: The light lane for low-risk cosmetic changes

Changing a button label should not cost what building a feature costs. This
skill exists so small cosmetic changes have a proportional path: a hard
qualification test in, a light-but-real verification gate out. What keeps the
lane honest is the test: anything that fails it is **reclassified, never
squeezed through**.

## When to activate

- `docs/TWEAKS.md` has open entries (`dev-goal` calls this after the bug log
  is clear).
- The user asks for a one-off change that smells like a tweak: "change this
  copy," "tighten the spacing here," "swap that icon," "make this button use
  the accent color."

## The qualification test (hard gate: every entry, every time)

A change qualifies as a tweak only if **all** of these hold:

1. **It touches only:** user-visible copy · design tokens / styling values
   (color, spacing, radius, shadow, type scale) · static assets (icon/image
   swap) · ordering or visibility of **existing** elements.
2. **It touches none of:** logic or branching · data model / schema · API
   surface · auth or access control · dependencies (no additions or bumps) ·
   test files (if a test must change, the change is behavioral: not a tweak).
3. **No ADR conflict.** Read the ADR of whatever the tweak touches
   (`docs/adr/<feature>.md`, or `scaffold.md` for global tokens). A "tweak"
   that contradicts an `active` decision: including recorded copy/voice or
   design-token decisions: is a **blocker**, not a change: cite the entry in
   STATUS › `## Blockers / open questions` and skip it.

**Fails the test → reclassify, don't force.** Behavior wrong or risk present →
move it to `docs/BUGS.md` as a proper bug entry. A deliberate behavior change
that adds no scope → move it to `docs/TODO.md`, the planned-change lane.
Something new wanted → record it as a feature proposal in STATUS › Blockers for
Alex (scope is his call).
In every case, note the reclassification on the TWEAKS entry so the requester sees
where it went. Never silently drop an entry, and never let the light lane become
the back door around the feature loop.

## Workflow

### Step 1: Load the lane
Resolve the repo (arg or cwd) and the working branch (the branch you're on, or
the one `dev-goal` passed down: same iteration rule, no per-tweak
branches). Read `docs/TWEAKS.md`. If invoked with an inline tweak instead, log
it as a `TWK-xxx` entry first: the lane's audit trail applies to one-offs too.

### Step 2: Qualify every open entry
Run the qualification test on each. Reclassify failures as above. What remains
is the qualified batch.

### Step 3: Apply the batch
Make the changes: smallest possible diff per tweak, matching the surrounding
code and the `docs/DESIGN.md` token system (a styling tweak changes the token
or uses an existing one; it doesn't hardcode a one-off value that drifts from
the system).

### Step 4: The light gate (proportional, but real)
- **Always:** typecheck + lint + the **existing** test suite green. (No new
  tests: a change that needs one failed the qualification test. The e2e gate
  never applies here: `knowledge/workflow/e2e-gate.md` exempts the tweak lane
  by construction, because a change that alters a user flow fails
  qualification.)
- **Changed copy:** a quick prose pass over the changed strings (the
  `prose-check` standard: no AI tells, no decision leakage into UI copy per
  universal rule 31).
- **Anything visual:** capture screenshots of the affected screens (key states,
  light + dark where supported) under `docs/visual-qa/<run-date>/` and put them
  through the **`design-critic`** agent with `docs/DESIGN.md` and the universal
  design rules: same judge as the feature loop, smaller docket. Route
  `CRIT-xxx` findings to `fix-errors`, re-capture, re-submit until it passes.
  The critic never gets skipped because a change is "just cosmetic": cosmetic
  is exactly what it judges.

### Step 5: Record and stop
- Move each applied entry from `## Open` to `## Done` in `docs/TWEAKS.md`
  (title · what changed · branch · commit · date). Reclassified entries note
  where they went.
- Add a STATUS log line naming the TWK IDs cleared; include the pulse
  (screenshots + staging URL) per the goal run's pulse rule when UI changed.
- Commit and push to the working branch once green. One commit for the batch is
  fine: the lane is light; the TWEAKS entries are the per-item record.

## Rules

- **The qualification test is the lane.** No exceptions, no "it's almost a
  tweak." Reclassify and move on.
- **ADRs govern here too.** Recorded decisions about copy, tokens, or layout
  aren't overridden by a tweak entry: conflict goes to Alex.
- **Never weaken the suite.** If an existing test fails after a tweak, the
  change was behavioral: reclassify it as a bug and revert the change; don't
  adjust the test.
- **The critic gate holds.** Visual change → screenshots → design-critic pass,
  every time.
- Drain the whole open list in one run (entries are cheap); stop when it's
  empty or everything left is reclassified/blocked.

## Output

`docs/TWEAKS.md` drained (each entry Done, reclassified, or blocked with a
reason), the suite green, changes pushed to the working branch, and a STATUS
log line: with screenshots for anything visual.
