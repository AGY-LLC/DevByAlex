---
name: fix-errors
description: >-
  Works through a provided list of errors (lint, typecheck, tests, build, or FIND-xxx
  items from code review) one fix at a time: minimal change, verify, then next—preserving
  code integrity and avoiding cascading regressions. Drives the queue to **zero remaining
  items**, never stopping partway. Use when the user supplies multiple errors, a backlog,
  CI output, or remediation queue; when fixing findings from code-review; or when the user
  mentions fix-errors or systematic error remediation.
---

# Fix errors

## Completeness contract (read first)

This skill is **not** "fix some errors and report progress." It is **"drive the input to zero."** The job is not done until every item from the input list has a terminal disposition (fixed, duplicate-of-X, invalid-with-evidence, or explicitly-deferred-with-user-approval) **and** the originally failing checks pass clean on a final re-run.

Hard rules — violating any of these means the skill failed:

1. **No silent skipping.** Every input item appears in the output as a `FIX-XXX` record with a terminal disposition. If you cannot fix one, it still gets a record — labelled `Deferred` or `Invalid` — never omitted.
2. **No partial declarations of victory.** Do not say "fixed the main ones" or "remaining items are minor." Either every item is resolved, or the unresolved ones are explicitly listed in the **Unresolved** section of the closing summary with a reason.
3. **No "I think this is fine now" without evidence.** A fix is only complete when the **Verify** check actually runs and actually passes. "Should work" is not verification.
4. **No early exit on hard items.** If an item is genuinely blocked (missing access, ambiguous spec, requires user decision), record it as `Deferred` with a specific blocker — do **not** quietly drop it and move on hoping the user won't notice.
5. **Final full re-run is mandatory.** After the last per-item fix, re-run the original failing check(s) end-to-end on the full input scope (lint over the whole project, full test suite, full typecheck, full build — whatever produced the input). The closing summary must cite the actual command and its actual exit status.
6. **The count must reconcile.** `len(input items) == len(Fixed) + len(Duplicate) + len(Invalid) + len(Deferred)`. State this arithmetic explicitly in the closing summary.

If any of these would be violated, stop and surface the problem to the user instead of papering over it.

## Relationship to code-review

- **code-review** emits an ordered **fix queue** (`FIND-001` …) with **Depends on**, severity, and **Verify** fields.
- **This skill consumes** that queue—or any equivalent error list—and **executes fixes in the same order philosophy**: resolve blockers and Critical/High first, respect dependencies, one coherent change per step, verify before continuing.
- If the input is raw tool output (not FIND-shaped), **map** each item to the **fix record** template below so progress stays auditable.

## Mindset

- **One error, one fix, one verification**: Do not batch unrelated edits without running checks between them.
- **Evidence over hope**: After each fix, run the narrowest check that proves the error is gone (and that nothing obvious regressed).
- **Scope the blast radius**: Before editing, trace imports, shared types, and callers—same discipline as reviewing trust boundaries.
- **Assume regressions are likely**: If verification adds new diagnostics, **stop** and resolve them before the next item—do not leave a trail of broken follow-up fixes.
- **Never tag fixes in the code itself**: The fix queue / FIX-xxx / FIND-xxx / LR-xxx IDs live in the audit trail (markdown records, PR descriptions, commit messages) — **never** in source comments or test descriptions. Do not write `// FIND-042: …`, `// FIX-007 regression`, `it('FIND-099: rejects …')`, or any other code annotation that names a fix-tracking ID. These IDs are ephemeral; the fix itself is the artifact. If a non-obvious *reason* is worth recording at the code site, write it as a plain explanatory comment without the tracking token.

## Fix workflow

1. **Inventory the input**: Enumerate every distinct item from the input. Number them. Write the count down — it is the denominator the closing summary must reconcile against. If the input is raw tool output (e.g. `tsc` errors, a Jest run, a FIND-xxx queue), parse it into discrete items first; do not let any line get lost in a regex.
2. **Map the list**: Deduplicate overlapping diagnostics (mark duplicates as `Duplicate of FIX-YYY` rather than dropping them); classify (build/config, types, lint, tests).
3. **Order the work**: Align with **code-review ordering rules** when severity or **Depends on** exists—upstream blockers first, then Critical/High, then the rest. If order is unclear, prefer fixes that unblock the most downstream errors.
4. **For each item** (repeat until **every** inventoried item has a terminal disposition — Fixed, Duplicate, Invalid, or Deferred):
   - **Restate** the error and the **minimal** location(s).
   - **Check blast radius**: What must stay stable (behavior, public API, schemas)?
   - **Apply one coherent change**—no drive-by refactors.
   - **Verify** using project checks (see **Verify** field if this came from a FIND record). Run the actual command; cite the actual result.
   - **Record** the outcome using the template below — **immediately**, not at the end. The record must exist before you move on to the next item, so partial progress is never lost.
   - If new errors appear, **triage**: fix regression first or revert; do not advance the queue on a broken tree. New errors that are genuinely separate from the input scope get appended to the inventory as new items, not silently absorbed.
   - If you genuinely cannot resolve an item (ambiguous spec, missing access, requires a user decision): write a `Deferred` record with the specific blocker. Do **not** skip it.
