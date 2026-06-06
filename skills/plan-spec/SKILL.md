---
name: plan-spec
description: "Stage 1 of the DevByAlex plan phase — turn a brief one-line app idea into an approved spec by interviewing the user until every important-but-unanswered question is resolved. Do NOT start coding. Ask questions in batches, working backwards from the user (problem, who it's for, the 3–5 core things they must do, what launch success looks like, what's explicitly out of scope), and keep going until you are genuinely confident. Capture the design/UX answers the wireframing stage will need. Writes docs/SPEC.md. Also runs in reverse-engineer mode to backfill a spec from an existing codebase. Use when starting a new app, when the user gives a vague 'build me an app that…' brief, or to draft/refine docs/SPEC.md."
argument-hint: "[one-line idea, brief file, or 'reverse' to backfill from code]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# plan-spec — Interview to a complete, approved spec

The first plan stage. The user gives a brief idea; your job is to ask the
questions that make you fully confident you could build the whole app, then
write `docs/SPEC.md`. **You are not ready to proceed while any important
question is unanswered** — getting an answer from the user beats guessing.

> Load `mcp__buildsbyalex__get_best_practice("project-kickoff")` first and
> follow it — it is Alex's canonical kickoff playbook. This skill is the
> operational wrapper around it.

## When to activate

- New project, or a vague "build me an app that…" brief.
- The user asks to write or sharpen `docs/SPEC.md`.
- `reverse` mode: an existing repo needs a spec backfilled from its code so the
  rest of the workflow has a target to validate against.

## Workflow

### Step 1 — Orient
- Read `docs/STATUS.md` if present. If a `docs/SPEC.md` already exists, ask
  whether to refine or replace.
- If the project is one of Alex's, pull `get_projects` / `get_project_context`
  from the BuildsByAlex MCP for existing intent.
- Load the `project-kickoff` best practice and use its question set as the
  backbone.

### Step 2 — Interview (the core of this skill)
Ask questions in **batches** (grouped, not one-at-a-time), and wait for
answers. Work backwards from the user. Cover at minimum:

1. **Problem & user** — what problem, for whom, and why do they care now?
2. **Core jobs** — the 3–5 things a user must be able to do. Everything else is
   later.
3. **Out of scope** — what this explicitly will *not* do for v1.
4. **Data model shape** — the main entities and how they relate (enough to seed
   `data-modeling`).
5. **Auth & access** — who logs in, how, what they can see/do, multi-tenant?
   (Security/privacy is the top priority later — get the requirements now.)
6. **Money** — free / paid / subscription / one-time? (seed `payments`).
7. **Platform** — web, mobile web, native, desktop, multi.
8. **Launch success** — what "it works and we can ship" looks like.
9. **Design/UX questions the wireframes need** — primary screen and user goal,
   emotional tone (2–3 adjectives), interaction density, key screens and their
   states (empty/loading/error/onboarding/upgrade), brand assets, references
   loved/hated, anti-patterns to avoid. **These must be answered here** because
   `plan-wireframes` depends on them.
10. **Integrations & constraints** — third parties, compliance, deadlines,
    non-negotiables.

After each batch, reflect back what you heard and list what's still open. Keep
going until nothing important is open.

### Step 3 — Confidence gate
Before writing, state your confidence and list any remaining assumptions. If
you are not confident, ask more — do not paper over a gap with a guess. Only
proceed when the open-questions list is empty or every remaining item is
genuinely deferrable and marked as such.

### Step 4 — Write docs/SPEC.md
Use `../../templates/SPEC.md` as the structure. Capture problem, users, core
jobs, out-of-scope, data-model sketch, auth/privacy requirements, monetization,
platform, the design/UX answers (verbatim enough for wireframing), integrations,
constraints, and the success definition. Convert relative dates to absolute.

### Step 5 — Update STATUS and route
- Check the **Plan → SPEC.md written** row in `docs/STATUS.md`.
- Set `## Next action` to `/plan-guide`.
- Add a log line.
- Tell the user the spec needs **their approval** (a gate) and that the next
  step is `/plan-guide`.

## reverse mode (backfill from code)
When invoked on an existing repo with no spec: read the code, routes, schema,
and README; infer problem/users/core jobs/data model/auth/monetization; write
`docs/SPEC.md` with every inferred section tagged `(inferred — needs review)`.
Then ask the user only the questions the code can't answer (intent, audience,
out-of-scope, success). Don't block the workflow on a perfect backfill, but
flag the gaps.

## Rules

- **Never start coding from this skill.** It produces a spec only.
- Batch questions; don't drip them one at a time.
- Don't proceed past the confidence gate with important unknowns.
- The spec must contain enough design/UX detail for `plan-wireframes` to run
  without another interview.
- The spec is **Alex's to approve** — flag it, don't self-approve the gate.

## Output

`docs/SPEC.md` written/updated, STATUS advanced, next action set to
`/plan-guide`, and an explicit request for Alex's approval.
