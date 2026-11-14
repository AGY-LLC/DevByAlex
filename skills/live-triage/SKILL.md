---
name: live-triage
description: "Post-launch triage for the DevByAlex workflow. Use when the user says 'triage the feedback', 'process the inbox' or 'what are users reporting'. Reads docs/FEEDBACK.md and any reachable error-monitor signal, dedupes against the lanes, and routes each item: functional problem to docs/BUGS.md tagged [prod], cosmetic miss to TWEAKS, small no-scope improvement to TODO, feature request to Alex in STATUS blockers. Routes, never fixes; dev-goal drains the lanes. Safe to run repeatedly."
argument-hint: "[path to the app repo: defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# live-triage: Turn production signal into workflow state

## Goal

Production errors and user feedback become entries in the lanes `dev-goal`
already drains with full verification (`docs/BUGS.md`, `TWEAKS.md`,
`TODO.md`), so a live app improves through the pipeline that built it, not
through hotfixes beside it. Runs after launch, as often as wanted.

## Done when

- Every `docs/FEEDBACK.md` Inbox entry (pasted emails, support messages, store
  reviews, observations; verbatim beats summarized) and every new or
  unresolved error-monitor issue since the last triage run (the STATUS log)
  is triaged: deduped against open and fixed lane entries and earlier
  triage, then routed:
  - **Functional problem** (wrong behavior, error, crash, data issue): a
    `docs/BUGS.md` entry tagged `[prod]` with severity, repro quoting the user
    or the stack trace, and its source. Error events carry message and stack
    top, frequency, route or screen, first and last seen.
  - **Cosmetic miss:** a `docs/TWEAKS.md` entry, only if it passes the tweak
    qualification test.
  - **Small improvement, no new scope** (bounded, unambiguous, for example
    "sort newest first"): a `docs/TODO.md` entry, which `/dev-todo`
    re-qualifies before any work.
  - **Feature request or scope change:** quoted in STATUS `## Blockers / open
    questions` for Alex.
  - **Noise:** marked not actionable with a one-line reason.
- Each entry moved from Inbox to Triaged with what it became (`→ BUG-014
  [prod]`, `→ TWK-007`, `→ TODO-004`, `→ blocker (feature request)`,
  `duplicate of BUG-009`).
- A STATUS log line gives items triaged, ids created and anything escalated,
  and says the next `/dev-goal` run starts with a bug drain when any `[prod]`
  bug was filed; the work is committed and pushed to the working branch.
- With no `docs/FEEDBACK.md`, it is stamped from the template and the run
  stops. An empty inbox and no new signal is a clean no-op.

## Decisions (and why)

- **Route, never fix,** not even a one-liner. Why: with no stake in the code,
  triage reports what users said honestly, and every fix still goes through
  the drain loops' verification.
- **A recurrence of a fixed bug is a regression, not a duplicate:** a fresh
  `[prod]` entry citing the original id and its fixing commit. Why: closing it
  as a duplicate hides that the fix broke.
- **When in doubt, a cosmetic report is a bug and a "small change" is a
  feature request.** Why: the cheaper lanes skip verification or scope review
  that the work may need.
- **Security-smelling reports** (auth bypass, data leakage, injection) are
  blocker severity and also a STATUS blocker in the same run. Why: they must
  not wait quietly in a log.
- **The error monitor is read only when this session can reach it** (wired by
  `/launch-observability`); otherwise triage the inbox and say so. Why:
  invented signal is worse than none, and a human can paste an export into
  the inbox.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Never turn a wish into a feature card; scope is Alex's call.
- Nothing vanishes: every inbox item leaves as a routed id, a duplicate
  citation or a reasoned not-actionable.
- Stop after triage; fixing is the next `/dev-goal` run.
