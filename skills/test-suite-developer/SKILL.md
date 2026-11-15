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

## Goal

Every observable outcome of the target surface (a module, route, feature,
package or the whole app) is asserted by a test that would fail if the
behavior regressed, and the suite passes for the right reason. Coverage
percentage is not the measure.

## Done when

- **Surface mapped:** every entry point with observable behavior (server
  routes, jobs, CLI, webhooks, cron, consumers; client flows, stateful
  components, hooks, reducers, navigation; library exports; migrations and
  schema invariants), each with its inputs (request, props, args, env, DB
  state) and observable outputs (response, DOM, side effect, log, DB change,
  event).
- **Outcomes enumerated** per entry point across: happy path per valid input
  class; validation (missing, wrong type, out of range, empty, whitespace,
  unicode, duplicates); authn and authz (unauthenticated, wrong role or owner,
  expired or revoked token); state preconditions (empty, populated, stale
  cache, partial, already exists, not found); concurrency (double submit,
  races, retries, idempotency keys); external dependencies (timeout, 4xx, 5xx,
  malformed, rate limit); every error branch; invariants (uniqueness,
  ordering, referential integrity); side effects fired or not (email, webhook,
  row, analytics); security boundaries (injection, SSRF, path traversal, IDOR,
  mass assignment, secrets in logs or responses); and regression anchors from
  past bugs in code, git log or context.
- **A plan precedes any test code,** even for a small target: `### TEST-XXX:
  "entry: outcome under condition"` entries, foundational first, each with
  Level, Entry point, Given, When, Then, the outcome rows it covers, Depends
  on and File, plus optional notes on mocks, nondeterminism and fixtures, and
  a `yaml` summary (id, level, entry, outcome, file).
- **Tests written and run:** each passes for the right reason (a test that
  would also pass against a broken implementation is rewritten, with a brief
  why for any non-trivial one), flakes fixed at the cause (unmocked time or
  randomness, unordered async, leaked state), and the full project suite run
  once more at the end for cross-test interference.
- **Reported:** planned, implemented and skipped counts by level; outcomes
  newly covered; outcomes still uncovered and why; bugs found (file:line,
  symptom, suggested fix); and testability findings with the design change
  that would unblock each.
- **When handed a `FIND-xxx` queue** (test-gap or bug findings from
  `code-review`, `scout` or an orchestrator), each test-gap finding seeds the
  outcome list for its surface and maps to its `TEST-xxx`. For each security,
  logic, contract or reliability finding, a test is written that fails on the
  current code for the reason the finding predicts (run to confirm) and will
  pass once its Fix intent lands, recorded as `TEST-xxx reveals FIND-yyy`;
  notes, maintainability-only and docs-only findings are skipped with a reason.
  Gaps the queue didn't name are covered too, and bugs found on the way become
  new findings in the same `FIND` shape with fresh ids and a failing test
  each. The output is the plan with pass or fail status on current code and
  the merged queue, each finding cross-referenced to its revealing test.
- **Partial visibility** (a diff, a snippet, external dependencies): mapping
  and the plan go as far as the visible surface allows, and the report names
  the files, fixtures, services or credentials needed to finish.

## Decisions (and why)

- **Write from the spec, not the code.** Every test is a sentence a product
  manager would recognize ("when the user does X with state Y, Z happens").
  Why: tests that mirror the implementation freeze its bugs.
- **Lowest level that proves the outcome.** Unit for pure functions,
  reducers, parsers and schemas; integration for routes, DB access and
  coordinating services, on the real test DB where the project has one;
  component for one UI component's states; E2E only for golden paths and the
  top two or three critical failures; contract for wire shapes; snapshot only
  where the exact output is the contract, never arbitrary markup. A higher
  level only when the outcome is the interaction between layers. Why: higher
  levels are slower and flakier.
- **One outcome per test, named for the outcome** (`"returns 401 when the
  session is expired"`), Arrange, Act, Assert, inputs with distinct outputs
  parametrized into a table. Why: one failure points at one behavior.
- **Assert observable effects and use real dependencies where the project
  supports them** (honoring stub modes for AI and third parties). Why:
  spying on private helpers or stubbing everything tests the code calling
  itself.
- **Untestable code is a finding.** Why: contorting a test around heavy mocks
  or private access hides a design problem.
- **Project conventions win** (framework, layout, stub modes, DB strategy,
  lint, `CLAUDE.md` testing notes): read a nearby test first.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- A test that fails on a real bug is never weakened to pass; the bug is
  surfaced, and never silently fixed here (the user decides, or `fix-errors`
  owns it).
- No retry loops around flakes, and no test kept only for coverage.
