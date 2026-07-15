---
id: workflow-model-routing
title: "Model routing and verification policy"
---

# Model routing and verification policy

**Objective: complete coding work as quickly as possible without reducing
correctness.** Use the fastest model that can reliably perform each stage of a
task; reserve stronger, slower models for work that requires substantial
judgment, complex reasoning, or high-confidence verification. Do not use a
top-tier model for an entire workflow when a faster model can perform most of
the work and a stronger model can verify the result.

The default workflow:

```
Fast model performs discovery and mechanical work
        ↓
Capable implementation model makes or assembles the change
        ↓
Strong model verifies high-risk or ambiguous decisions
        ↓
Automated tests provide final objective validation
```

## 1. Core routing principle

Choose a model based on the **reasoning difficulty of the current step**, not
the overall importance of the project. A task may contain both easy and
difficult stages. For example, an authentication bug fix:

- Fast model: search for the error message, identify relevant files, trace
  direct call sites, run tests, collect logs.
- Strong model: determine the root cause when multiple systems interact,
  evaluate authorization implications, review the proposed fix, verify that no
  security boundary is weakened.

Do not assign the entire authentication task to the strongest model merely
because authentication is important. **Route each subtask independently.**

## 2. Model tiers

Exact model names differ between providers and change over time; route by
capability tier. In Claude Code the tiers map to the agent-frontmatter model
aliases:

| Tier | Alias | Role |
|------|-------|------|
| Tier 1: fast | `haiku` | deterministic, mechanical, searchable work |
| Tier 2: capable | `sonnet` | normal implementation, the default build tier |
| Tier 3: strong | `inherit` (the session model) | ambiguity, architecture, trust boundaries, high-confidence verification |

`inherit` rides whatever model the session runs, which is the strongest tier
the operator chose for this run: that is the ceiling, and verification always
runs at it.

### Tier 1: fast model

Suitable work: repository searching, file discovery, locating symbols and call
sites, reading logs, summarizing files, collecting relevant code snippets,
identifying existing tests, running commands and reporting output, formatting,
renaming, straightforward boilerplate, repetitive changes, generating test
fixtures from an established pattern, updating types after an already-decided
interface change, implementing an exact specification with no meaningful
ambiguity, comparing a diff against a checklist, checking whether required
files were changed or tests were run.

Tier 1 must not independently make architectural, security, or product
decisions.

### Tier 2: capable coding model

Suitable work: ordinary bug fixes with a clear cause, implementing well-defined
features, adding tests, local refactoring, API integration using established
repository patterns, modifying queries without schema-level design changes, UI
and state-management changes, assembling changes based on Tier 1 findings,
resolving ordinary type and test failures, reviewing low- and medium-risk
diffs, choosing among a small number of conventional implementations.

**Tier 2 is the default implementation tier.** Do not automatically escalate
normal coding tasks to Tier 3.

### Tier 3: strong reasoning model

Suitable work: ambiguous root-cause analysis, architecture decisions, security
boundaries, authentication and authorization design, payment and billing
logic, destructive data operations, database migration strategy, concurrency
and race conditions, distributed-system consistency, complex caching or
performance problems, changes spanning several services with unclear
ownership, reviewing a high-risk implementation, resolving disagreement
between lower tiers, evaluating tradeoffs where several solutions are
plausible, verifying that hidden edge cases have been considered.

Tier 3 should usually review a concise evidence package rather than
rediscovering the entire repository.

## 3. Clear boundary for fast-model work

A lower tier may perform a task without escalation when **all** of the
following are true:

1. The desired behavior is explicitly defined.
2. The relevant files or subsystem can be identified.
3. The change follows an existing repository pattern.
4. There is little or no architectural choice.
5. Failure can be detected through tests, types, linting, or direct comparison.
6. The task does not alter a sensitive trust boundary.
7. The change can be reviewed as a limited diff.
8. The model does not need to infer undocumented product intent.