5. **Final full re-run** (mandatory, not optional): Run the original failing check(s) on the full scope that produced the input — e.g. `pnpm test`, `pnpm lint`, `tsc --noEmit`, `pnpm build`. Cite the command and the exit status. If anything still fails, those failures become new inventory items and the loop continues. **You may not emit the closing summary while the original checks still fail**, unless the only remaining failures are explicitly `Deferred` with user-visible reasons.
6. **Reconcile the count**: Verify `len(input) == Fixed + Duplicate + Invalid + Deferred`. State the arithmetic in the closing summary.
7. **Clean up documented issues** (mandatory if the input came from a written source): If any of the inventoried items live in a checked-in document — a `FIND-xxx` queue file, an audit report, a `TODO.md`, an `ISSUES.md`, a launch-readiness checklist, an accessibility report, scout/code-review output saved to disk, GitHub issue body, or any other markdown/text artifact the user is tracking — **remove or check off** every item that ended with disposition `Fixed`. Specifically:
   - Markdown checklist item (`- [ ] …`) → flip to `- [x] …` (or delete if the document is meant to drain to empty).
   - Standalone FIND-xxx / issue block → delete the block entirely, or move it under a `## Resolved` section if the document keeps a history.
   - Numbered list entry → delete and renumber if numbering is load-bearing.
   - Items with disposition `Duplicate`, `Invalid`, or `Deferred` are **not** auto-removed; leave them and annotate inline (`— deferred: <reason>` / `— invalid: <reason>` / `— duplicate of FIX-YYY`) so the document still reflects truth.
   - If you are unsure which document(s) host the input items, ask once before stripping anything; never delete documented content speculatively.
   - Cite the document path(s) you edited in the closing summary so the user can diff them.
8. **Emit a closing summary**: Input size, breakdown by disposition, the final verification command(s) and their exit status, the document(s) updated in step 7, and an `Unresolved` section listing every non-Fixed item with its reason. If `Unresolved` is non-empty, say so plainly — do not bury it.

## Priority rubric

When the list does not come from code-review, map impact using the **same severity scale** as **code-review** so ordering stays consistent:

| Level        | Fix first? |
| ------------ | ---------- |
| **Critical** | Yes—before anything else unless blocked by **Depends on** |
| **High**     | Yes—after Critical and unblocking items |
| **Medium**   | After High unless blocking many downstream errors |
| **Low** / **Note** | Last, unless trivial and unblocks verification |

## Output format (handoff and audit trail)

Primary deliverable is a **completed fix queue**: ordered records so another pass can see what changed without re-reading the whole chat. Do **not** rely on prose alone—each completed item should appear as a record.

### Executive summary (first)

2–4 sentences: input size (how many errors), overall approach (ordering choice), and final verification command(s) with their actual exit status. Immediately follow with the **Disposition tally** (the reconciliation arithmetic from step 6) and the list of **document(s) updated** in step 7. Then the per-fix records.

### Fix record (repeat per inventoried item — every item gets a record)

Use stable IDs: `FIX-001`, `FIX-002`, … in **execution order**. If remediating **code-review** findings, reference the source ID in **Source**. Every inventoried item gets a record — including ones that ended up `Duplicate`, `Invalid`, or `Deferred`.

```markdown
### FIX-XXX — [one-line title]

| Field | Value |
| ----- | ----- |
| **Source** | Raw error text or `FIND-YYY` or tool diagnostic ID |
| **Disposition** | Fixed \| Duplicate of FIX-YYY \| Invalid \| Deferred |
| **Severity** | Critical \| High \| Medium \| Low \| Note (if known) |
| **Location** | `path/to/file.ext` — lines or symbol — narrowest anchor |
| **Symptom** | What failed before the fix |
| **Change** | What was done (minimal description) — or "n/a" for Duplicate/Invalid/Deferred |
| **Verify** | Command run and its actual exit status — or "n/a" for non-Fixed dispositions |
| **Doc updated** | Path of the documented-issue file edited (e.g. `docs/findings.md:42`) — or "n/a" if the input was not from a checked-in doc |
| **Regressions** | None \| brief note if new issues appeared and how resolved |
| **Depends on** | None \| FIX-ZZZ (if this fix required a prior fix) |
| **Reason** | Required for Duplicate / Invalid / Deferred — what blocks resolution or why the item is moot |
```

