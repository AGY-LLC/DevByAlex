---
name: test-suite-developer
description: >-
  Builds a comprehensive test suite driven by expected outcomes, not coverage
  percentages. Maps every user-visible behavior, API contract, and invariant
  in the target surface, enumerates success paths, failure paths, edge cases,
  and security boundaries, then writes the tests and runs them until they pass.
  Use when the user asks to "add tests", "cover X", "build a test suite",
  "ensure every outcome is tested", harden a module before release, close
  test-gap findings from code-review, or audit whether existing tests actually
  exercise the behaviors the code promises.
---

# Test suite developer

## Mindset

- **Outcomes, not lines.** Start from "what must happen when a user / caller / scheduler does X?" — never from coverage percentages. 100% line coverage with no assertion on the observable outcome is worthless.
- **A test is a claim about behavior.** Every test should correspond to a sentence you could tell a product manager: "when the user does X with state Y, Z happens." If you can't phrase it, don't write it.
- **Assume the code is wrong.** Write the test from the spec/outcome, not from reading the implementation. If you write tests by mirroring the code, you freeze in its bugs.
- **Exhaustive on outcomes, minimal on duplication.** Every distinct expected outcome gets a test. But two tests that exercise the same outcome through different inputs are one test with a parametrized table.
- **Untestable code is a finding, not a workaround.** If a behavior can't be tested without massive mocking or private-member access, flag it. Don't contort the test to paper over a design issue.

## Workflow

Run these phases in order. Do not skip phase 1 — a test suite without a plan becomes duplicative and gap-ridden.

### 1. Map the surface

Identify the target (a module, a route, a feature, a package, or the whole app) and enumerate every entry point that has observable behavior:

- **Server:** HTTP routes, jobs, CLI commands, webhooks, cron handlers, pubsub consumers.
- **Client:** user flows, components with state, hooks, reducers, navigation transitions.
- **Library:** public exports.
- **Data:** migrations, schema invariants, triggers.

For each entry point, list the **inputs it accepts** (request shape, props, args, env, DB state) and the **observable outputs** (response, DOM, side effect, log, DB mutation, emitted event).

### 2. Enumerate expected outcomes

For each entry point, build an **outcome table** covering at minimum:

| Axis | Examples of what to enumerate |
| --- | --- |
| **Happy path** | Each valid input class → expected output |
| **Validation / contract** | Missing fields, wrong types, out-of-range, too large, too small, empty, whitespace, unicode, duplicates |
| **Authn / authz** | Unauthenticated, wrong role, wrong owner, expired token, revoked token |
| **State preconditions** | Empty DB, populated DB, stale cache, partial state, already-exists, not-found |
| **Concurrency** | Duplicate submits, races on the same row, retries, idempotency keys |
| **External deps** | 3rd-party timeout, 5xx, 4xx, malformed response, rate limit |
| **Failure paths** | Each `throw`, each error branch, each non-2xx response |
| **Invariants** | Must-always-be-true claims (uniqueness, ordering, monotonicity, referential integrity) |
| **Side effects** | Email sent / not sent, webhook fired / not fired, row created / not, analytics event emitted |
| **Security boundaries** | Injection (SQL/HTML/shell), SSRF, path traversal, IDOR, mass assignment, secret leakage in logs/responses |
| **Regression anchors** | Any past bug referenced in code, git log, or user-provided context |

Each row of the outcome table becomes one or more test cases in phase 3.

### 3. Produce the test plan

Before writing any test code, emit a **test plan** the user can review. Use stable IDs `TEST-001`, `TEST-002`, … ordered so foundational tests land first (happy paths before edge cases within a given entry point; simpler entry points before complex ones).

Use this template per plan entry:

```markdown
### TEST-XXX — [one-line title: "route/function: outcome under condition"]

| Field              | Value                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Level**          | unit \| integration \| component \| e2e \| contract \| snapshot                             |
| **Entry point**    | `path/to/file.ext` — symbol, route, or component                                            |
| **Given**          | Preconditions (state, inputs, fixtures)                                                     |
| **When**           | The action under test (call, request, click, event)                                         |
| **Then**           | Observable outcome to assert (return value, status + body, DOM state, side effect, log)    |
| **Covers outcome** | Which row(s) from the outcome table this exercises                                          |
| **Depends on**     | None \| TEST-YYY (fixtures, helpers, or other tests that must exist first)                  |
| **File**           | Proposed test file path                                                                     |

**Notes** (optional): mocks needed, nondeterminism to tame, fixtures to add.
```

After the plan, append a YAML summary for tooling:

```yaml
plan:
  - id: TEST-001
    level: integration
    entry: "server/src/app/api/story/route.ts:POST"
    outcome: "happy-path create returns 200 with story id"
    file: "server/src/app/api/story/__tests__/route.test.ts"
```

### 4. Choose the right level for each test

Default rules:

- **Unit** — pure functions, reducers, format/parse helpers, validation schemas. Fast, no I/O, no mocks (or very few).
- **Integration** — HTTP routes, DB access, service classes that coordinate multiple units. Use the real test DB when the project provides one (respect project rules like "no mocked DB").
- **Component** — a single UI component's state transitions and rendered output.
- **E2E** — whole user flows across multiple screens/routes, only for golden paths and the top 2–3 critical failure modes. E2E tests are expensive; don't drown here.
- **Contract** — API request/response shape, wire format stability.
- **Snapshot** — only for outputs where the exact shape *is* the contract (serialized payloads, generated code, rendered markdown). Never for arbitrary component markup.