Examples: add a field to an existing form using the same pattern as other
fields; rename a GraphQL field and update all known call sites; add
loading-state coverage to an existing component test; find every direct caller
of a function; run the failing test, capture the error, and identify the first
project-owned stack frame; update five resolvers to use an already-approved
helper.

## 4. Mandatory escalation boundary

Escalate to a stronger model when one or more of these are true. Escalation is
limited to the uncertain or high-risk portion of the task: do not transfer the
mechanical work along with it.

- **Ambiguity**: expected behavior is unclear; several plausible root causes
  remain after targeted investigation; the repository contains conflicting
  patterns; the specification conflicts with current behavior; the task
  requires inferring product intent; a fix depends on undocumented assumptions.
- **Architecture**: a new cross-cutting abstraction; multiple services or
  packages need redesigned interfaces; ownership of data or behavior is
  changing; the decision will constrain future development; materially
  different designs are on the table.
- **Security and data**: authentication or authorization rules are changing;
  access to private data could be widened; encryption, secrets, tokens, or
  session handling are involved; user data may be deleted, overwritten, or
  exposed; payment, subscription, billing, or entitlement logic is changing; a
  migration may lose or corrupt data.
- **Concurrency and systems**: race conditions are possible; idempotency
  matters; retries could duplicate work; multiple workers modify the same
  state; cache consistency matters; ordering or transactional behavior is
  unclear.
- **Verification**: tests cannot adequately verify the change; the lower tier
  cannot explain why the change is correct; the diff is unexpectedly large;
  the implementation diverges from established patterns; two models produce
  conflicting conclusions; repeated targeted fixes do not resolve the issue.

## 5. Default multi-stage workflow

**Stage A: fast discovery (Tier 1).** Locate relevant files, search exact
identifiers, trace direct dependencies, find related tests, reproduce the
failure, collect logs and stack traces, summarize current behavior, identify
existing implementation patterns. Expected output is a compact evidence
package (section 8), not an architectural essay.

**Stage B: route based on findings.** Classify the task: mechanical with an
obvious change and existing pattern → Tier 1 implementation; ordinary coding
judgment with a clear root cause and local scope → Tier 2; ambiguous root
cause, an escalation boundary crossed, or risk uncontrollable by ordinary
tests and review → Tier 3.

**Stage C: implementation.** The implementer receives only: the task and
acceptance criteria, relevant files, discovery findings, constraints, required
validation commands, and unresolved uncertainties. It should verify the
discovery evidence, make the smallest correct change, add or update targeted
tests, run focused validation, and produce a concise diff summary. Do not
force it to repeat repository-wide discovery unless the evidence package is
insufficient.

**Stage D: strong-model verification** (high-risk, ambiguous, or structurally
significant changes). The verifier reviews the task requirements, discovery
evidence, final diff, relevant surrounding code, and test results, and
answers:

```
## Verdict
Approve / Approve with minor issues / Changes required
## Correctness
Does the implementation satisfy the requested behavior?
## Missed cases
Are there important scenarios not covered?
## Risk review
Could the change create security, data, concurrency, or regression risks?
## Verification quality
Do the tests actually prove the intended behavior?
## Required changes
Only concrete, actionable issues.
```

The verifier does not rewrite the implementation absent a concrete issue, and
does not request changes on stylistic preference alone.

**Stage E: automated validation.** Targeted unit tests during implementation,
package-level type checking, linting of changed files, integration tests for
changed boundaries, broader tests when the affected scope requires them. A
model review never replaces executable validation.

## 6. Fast model as evidence collector

Time-consuming mechanical work is delegated down, not up: searching hundreds
of files, locating symbol references, reading repetitive logs, categorizing
test failures, identifying which failures are new, compiling changed
interfaces, generating a call graph, checking consistency across many files,
updating repetitive call sites, running independent test commands, comparing
outputs before and after a change.

Bad handoff up: "Investigate this repository and decide whether the fix is
correct." Good handoff up:

