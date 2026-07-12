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

A bidirectional verification skill. Treats every claim: both "this is broken"
and "this is fixed": as unproven until reproduced or refuted with evidence.

## Two modes (always pick one explicitly)

| Mode | When to use | Question being answered |
| ---- | ----------- | ----------------------- |
| **validate-claim** | Before fixing a reported bug, FIND-xxx item, security report, or user-supplied "this is broken" claim | Is the issue actually present in the current code? |
| **verify-fix** | After a fix, before declaring done; auditing a closed FIX-xxx record; post-merge regression check | Is the issue still present, partially present, or fully gone? |

If the user does not say which mode, infer from context (a fresh bug report →
validate-claim; a recent commit/PR claiming to fix something → verify-fix) and
state the chosen mode in the executive summary so the user can correct you.

## Mindset

- **Both sides are suspect.** A bug report can be wrong (misread, stale, fixed
  on another branch, environmental). A fix can also be wrong (compiles but
  doesn't address root cause, only patches one path, leaves a regression).
- **Reproduce, don't reason.** A code-reading argument that "this can't happen"
  is not evidence. Run the failing path: a test, a curl, a script, a query, a
  manual reproduction. Code-reading is acceptable only when execution is
  genuinely impossible (deleted code path, compile-time invariant) and you say
  so.
- **Cite the narrowest anchor.** Every verdict points at `path:line` or a
  command + output, not "the auth module".
- **Distinguish symptom from root cause.** A fix that hides the symptom while
  leaving the root cause is **partially present**, not gone. Note it.
- **No verdict without evidence.** If you can't reproduce or refute, the
  verdict is **INCONCLUSIVE** with a list of what's missing: never a guess
  dressed up as a confirmation.
- **Beware of stale state.** Branch, build, DB migration, env vars, cache,
  any of these can make an issue appear or disappear without the code
  changing. Record the state you checked against.

## Workflow

Run phases in order. Do not skip phase 1: half the bad verdicts in this skill
come from misunderstanding the claim before checking it.

### 1. Restate the claim

For each issue, write down in one sentence:

- **What is alleged** (e.g. "endpoint returns 200 instead of 401 for
  unauthenticated callers").
- **Where** (`path:line` / route / symbol / screen).
- **Under what conditions** (input, role, state, env).
- **What "fixed" or "present" would look like** as an observable outcome
  (status code, log line, DB row, rendered text, absence thereof).

If the claim is vague ("the login is broken"), narrow it to a testable
proposition before continuing. If it cannot be narrowed, mark INCONCLUSIVE and
list what's missing.

### 2. Pick the cheapest decisive check

Order of preference:

1. **Run an existing test** that exercises the exact behavior, or write a
   minimal new one. A test that fails-then-passes is the strongest evidence.
2. **Execute the path directly**: `curl`, a script, a CLI invocation, a SQL
   query, a fixture-driven function call.
3. **Static evidence**: grep/AST for the exact construct (e.g. missing
   `await`, missing authz check, hard-coded secret) **only** when execution
   is impossible or the issue is a presence/absence claim about source.

Avoid "I read the code and it looks correct" as a sole basis. Reading sets up
hypotheses; running confirms them.

### 3. Gather evidence

Capture, for each check:

- The **command run** (or test name) and its **output** (truncated to the
  decisive lines).
- The **state** the check ran against: branch / commit, env vars touched,
  fixtures, DB state, build version.
- Any **side observations** that change the picture: a different bug
  surfaced, a flaky check, an environment mismatch.

### 4. Render a verdict

Use one of these verdicts. Pick the strongest one the evidence supports: do
not upgrade past what you actually proved.

| Verdict | Meaning | Required evidence |
| ------- | ------- | ----------------- |
| **PRESENT** | Issue reproduced on the current code/state | A failing test, a reproducing command, or unambiguous static proof |
| **NOT-PRESENT** | Issue could not be reproduced; the code/state does not exhibit it | A passing check that exercises the exact alleged path, or proof the alleged construct doesn't exist |
| **PARTIALLY-PRESENT** *(verify-fix only)* | Original symptom is gone but root cause / sibling paths still exhibit it; or the fix introduced a new but related defect | A check showing the original repro is fixed **plus** a check showing a sibling/root-cause path still fails |
| **INCONCLUSIVE** | Could not be confidently confirmed or refuted | List of what's missing: access, fixtures, credentials, repro steps, environment |
| **MISDIAGNOSED** *(validate-claim only)* | Real issue exists, but it is not what was claimed | Evidence of the actual issue + evidence the claimed issue is wrong |

### 5. Stop on conflicting evidence

If two checks disagree (test passes locally, repro script fails), do **not**
pick the friendlier one. Surface the conflict in the record, mark
INCONCLUSIVE, and propose the next check that would break the tie.

## Output format

Primary deliverable is a **verdict log**: one record per claim, with stable
IDs `CHECK-001`, `CHECK-002`, ... in the order issues were given. If the input
is FIND-xxx records (from code-review) or FIX-xxx records (from fix-errors),
preserve the source ID in the **Source** field so the chain is auditable.

### Executive summary (first)

2–4 sentences:

- Which **mode** was run (validate-claim / verify-fix).
- How many claims checked, and the verdict counts (e.g. "3 PRESENT, 1
  NOT-PRESENT, 1 PARTIALLY-PRESENT, 1 INCONCLUSIVE").
- The **state** the checks ran against (branch / commit + any non-default
  env). Anything blocking remaining checks.

### Verdict record (repeat per claim)

```markdown
### CHECK-XXX: [one-line title of the claim]

| Field | Value |
| ----- | ----- |
| **Mode** | validate-claim \| verify-fix |
| **Source** | Raw claim text or `FIND-YYY` / `FIX-YYY` / issue-tracker URL |
| **Claim** | The alleged issue, restated as a testable proposition |
| **Location** | `path/to/file.ext`, line/symbol, narrowest anchor |
| **State checked** | branch / commit / env / fixtures / DB state |
| **Method** | test \| executed-repro \| static-check: what kind of evidence was used |
| **Evidence** | Command run + decisive output, or test name + result, or grep + match/non-match |
| **Verdict** | PRESENT \| NOT-PRESENT \| PARTIALLY-PRESENT \| INCONCLUSIVE \| MISDIAGNOSED |
| **Confidence** | high \| medium \| low: high requires direct execution; low signals you fell back to reasoning |
| **Root cause status** *(verify-fix only)* | addressed \| symptom-only \| unknown |
| **Recommended next step** | Reopen \| Close \| Re-fix root cause \| Need more info: ... |
```

**Notes** (optional): adjacent issues surfaced, environmental caveats, why a
stronger check wasn't possible.

### YAML block (optional, for tooling)

After the records, append a fenced `yaml` block:

```yaml
checks:
  - id: CHECK-001
    mode: validate-claim
    source: "FIND-003"
    verdict: PRESENT
    confidence: high
    location: "src/auth.ts:loginHandler:42"
    next_step: fix
```

Omit empty optional keys.

## Rules

- **One claim, one record, one verdict.** Do not bundle multiple issues into
  one CHECK record even if they live near each other.
- **Evidence must be reproducible.** A future reader (or another agent
  running fix-errors / scout) must be able to re-run the check from what's in
  the record alone.
- **Never upgrade a verdict past the evidence.** A passing test on one path
  is not NOT-PRESENT for the whole feature: scope the verdict to what was
  actually exercised.
- **Confidence is not a vibe.** Set `high` only when execution produced the
  decisive evidence; `medium` when static analysis was decisive but
  execution wasn't possible; `low` when reasoning had to fill a gap (and
  state the gap).
- **Don't fix while checking.** If you discover a real issue mid-check, log
  it and stop: fixing belongs to fix-errors. The exception is a one-line
  unblocker (e.g. missing fixture) needed to even run the check; note it in
  the record.

## Relationship to other skills

- **code-review** produces FIND-xxx claims. Run **issue-checker** in
  `validate-claim` mode against those findings before sending them to
  fix-errors when you doubt the review's accuracy or when the findings came
  from an unfamiliar source.
- **fix-errors** produces FIX-xxx records. Run **issue-checker** in
  `verify-fix` mode against those records to confirm the fix actually
  resolved the original FIND, not just satisfied the listed Verify step.
- **scout** / **technician** loops can call this skill between review and
  remediation passes to drop phantom findings and confirm closures before
  the next iteration.

## When depth is limited

If the repo, branch, credentials, or fixtures needed to reproduce are not
available: state assumptions, run whatever partial checks are possible, and
mark the rest INCONCLUSIVE with an explicit list of what would close them out.
Do not promote a code-reading hunch to NOT-PRESENT or PRESENT just because the
real check is unavailable.
