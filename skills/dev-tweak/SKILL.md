---
name: dev-tweak
description: "Light lane of the DevByAlex dev stage: drains docs/TWEAKS.md of small cosmetic changes (copy, tokens, spacing, color, asset swaps, ordering or visibility of existing elements). Use for 'make this label say X', 'tighten this spacing', 'swap this icon'; not for wrong behavior (bug) or new scope (feature). Each entry must pass a hard qualification test (no logic, data, API, auth, dependency or test changes) or is rerouted. Gate: typecheck, lint, suite green, prose and design-critic passes. ADRs govern. Called by dev-goal after bugs; also runnable by hand."
argument-hint: "[path to the app repo: defaults to cwd] [optional: a single tweak described inline, else drains docs/TWEAKS.md]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# dev-tweak: The light lane for low-risk cosmetic changes

## Goal

`docs/TWEAKS.md` has no open entries: each small cosmetic change shipped
through a light but real gate, or was rerouted to the lane it belongs in.
Changing a button label should not cost what building a feature costs, and
the qualification test is what keeps the light lane from becoming a back door
around the feature loop.

`dev-goal` calls this after the bug log is clear; it also runs by hand for a
one-off ("change this copy", "swap that icon"), which is logged as a
`TWK-xxx` entry first. Work on the branch you're on or the one `dev-goal`
passed, never a per-tweak branch.

## The qualification test (every entry, every time)

A change is a tweak only if all three hold:

1. It touches only user-visible copy, design tokens or styling values (color,
   spacing, radius, shadow, type scale), static assets, or the ordering or
   visibility of existing elements.
2. It touches no logic or branching, data model, API surface, auth or access
   control, dependency (no additions or bumps), or test file. A test that must
   change means the change is behavioral.
3. It contradicts no `active` ADR entry (`docs/adr/<feature>.md`, or
   `scaffold.md` for global tokens), including recorded copy, voice and token
   decisions. A conflict is a STATUS blocker citing the entry, not a change.

A failing entry is reclassified, never squeezed through: wrong behavior goes
to `docs/BUGS.md`, a deliberate behavior change with no new scope to
`docs/TODO.md`, and anything new to Alex as a feature proposal in STATUS
blockers. The TWEAKS entry notes where it went.

## Done when

- Every open entry is applied, reclassified or blocked; applied ones moved to
  `## Done` with what changed, branch, commit and date.
- Each change is the smallest diff that fits the surrounding code and the
  `docs/DESIGN.md` token system: a styling tweak changes or reuses a token,
  never hardcodes a one-off value.
- Typecheck, lint and the existing suite are green. No new tests are written,
  and the e2e gate doesn't apply (`knowledge/workflow/e2e-gate.md` exempts
  this lane, since a change to a user flow fails qualification).
- Changed copy passed a `prose-check`-standard pass (no AI tells, no decision
  leakage into UI copy).
- Anything visual was screenshotted (key states, light and dark where
  supported) under `docs/visual-qa/<run-date>/` and passed `design-critic`
  with `docs/DESIGN.md` and the universal design rules; `CRIT-xxx` findings
  went through `fix-errors` and were re-captured until it passed.
- A changed screen structure or state set is updated in the screen inventory
  in `docs/wireframes/README.md`.
- STATUS has a log line naming the TWK IDs cleared, with the pulse
  (screenshots and staging URL) when UI changed, and the batch is committed and
  pushed once green.

## Decisions (and why)

- **One commit for the batch is fine.** Why: the TWEAKS entries are the
  per-item record.
- **Penpot is not touched for a tweak**
  ([`../../knowledge/workflow/penpot-wireframes.md`](../../knowledge/workflow/penpot-wireframes.md)).
  Why: boards are a plan-time artifact refreshed on demand; the text
  inventory carries current state without a browser.
- **The critic still judges "just cosmetic" changes.** Why: cosmetic is
  exactly what it judges.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- No exceptions to the qualification test.
- An existing test failing after a tweak means the change was behavioral:
  revert it and reclassify it as a bug; never adjust the test.
- Never drop an entry silently.
