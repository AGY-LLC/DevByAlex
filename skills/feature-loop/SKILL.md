---
name: feature-loop
description: "The DevByAlex per-feature build engine — takes one feature from its card to done by running the four-step loop the workflow defines: (1) write tests and implement the feature IN PARALLEL via two separate subagents (test-author works from the spec, feature-implementer writes the code — kept apart so tests aren't written just to match the implementation); (2) a feature-validator agent runs the tests and reviews the feature's code for quality/security/logic/best-practices, looping back to write a failing test + fix on any issue; (3) an integration-validator agent runs the full suite and reviews the whole codebase, looping back the same way; (4) confirm the finished feature aligns with the implementation guide and wireframes, then update docs/STATUS.md. Use to build one specific feature, or as the unit of work the autopilot calls per feature."
argument-hint: "[feature id or slug from docs/features/ — e.g. 03-billing]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# feature-loop — Build one feature to done

The orchestrator for a single feature. It owns that feature end-to-end and
deploys specialist subagents for each step. This is the "agent assigned to the
feature that deploys the subagent steps" from the workflow spec; the autopilot
calls it once per feature.

> **Gate + order check.** Requires approval gates met, **Scaffold** and
> **Authentication** done. If not, route to the right earlier stage.

## How it runs

Each step runs in its **own subagent** via the Agent tool, so the orchestrator's
context stays clean and the roles stay independent. Brief every subagent to pick
up cold: give it the target repo, paste the relevant feature card and acceptance
criteria, and tell it exactly what to return. The named agent types live in this
plugin's `agents/` dir; if they aren't registered, fall back to
`subagent_type: general-purpose` and tell the subagent which skill to invoke.

The agents and the skills they lean on:

| Step | Agent | Leans on |
|------|-------|----------|
| 1a tests | `test-author` | `test-suite-developer` |
| 1b code | `feature-implementer` | the feature card + guide |
| 2 feature validation | `feature-validator` | `scout` (feature-scoped), `issue-checker`, `fix-errors` |
| 3 integration validation | `integration-validator` | `scout` (whole repo), `fix-errors` |

## Workflow

### Step 0 — Load the feature
Read the feature card `docs/features/<id>.md`, its acceptance criteria, the
relevant section of `docs/IMPLEMENTATION_GUIDE.md`, the wireframe screens for
this feature, and `docs/STATUS.md`. Build on the **working branch** — the branch
you're on, or the one `dev-autopilot` passed down; **don't create a per-feature
branch.** Mark the feature row **in-progress** in STATUS.

First decide whether this feature is **greenfield** (no real implementation yet)
or **existing** (already built — common when `init-ai` integrated an existing
repo and marked the row impl-present-but-unvalidated). The check: does the
feature's code already exist and roughly work?

**Greenfield — build:** Spawn **two separate subagents in the same message** so
they run concurrently and independently:
- **`test-author`** — writes tests purely from the feature card's acceptance
  criteria and behaviors (success paths, failure paths, edge cases, security
  boundaries). It must **not** read or shape itself around the implementation —
  tests come from the spec, not the code.
- **`feature-implementer`** — implements the feature from the card + guide,
  following the project's conventions and Alex's stack rules (TS strict, Zod
  boundaries, thin handlers + services, ORM with reviewed migrations).

Keeping them apart is the point: it stops tests from being written just to pass
whatever code happens to exist. Wait for both, then run the suite once to see
where they meet (some failures are expected and good — they reveal real gaps).

**Existing — harden, don't rebuild:** the code is already there, so do **not**
re-implement it. Spawn `test-author` only, to **backfill tests from the card's
acceptance criteria** (still blind to the implementation, so the tests certify
the spec's behavior rather than rubber-stamping the current code). Run them: any
failure is a real gap between what's built and what the spec requires — those
feed the validation loop below as fixes, not rewrites. Reserve a fresh
implementation for a screen/behavior the card requires that genuinely doesn't
exist yet.

### Step 2 — Feature validation
Spawn the **`feature-validator`** agent. It:
- runs the tests, and
- inspects the **feature-related code** for quality, security, logic issues,
  and best practices (via `scout` scoped to this feature, plus `issue-checker`
  on any claim).

If it passes, go to Step 3. **If it fails**, for each confirmed issue: write a
test that captures the issue, then fix the code to resolve it (use `fix-errors`
to drive the queue to zero), and re-run Step 2. Loop until clean.

### Step 3 — Integration validation
Spawn the **`integration-validator`** agent. It:
- runs the **entire** test suite, and
- inspects the **whole codebase** for quality, security, logic issues, and best
  practices introduced by integrating this feature (via `scout` over the repo).

If it passes, go to Step 4. **If it fails**, same remedy: write a test that
captures the issue, fix the code (`fix-errors` to zero), and re-run Step 3.
Loop until clean. (If an integration fix reopens the feature, re-run Step 2.)

### Step 4 — Align and update status
With the feature fully built and both validations clean:
- Confirm it **aligns with `docs/IMPLEMENTATION_GUIDE.md` and the wireframes**
  for this feature — behavior, screens, and states all match. If something
  drifted, fix it (or, if the drift is intentional and better, note it and flag
  the guide/wireframe for Alex to update — don't silently diverge).
- Mark every step for this feature ✅ and the row **done** in
  `docs/STATUS.md`; add a log line (branch, commit, what shipped).
- Commit and **push to the working branch** (`git push origin HEAD:<branch>`) —
  no PR. Leave the suite green before pushing.
- Set `## Next action` to the next not-done feature (or `/launch-acceptance`
  if this was the last).

## Rules

- **Step 1 is genuinely parallel and the two roles are blind to each other.**
  Tests trace to the spec; never weaken a test to make code pass.
- A failing validation is a loop-back, not a stop: capture it as a test, fix,
  re-validate. Don't mark done with red tests or open findings.
- Don't expand scope beyond the feature card; surface new ideas as proposals.
- Keep STATUS the live source of truth — update it as you move through steps.
- **Existing code is hardened, not rebuilt.** On a feature that's already built
  (or partially built), resume: backfill spec-traced tests, validate, and fix —
  don't re-implement working behavior or restart from scratch.

## Output

One feature built, tested, validated at the feature and integration level,
aligned to guide + wireframes, with STATUS updated and the next feature queued.
