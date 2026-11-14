---
name: fix-errors
description: >-
  Works through a provided list of errors (lint, typecheck, tests, build, or FIND-xxx
  items from code review) one fix at a time: minimal change, verify, then next, preserving
  code integrity and avoiding cascading regressions. Drives the queue to **zero remaining
  items**, never stopping partway. Use when the user supplies multiple errors, a backlog,
  CI output, or remediation queue; when fixing findings from code-review; or when the user
  mentions fix-errors or systematic error remediation.
---

# Fix errors

## Goal

Drive a list of errors (lint, typecheck, test or build output, or a
`FIND-xxx`, `LR-xxx` or other fix queue) to zero, one minimal verified fix at
a time, without cascading regressions. Done means every input item has a
terminal disposition and the originally failing checks pass on a full re-run,
not "fixed the main ones".

## Done when

- **Inventoried:** every distinct input item is numbered (raw tool output
  parsed into discrete items, none lost) and the count is written down.
- **Every item has a record,** written as soon as the item is settled, with a
  disposition of Fixed, Duplicate of FIX-YYY, Invalid (with evidence) or
  Deferred (with the specific blocker: missing access, an ambiguous spec or a
  user decision). Each `### FIX-XXX: title` record, numbered in execution
  order, gives Source (raw error or the `FIND-`/`LR-` id), Disposition,
  Severity if known, the narrowest Location, Symptom, Change (or n/a), Verify
  (the command actually run and its exit status, or n/a), Doc updated (or
  n/a), Regressions, Depends on, and a Reason for anything not Fixed. A
  hypothesis fix (unclear root cause) is noted and confirmed before moving on.
- **Final full re-run:** the original failing checks (for example `pnpm lint`,
  `pnpm test`, `tsc --noEmit`, `pnpm build`) ran over the whole scope that
  produced the input and pass, or the only failures left are Deferred items.
  Anything still failing becomes a new item and the loop continues.
- **Tracked documents updated:** where items came from a checked-in document
  (a findings or audit file, `TODO.md`, a launch-readiness report, an issue
  body), each Fixed item is checked off, removed or moved under `## Resolved`;
  Duplicate, Invalid and Deferred items stay, annotated inline. When it's
  unclear which document holds an item, ask once rather than delete.
- **Reported:** an executive summary (input size, ordering approach, the
  final commands and exit statuses), the records, then a closing summary with
  the disposition tally showing `Fixed + Duplicate + Invalid + Deferred =
  input`, the final verification commands and statuses, the documents updated
  (with which ids), and an Unresolved section listing every item not Fixed
  with its reason ("None" when empty; never omitted). An optional `yaml`
  block of id, source, location and depends_on can follow for tooling.

## Decisions (and why)

- **One error, one coherent change, one verification,** with no drive-by
  refactors; the narrowest check that proves the error is gone runs before the
  next item. Why: batching unrelated edits hides which change broke what.
- **Order by dependency, then severity** (Critical, High, Medium, Low and
  Note, the code-review scale), with a lower item first only when it unblocks
  many others; types before tests that failed only because of types. Why:
  upstream fixes clear downstream noise.
- **Trace the blast radius before editing** (imports, shared types, callers,
  public API, schemas). New diagnostics after a fix are resolved, or the fix
  reverted, before the queue advances; genuinely separate new errors join the
  inventory. Why: never work on a broken tree.
- **ADRs win.** A fix that would contradict an `active` decision or deliberate
  omission in `docs/adr/` is Deferred citing the entry, for the human to
  withdraw the item or supersede the decision; an item that only re-argues a
  documented omission is Invalid with the citation.
- **Tracking ids stay out of source.** `FIX-`, `FIND-`, `LR-`, `SEC-` and
  similar ids live in the records, PR description and commit message, never
  in code comments or test names; a comment keeps the substantive why without
  the id. Existing ones aren't swept. Why: the ids rot and the fix is already
  in the diff.
- **Limited context** (partial logs, missing repo access) shifts items from
  Fixed to Deferred with what would close them; it never drops them.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- No silent skipping: every input item appears as a record.
- No partial victory and no "should work": a fix counts only when its check
  ran and passed, and the summary can't be written while the original checks
  still fail on anything but Deferred items.
- If any of this would be broken, stop and tell the user rather than paper
  over it.