When two levels could cover an outcome, prefer the **lower** level unless the outcome is specifically about the interaction between layers.

### 5. Write the tests

Implement the plan in order. For each test:

1. Follow the project's test conventions (framework, file location, naming) — read a nearby existing test first.
2. **Arrange–Act–Assert** structure, one behavior per test. If a test has more than one `expect`/`assert` block asserting unrelated things, split it.
3. **Name tests by outcome**, not by function name. `"returns 401 when session is expired"` beats `"testGetUser"`.
4. **Use real dependencies where the project supports it.** Honor rules like stub-mode for AI/3rd-party calls.
5. **Assert on observable effects**, not on internal implementation details. Don't spy on private helpers to prove a public method works — assert the public outcome.
6. **Parametrize** tables of inputs with distinct expected outputs instead of copy-pasting tests.

### 6. Run and iterate

After writing each batch (or each file):

1. Run the suite. Every test you wrote must **pass for the right reason** — a passing test that would also pass against a broken implementation is a bad test. Briefly justify why each non-trivial test fails if the behavior regresses.
2. If a test fails because of a **real bug**, stop and surface it as a finding — do not weaken the test to make it pass.
3. If a test is flaky, fix the flake (usually: unmocked time, unmocked randomness, unordered async, leaked state between tests). Never retry-loop around flakes.
4. After the whole plan is implemented, run the full project test suite one more time to catch cross-test interference.

### 7. Report

Final report to the user:

- Counts: planned vs implemented vs skipped, by level.
- List of **outcomes newly covered**.
- List of **outcomes still uncovered** and why (hard to test, needs design change, needs fixture/infra work).
- **Bugs discovered** while writing tests (each one a finding with file:line, symptom, suggested fix — do not silently fix bugs without flagging).
- **Testability findings**: modules that resisted testing and the design change that would unblock them.

## Rules

- Do **not** write tests that only assert the code calls itself (mock-heavy tests where every meaningful thing is stubbed). If you can't assert real behavior, rethink the test level.
- Do **not** chase coverage numbers. If coverage goes up but no new outcome is asserted, delete the test.
- Do **not** skip the plan phase even for "small" targets. Skipping it is how outcomes get missed.
- Respect project conventions absolutely: test framework, file layout, stub modes, DB strategy, lint rules. Read an existing test file before writing new ones.
- If the project has `CLAUDE.md` notes on testing, they win over this skill's defaults.
- One test = one outcome. When in doubt, split.
- Never silently fix a bug you discovered via a test. Surface it, let the user decide whether to fix inside this pass or route to a separate fix.

## Handoff

### Standalone / test-gap handoff

When invoked by the `technician` or another orchestrator with a list of
test-gap findings (e.g. `FIND-xxx` with category `test-gap`), treat each
finding as input to phase 2 (outcome enumeration) for that specific surface,
then proceed through phases 3–7 as normal. Map each `TEST-xxx` back to the
originating `FIND-xxx` in the final report.

### Bug-revealing handoff (between code-review and fix-errors)

When invoked by `technician` in the middle of its loop — after `code-review`
has produced a `FIND-xxx` queue and before `fix-errors` runs — you have
**three jobs**, in order:

1. **Write a failing test per bug finding.** For every `FIND-xxx` whose
   category is `security`, `logic`, `contract`, or `reliability` (i.e.
   anything that claims the code is actually wrong), write at least one
   test that:
   - Exercises the exact scenario the finding describes.
   - **Fails on the current code for the right reason** (the observable
     outcome the finding predicts). Run the test to confirm it fails before
     moving on. If the test passes against the buggy code, your test is
     wrong — the finding is not yet pinned down.
   - Will pass once the finding's **Fix intent** is implemented. Do not
     overspecify; assert the outcome, not the mechanism.
   - Record the mapping: `TEST-xxx reveals FIND-yyy` in the plan and the
     final report.

   Skip findings where a failing test is inappropriate (e.g. `Note`,
   pure-maintainability refactors, documentation-only items). Say so in
   the report.

2. **Cover uncovered outcomes.** Run phases 1–5 of the normal workflow
   against the target surface to fill gaps the findings did not name.

3. **Surface independently discovered bugs as new findings.** While writing
   tests, you will often discover additional bugs that `code-review` missed
   (wrong behavior you only noticed because you were enumerating outcomes).
   For each one:
   - Write the failing test that reveals it.
   - Emit a new finding in the same `FIND-xxx` structure `code-review` uses
     (severity, category, location, symptom, impact, fix intent, suggested
     approach, verify). Use fresh IDs that do not collide with the review's
     range.
   - **Do not fix the bug.** `fix-errors` owns remediation. Hand the new
     finding off with its failing test attached.

Final output of a bug-revealing pass:
- The TEST-xxx plan (implemented, with pass/fail status on current code).
- The **merged FIND-xxx queue** = original findings from `code-review` ∪
  newly discovered findings from this phase, each cross-referenced to the
  failing test that reveals it.
- Any testability findings (design changes needed before a bug can be
  pinned down by a test).

## When depth is limited

If the target is only partially visible (a diff, a snippet, a single file with external dependencies): complete phases 1–3 as far as the visible surface allows, and in the final report list explicitly what further access (files, fixtures, running services, credentials) would be needed to finish phases 5–6.