**Notes** (optional): edge cases, files touched, follow-up risks.

### Closing summary (last — mandatory structure)

End the response with these sections in this order. They are not optional:

```markdown
## Disposition tally
- Input items: N
- Fixed: A
- Duplicate: B
- Invalid: C
- Deferred: D
- Reconciliation: A + B + C + D = N ✅  (must equal — flag explicitly if it does not)

## Final verification
- `<command 1>` → exit 0 (or actual status with output excerpt)
- `<command 2>` → exit 0
(Re-run of the original failing checks on full scope. If any non-zero, list each remaining failure and either resolve it or move it to Unresolved.)

## Documents updated
- `path/to/findings.md` — checked off / removed FIX-001, FIX-003, FIX-007
- `docs/launch-readiness-checklist.md` — checked off FIX-005
(Or "None — input was not from a checked-in document.")

## Unresolved
- FIX-XXX — <one-line reason>
- FIX-YYY — <one-line reason>
(Or "None — every input item is Fixed." Never omit this section; an empty Unresolved is itself the success signal.)
```

### YAML block (optional, for tooling)

After the markdown records, append one fenced `yaml` block:

```yaml
fixes:
  - id: FIX-001
    source: "FIND-003"
    location: "src/auth.ts:validateToken"
    depends_on: []
```

Omit optional keys when empty.

### Ordering rules

1. Respect **Depends on** from FIND records or obvious build order (e.g. types before tests that only failed due to types).
2. **Critical/High** before Medium/Low unless a lower item unblocks many others.
3. **One fix record = one coherent change**; split multi-file work only when it is still one logical fix with one verification.

### Rules

- **Location** must be specific enough to open the right place in an editor.
- **Respect the decision records.** If the repo has `docs/adr/`, check the ADR
  covering the code a fix touches. A fix that would contradict an `active`
  decision or deliberate omission is not applied — record the item `Deferred`
  citing the ADR entry, for the human to either withdraw the item or supersede
  the decision. An item that merely re-litigates a documented omission is
  closed as invalid with the citation.
- **Verify** must name a real check—same spirit as code-review’s **Verify** field — and must have actually been run, with its actual exit status cited.
- Do not mark an item complete until **Verify** passes for that step.
- Distinguish **hypothesis** fixes (unclear root cause) in **Notes**—confirm before moving on.
- **Audit IDs stay out of source.** Track FIX/FIND/LR IDs only in this skill's markdown output, the PR description, and the commit message. The code itself must not gain `// FIND-xxx`, `// FIX-xxx`, `// LR-xxx`, `(FIND-xxx)` parentheticals in test names, or any equivalent — those tokens rot fast and the fix is already in the diff.
- **Every inventoried item gets a record.** Silent omission is a skill failure even if the item turned out to be invalid or duplicate.
- **Every Fixed item that came from a checked-in document must update that document** (check off, remove, or move to Resolved). Cite the path in **Doc updated**. Forgetting this leaves the user with a stale tracker that re-pages issues you already closed.
- **Final full re-run of the original failing check is mandatory** before the closing summary. Per-item verification is necessary but not sufficient — the whole-scope re-run catches regressions and missed items.
- **Do not write the finding ID into a source-code comment.** When a fix needs an explanatory comment, keep the substantive *why* (constraint, invariant, attack vector) but strip the bare `FIND-xxx` / `FIX-xxx` / `SA-xxx` / `SEC-xxx` identifier — it belongs in the PR description, commit message, and queue document, not in the code where future readers cannot resolve it. Example — ❌ `// FIND-021: gate cookie-authed POST against cross-origin abuse` → ✅ `// Gate cookie-authed POST against cross-origin abuse`. Pre-existing FIND-xxx comments in the codebase predate this rule and are **not** subject to a sweep — only avoid adding new ones.

## When depth is limited

If the user provides incomplete logs or missing repo context: state assumptions, fix what is actionable, and **explicitly defer** the rest with `Deferred` records that name what is needed to close them. "Limited depth" is never a license to silently drop items — it just shifts them from `Fixed` to `Deferred` with a reason. The Unresolved section in the closing summary then makes the gap visible to the user.