```
Review the proposed fix using this evidence:
- Failing behavior: ...
- Root-cause hypothesis: ...
- Relevant files: ...
- Changed diff: ...
- Tests run: ...
- Remaining uncertainty: ...
Focus only on whether the hypothesis and fix are correct.
```

## 7. Verification instead of duplication

A stronger model verifies lower-tier work without repeating every step. It may
trust mechanical facts backed by exact file references, command output, test
results, code excerpts, or a visible diff. It independently inspects only: the
central decision point, security-sensitive paths, assumptions that affect
correctness, edge cases not covered by tests, and claims not supported by
evidence. Do not ask the strong model to reread the repository unless the
evidence is contradictory or incomplete.

When assigning verification, state explicitly:

```
Do not repeat broad repository discovery.
Use the supplied evidence as the starting point.
Independently inspect only the code necessary to validate:
- the root-cause claim
- the correctness of the changed logic
- sensitive edge cases
- the adequacy of the tests
Do not rewrite the solution unless you identify a concrete issue.
```

When assigning implementation after fast-model discovery, state:

```
Do not repeat completed searches unless the evidence appears incorrect or
insufficient. Verify the central claim, then proceed with implementation.
```

## 8. Standard handoff format

Every lower tier handing work up uses:

```
## Task
The exact requested behavior.
## Current behavior
What the system currently does.
## Relevant files
Only the files directly involved.
## Evidence
Code paths, logs, tests, or command output supporting the findings.
## Proposed change
A concise explanation of the implementation.
## Diff summary
Files changed and the purpose of each change.
## Validation performed
Commands actually run and their results.
## Remaining uncertainty
Only unresolved questions that could affect correctness.
## Review request
The specific judgment needed from the stronger model.
```

## 9. Task decomposition rules

Split tasks by **reasoning type**, not by technology. Good: Tier 1 locates all
places entitlement is read and lists existing tests; Tier 2 implements the
already-defined helper; Tier 3 reviews whether the helper preserves
authorization boundaries; Tier 1 runs the affected tests and summarizes
failures. Bad: "Tier 1 handles frontend, Tier 2 backend, Tier 3 database": a
frontend task may need Tier 3 judgment while a database update is completely
mechanical.

## 10. Confidence-based escalation

State confidence only when uncertainty affects routing:

- **High**: cause and solution directly supported by code or test evidence →
  continue at the current tier.
- **Medium**: likely cause supported, one meaningful assumption remains →
  continue with a targeted check, or request a focused review from the next
  tier.
- **Low**: several explanations remain plausible, or evidence conflicts →
  escalate before implementing a risky fix.

Escalate on unresolved technical uncertainty, never merely because a model
used cautious language.

## 11. Risk-based review requirements

| Risk | Examples | Workflow |
|------|----------|----------|
| Low | copy changes, style adjustments, isolated test additions, local type corrections, mechanical renames | Tier 1 or 2 implementation → targeted tests. No Tier 3 review. |
| Medium | ordinary business logic, local API behavior, state-management changes, query modifications, shared utilities | Tier 1 discovery → Tier 2 implementation → Tier 2 review, or focused Tier 3 verification when ambiguity remains → targeted + package-level tests. |
| High | authentication, authorization, payments, migrations, destructive operations, concurrency, cross-service consistency | Tier 1 evidence collection → Tier 2 or 3 implementation → independent Tier 3 verification → targeted, integration, and broader validation. |

High risk does not mean every search and file edit is performed by Tier 3.

## 12. Reviewer escalation rules

A reviewer requests escalation only when: a concrete correctness problem is
identified; a security or data risk is unresolved; the root-cause explanation
does not match the code; tests fail to exercise the changed behavior; the
implementation depends on an unsupported assumption; or the diff crosses a
previously unrecognized architecture boundary.

Never because: another naming style is preferred, a different valid
implementation exists, optional refactoring could improve elegance, the
reviewer would have written it differently, or exhaustive certainty is
impossible.

## 13. Routing decision table

