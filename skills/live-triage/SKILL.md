---
name: live-triage
description: "The post-launch stage of the DevByAlex workflow. It turns production signal into workflow state so a shipped app keeps improving through the same machinery that built it. Reads the docs/FEEDBACK.md inbox (user emails, support messages, store reviews, error-tracker exports pasted in by the human) plus any error-monitor signal reachable from the session, dedupes against the existing lanes, and routes each qualified item: functional problem → a docs/BUGS.md entry tagged [prod] (which dev-goal drains before any build unit), cosmetic miss → a docs/TWEAKS.md entry (the light lane), small unambiguous improvement that adds no scope → a docs/TODO.md entry (the planned-change lane re-qualifies it), feature request or scope change → surfaced to Alex in STATUS blockers, never silently turned into a feature. Triage routes; it never fixes. dev-goal's drain loops do the fixing, so production feedback flows into the exact same verified pipeline as everything else. Idempotent: safe to run repeatedly. Use post-launch when the user says 'triage the feedback', 'process the inbox', or 'what are users reporting'."
argument-hint: "[path to the app repo: defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# live-triage: Turn production signal into workflow state

The workflow used to end at TestFlight. This closes the loop: production
errors and user feedback become `docs/BUGS.md` / `docs/TWEAKS.md` /
`docs/TODO.md` entries: the same lanes `dev-goal` already drains with full
verification, so a live app keeps improving through the pipeline that built it,
not through ad-hoc hotfixes beside it.

**Triage routes; it never fixes.** The separation is the point: this skill has
no opinion about code, so its judgments about *what* users reported stay honest,
and every fix still goes through the drain loops' verify machinery.

## When to activate

- Post-launch (the app has real users on staging-promoted production or
  TestFlight/Play internal), and `docs/FEEDBACK.md` has inbox entries.
- Run it as often as you like; a run with an empty inbox and no new error
  signal is a clean no-op.
- The user asks "what are users reporting?" or "process the feedback."

## Inputs

1. **`docs/FEEDBACK.md` › Inbox**: the human-fed channel: pasted emails,
   support messages, store reviews, observations. Verbatim beats summarized.
2. **The error monitor** (wired by `/launch-observability`): if the session
   can reach it (CLI/API/MCP), pull the new/unresolved issues since the last
   triage run. If it can't, say so and triage the inbox only: never invent
   error signal; the human can paste an export into the inbox instead.

## Workflow

### Step 1: Load state
Read `docs/FEEDBACK.md`, `docs/BUGS.md`, `docs/TWEAKS.md`, `docs/TODO.md`, and
`docs/STATUS.md`.
Note the last triage run (STATUS log). If there's no FEEDBACK.md, stamp it from
the template and stop: nothing to triage yet.

### Step 2: Gather
Collect the inbox entries and (if reachable) new error-monitor issues. For
error events, capture what makes a bug entry actionable: the error message +
stack top, frequency, affected route/screen, first/last seen.

### Step 3: Triage each item
For every item, in order:

1. **Dedupe**: against open *and* fixed entries in BUGS/TWEAKS and
   already-triaged feedback. A recurrence of a **fixed** bug is not a duplicate.
   It is a regression, so file a fresh `[prod]` bug entry that cites the original
   ID and its fixing commit.
2. **Classify and route:**
   - **Functional problem** (wrong behavior, error, crash, data issue) → a new
     `docs/BUGS.md` entry tagged `[prod]`, with severity, repro (from the
     report/event: quote the user or the stack trace), and the FB/monitor
     source. Security-smelling reports (auth bypass, data leakage, injection)
     are **severity: blocker** and additionally surfaced in STATUS blockers,
     never left to wait quietly in a log.
   - **Cosmetic miss** (copy, spacing, visual polish) → a new `docs/TWEAKS.md`
     entry: it must genuinely pass the tweak qualification test; when in
     doubt, it's a bug.
   - **Small improvement, no new scope** (existing behavior users want adjusted,
     bounded and unambiguous: e.g. "sort newest first") → a new `docs/TODO.md`
     entry; `/dev-todo`'s routing re-qualifies it before any work. When in doubt
     about scope, it's a feature request for Alex, not a todo.
   - **Feature request / scope change** → STATUS › `## Blockers / open
     questions`, quoting the request. **Scope is Alex's call**: triage never
     converts a wish into a feature card.
   - **Not actionable / noise** → triaged with a one-line reason. Never
     silently dropped.
3. **Mark it**: move the FEEDBACK entry from Inbox to Triaged with a pointer
   to what it became (`→ BUG-014 [prod]`, `→ TWK-007`, `→ TODO-004`,
   `→ blocker (feature request)`, `duplicate of BUG-009`).

### Step 4: Record and stop
- Add a STATUS log line: items triaged, IDs created, anything escalated.
- If this run filed any `[prod]` bugs, note in the log that the next `/dev-goal`
  run starts with a bug drain (the existing bugs-first rule does the rest: no
  new mechanism needed).
- Commit and push to the working branch. **Stop**: fixing is `/dev-goal`'s
  job on its next run.

## Rules

- **Route, never fix.** Not even a one-liner: the drain loops own fixes so
  every change gets verified.
- **Scope changes go to Alex.** A feature request becomes a blocker/question,
  never a feature card or a "small addition."
- **Never invent signal.** Unreachable error monitor → triage the inbox only
  and say so.
- **Security reports jump the queue**: blocker severity + a STATUS blocker
  line, same run.
- **Nothing vanishes.** Every inbox item leaves as a routed ID, a duplicate
  citation, or a reasoned not-actionable: the Triaged section is the audit
  trail.
- Idempotent: empty inbox + no new signal = clean no-op run.

## Output

`docs/FEEDBACK.md` inbox drained to Triaged, new `[prod]` bug / tweak / todo
entries filed for `/dev-goal` to drain, scope requests surfaced to Alex, and a
STATUS log line: with the app's improvement loop now running on production
signal.
