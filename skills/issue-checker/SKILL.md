---
name: issue-checker
description: >-
  Verifies whether a claimed issue is real and/or still present. Bidirectional:
  use it to validate that a reported bug, finding, or vulnerability actually
  exists before fixing it (avoid wasted work on phantom issues), and to confirm
  that a fix truly resolved an issue afterwards (avoid declaring victory on a
  fix that didn't land). Each claim gets a verdict: PRESENT, NOT-PRESENT, or
  INCONCLUSIVE: backed by reproducible evidence (code citations, command
  output, test result), never by "looks fine" or "looks fixed". Use when the
  user asks to verify a bug report, double-check a fix, audit FIND-xxx items
  before remediation, regression-check after a merge, or when they say "is
  this actually broken?", "did that fix work?", "is this finding real?", or
  "confirm this is/isn't an issue".
---

# Issue checker

## Goal

Every claim, "this is broken" and "this is fixed" alike, gets a verdict backed
by evidence someone else can re-run, so no work goes into phantom issues and no
fix is declared done that didn't land.

## Done when

- **The mode is stated:** `validate-claim` (before fixing a bug report,
  `FIND-xxx`, security report or "this is broken") or `verify-fix` (after a
  fix, auditing a `FIX-xxx` record, a post-merge regression check), inferred
  from context when not given.
- **Each claim is restated** as a testable proposition: what is alleged,
  where (`path:line`, route, symbol or screen), under what conditions (input,
  role, state, env) and the observable outcome that would mean present or
  fixed. A claim that can't be narrowed is INCONCLUSIVE with what's missing.
- **Each claim has one `### CHECK-XXX: title` record,** numbered in the order
  given, with Mode; Source (the raw claim, `FIND-`/`FIX-` id or tracker link,
  so the chain stays auditable); Claim; the narrowest Location; State checked
  (branch, commit, env, fixtures, DB); Method (test, executed-repro or
  static-check); Evidence (command or test and its decisive output); Verdict;
  Confidence; Root cause status in verify-fix (addressed, symptom-only,
  unknown); and the next step (reopen, close, re-fix the root cause, or what
  more is needed). Optional notes cover adjacent issues and why a stronger
  check wasn't possible.
- **Verdicts are the strongest the evidence supports, and no stronger:**
  - PRESENT: reproduced by a failing test, a reproducing command or
    unambiguous static proof.
  - NOT-PRESENT: a passing check that exercises the exact alleged path, or
    proof the construct doesn't exist, scoped to what was exercised.
  - PARTIALLY-PRESENT (verify-fix): the original repro passes but a sibling or
    root-cause path still fails, or the fix added a related defect.
  - MISDIAGNOSED (validate-claim): a real issue, but not the one claimed, with
    evidence of both.
  - INCONCLUSIVE: with the list of what would settle it (access, fixtures,
    credentials, repro steps, environment).
- **Reported:** a 2 to 4 sentence summary first (mode, claims checked,
  verdict counts, the state checked against and anything blocking), then the
  records, then an optional `yaml` block (id, mode, source, verdict,
  confidence, location, next_step).

## Decisions (and why)

- **Both sides are suspect.** Reports can be misread, stale, fixed elsewhere
  or environmental; fixes can compile without touching the root cause or patch
  one path only. Why: the verdict has to stand either way.
- **Reproduce, don't reason.** Prefer an existing or new minimal test (fails
  then passes is the strongest evidence), then a direct run (`curl`, script,
  query, function call), and static evidence only when execution is
  impossible or the claim is about presence in source, saying so. Why: reading
  sets up a hypothesis; running confirms it.
- **Confidence follows the method:** high only when execution was decisive,
  medium when static evidence was decisive and execution impossible, low when
  reasoning filled a gap (named). Why: a reader needs to know how hard to lean
  on it.
- **Hiding a symptom is not a fix.** A fix that leaves the root cause is
  PARTIALLY-PRESENT. Why: the bug comes back on the next path.
- **Record the state.** Branch, build, migrations, env and cache can make an
  issue appear or vanish with no code change.
- **Where it fits:** validate `FIND-xxx` claims from `code-review` or `scout`
  before `fix-errors` when the source is doubtful, and verify `FIX-xxx`
  records afterwards against the original claim, not just their listed
  Verify step.

## Hard rules

- One claim, one record, one verdict; never bundle.
- Conflicting evidence (a test passes, a repro fails) is INCONCLUSIVE with the
  next check that would break the tie, never the friendlier reading.
- Don't fix while checking: log a real issue and leave it to `fix-errors`. The
  one exception is a one-line unblocker (a missing fixture) needed to run the
  check, noted in the record.
- Missing access or context never turns a hunch into PRESENT or NOT-PRESENT.