| Work item | Default tier | Escalate when |
|-----------|--------------|---------------|
| Search files and symbols | Tier 1 | results are contradictory |
| Summarize existing code | Tier 1 | interpretation affects architecture or security |
| Run commands, collect output | Tier 1 | output requires complex diagnosis |
| Repetitive edits | Tier 1 | pattern is inconsistent or behavior changes |
| Exact-spec implementation | Tier 1 or 2 | specification has hidden ambiguity |
| Ordinary bug fix | Tier 2 | root cause is uncertain or spans systems |
| Test creation | Tier 1 or 2 | correct behavior itself is unclear |
| Local refactor | Tier 2 | public interfaces or architecture change |
| Architecture design | Tier 3 | never delegate the final decision to Tier 1 |
| Authentication design | Tier 3 | mechanical implementation may still use lower tiers |
| Authorization review | Tier 3 | evidence collection may use Tier 1 |
| Migration strategy | Tier 3 | migration code generation may use Tier 1 or 2 |
| Concurrency analysis | Tier 3 | reproduction and logs may use Tier 1 |
| Final low-risk review | Tier 1 or 2 | unexpected complexity appears |
| Final high-risk review | Tier 3 | always |
| Test execution | Tier 1 or tools | failures reveal ambiguous root causes |

## 14. How the DevByAlex agents map to the tiers

The plugin's agents carry their tier in frontmatter (`model:`); orchestrators
(`dev-goal`, `feature-loop`, `feature-builder`) route work between them.

| Agent | Tier | Notes |
|-------|------|-------|
| `explorer` | 1 (`haiku`) | discovery, evidence collection, test running. Must not make architecture decisions, unsupported root-cause claims, or broaden scope. |
| `feature-implementer` | 2 (`sonnet`) | must escalate (report, not decide) when evidence does not support the claimed cause, a sensitive boundary is affected, or a new architecture decision is required. |
| `test-author` | 2 (`sonnet`) | escalates when correct behavior itself is unclear. |
| `design-critic` | 2 (`sonnet`) | judges screenshots against explicit rules, wireframes, and tokens: defined-criteria review. |
| `feature-validator` | 3 (`inherit`) | the per-feature verification gate: security and logic review is always strong. Verifies from the evidence package; does not redo mechanical work. |
| `integration-validator` | 3 (`inherit`) | the whole-repo verification gate; same verification-not-duplication rule. |
| `feature-builder` | router (`inherit`) | routes each step per this policy; holds reports, not diffs. |

The lanes already encode risk: `/dev-tweak` entries are low-risk by
qualification (Tier 1 or 2 end to end), `/dev-todo` entries are medium
(Tier 2 with focused Tier 3 verification on ambiguity), `/dev-auth` and
anything touching the escalation boundaries above are high (independent
Tier 3 verification always). The `security-first` invariant is unchanged:
routing lowers the cost of mechanical work, never the strength of the gates.

## 15. Default routing algorithm

For each unit of work:

1. Mechanical, repetitive, searchable, or directly testable? → Tier 1.
2. Ordinary coding judgment following established patterns? → Tier 2.
3. Ambiguity, architecture, trust boundaries, data safety, concurrency, or
   hard-to-test behavior? → Tier 3.
4. Can Tier 1 collect evidence before Tier 2 or 3 reasons about it? Usually
   yes → delegate evidence collection first.
5. Can a stronger model verify from a concise diff and evidence package
   instead of performing the whole task? Usually yes → verification-only pass.
6. Do automated checks adequately establish correctness? Yes → do not escalate
   merely for reassurance.
7. Did the task cross an escalation boundary during implementation? → pause
   the risky decision and escalate only that portion.

**The one-paragraph policy:** use fast models for search, evidence collection,
command execution, repetitive edits, and other deterministic work. Use a
balanced coding model for normal implementation. Use the strongest model only
for ambiguous reasoning, architecture, sensitive trust boundaries, complex
system behavior, and independent verification of high-risk changes. Stronger
models verify concise evidence and diffs rather than repeat completed
mechanical work. Escalate only the uncertain or high-risk portion of a task,
and use automated tests as the final correctness gate.
