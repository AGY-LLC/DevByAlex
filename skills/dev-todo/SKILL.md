---
name: dev-todo
description: "The planned-change lane of the DevByAlex dev stage, the third lane after bugs and tweaks and the one most post-stable iteration lives in. Drains docs/TODO.md: deliberate changes and improvements you've decided you want that are heavier than a cosmetic tweak (behavior, structure, flows may change) but smaller than a feature (no new scope). Each entry is routed first: broken behavior is reclassified to docs/BUGS.md, cosmetic-only entries to docs/TWEAKS.md, and anything feature-sized (new user-facing capability, new data model or API surface, a substantial new dependency) is surfaced to Alex as a feature proposal in STATUS blockers, never silently absorbed into scope. Qualified entries are applied through a proportional but real gate: a failing test first where behavior changes, typecheck + lint + full suite green, prose pass on changed copy, screenshot + design-critic pass on anything visual. ADRs still govern: an entry contradicting an active decision is a blocker, not a change. Drains the whole open list in one run and moves each entry to Done with its commit. Called by dev-goal after bugs and tweaks are clear; also runnable by hand. Use when the change is 'adjust how X works', 'rework this flow', 'improve Y'; not when behavior is broken (bug), the change is purely cosmetic (tweak), or something new is wanted (feature)."
argument-hint: "[path to the app repo: defaults to cwd] [--branch <name>]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# dev-todo: Drain the planned-change lane

The third lane. `docs/BUGS.md` holds what's broken, `docs/TWEAKS.md` holds what's
cosmetic, and `docs/TODO.md` holds what you've **decided to change**: bounded
adjustments to behavior, structure, or flows that don't add new scope. Once an
app is stable, this lane is where most of the iteration happens: you keep
jotting changes, the loop keeps draining them.

## When to activate

- `docs/TODO.md` has open entries (`dev-goal` calls this after the bug log and
  the tweak lane are clear).
- The user asks for a one-off planned change by name, or says "drain the todos",
  "work the todo lane".

## Step 1: Load and route (qualification first)

Read `docs/TODO.md`, `docs/STATUS.md`, and the ADRs of whatever each entry
touches. Route every `## Open` entry before doing any work:

- **Behavior is broken** (something doesn't work as already intended) →
  reclassify to `docs/BUGS.md`, note the move in the entry, and leave it for the
  bug drain. Bugs get the bug lane's worst-first discipline, not this one.
- **Cosmetic-only** (copy, tokens, spacing, assets, ordering: passes
  `/dev-tweak`'s qualification test) → reclassify to `docs/TWEAKS.md`: the
  lighter gate is cheaper and just as safe.
- **Feature-sized** (a new user-facing capability, a new data model or API
  surface, a substantial new dependency, or anything that needs a spec
  conversation) → surface it to Alex in STATUS `## Blockers / open questions` as
  a **feature proposal**. Scope stays human; the todo lane is never a back door
  around the plan gates or the feature loop.
- **Contradicts an `active` ADR decision** → blocker, not a change. Cite the
  entry; only Alex may supersede it.
- Everything else, a bounded change to existing behavior or structure, is a
  **qualified todo**: keep it.

## Step 2: Apply the qualified batch

Work entries in listed order (respect any dependency between them), on the
working branch (the one you're on, or the one `dev-goal` passed down; no
per-entry branches). For each entry:

1. **Failing test first where behavior changes.** Write or adjust the test that
   captures the *new* expected behavior, watch it fail, then implement until it
   passes. A todo that changes no behavior (e.g. a structural refactor) instead
   proves itself by the existing suite staying green.
2. **The gate, proportional but real:** typecheck + lint + **full suite green**;
   prose pass on any changed user-facing copy; **screenshot + design-critic
   pass on anything visual** (same standard as every design change, saved under
   `docs/visual-qa/<run-date>/`).
3. Record any material decision the change makes: feature-scoped → that
   feature's `docs/adr/<id>.md`; cross-cutting → `docs/DECISIONS.md`.
4. **Move the entry to `## Done`** with a one-line summary (branch · commit ·
   date). Don't just delete it.
5. Commit. Push after the batch (or per entry if entries are independent and
   large).

If a fix fails its gate twice, punt the entry to STATUS blockers with what was
tried: same two-strikes rule as everywhere else.

## Step 3: Record and stop

- Update `docs/STATUS.md`: log entry naming the TODO IDs drained (and anything
  reclassified or punted), with a visual pulse if UI changed.
- Leave no orphans: remove anything the batch superseded.
- Commit and push to the working branch. Report: entries applied, entries
  rerouted (and to where), blockers filed.

## Rules

- **Drain the whole open list in one run**: a half-drained lane is worse than
  none. Reclassified and punted entries count as drained (they left `## Open`).
- **Route before work.** Every entry is qualified first; nothing feature-sized
  is ever quietly built from here.
- **ADRs govern.** An entry contradicting an `active` decision is a blocker.
- **Never a back door.** The qualification routing is what keeps this lane from
  becoming a way around the feature loop or the plan gates.
- **Open todos block the launch stage**, same as open bugs and open tweaks: a
  known planned change never ships unaddressed and unacknowledged.
- Suite green at every stop; leave no orphans.

## Output

`docs/TODO.md` with an empty `## Open` section (every entry applied, reclassified,
or punted to a named blocker), entries in `## Done` with their commits, STATUS
updated with the drain log entry, and a green suite pushed to the working branch.
