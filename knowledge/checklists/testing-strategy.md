---
id: checklists-testing-strategy
title: "Testing Strategy"
summary: "How I think about tests: a test is a claim about behavior, so write from the spec not the code, enumerate every distinct outcome (success/failure/edge/security), and parametrize instead of copy-pasting. The methodology layer above the jest/playwright setup docs."
tags: ["checklists", "testing", "test-strategy"]
updated: 2026-05-30
---
# Testing Strategy

The setup mechanics live in [Jest](../stack/jest.md) and [Playwright](../stack/playwright.md). This is the part those docs don't cover: *what* to test and *why*. It mirrors my `/test-suite-developer` skill.

## Philosophy

- **Outcomes, not lines.** 100% coverage with no assertion on an observable outcome is worthless. Coverage is a side effect of testing the right things, never the goal.
- **A test is a claim about behavior:** "when the caller does X with state Y, Z happens." If you can't phrase it that way, you don't yet know what you're testing.
- **Write from the spec, not the code.** Tests mirrored from the implementation freeze its bugs in place. Derive expected outcomes from what the feature is supposed to do.
- **Exhaustive on outcomes, minimal in duplication.** Every distinct outcome gets a test; parametrize over inputs rather than copy-pasting near-identical cases.

## Enumerate the outcomes

For each behavior under test, walk these axes and list the distinct outcomes:

- **Happy path** — each valid input class → expected observable output.
- **Validation / contract** — missing field, wrong type, out-of-range, empty, whitespace, unicode, too large, duplicate.
- **Authn** — unauthenticated, expired/revoked token.
- **Authz** — wrong role, wrong owner (IDOR), access-control violation.
- **State preconditions** — empty DB, populated, not-found, already-exists, stale cache, partial state.
- **Concurrency** — duplicate submit, race on the same row, retry with idempotency key.
- **External deps** — third-party timeout, 5xx, 4xx, malformed response, rate limit.
- **Failure paths** — every throw, every error branch, every non-2xx response.
- **Side effects** — email sent/not, webhook fired/not, row created/not, event emitted/not.
- **Security boundaries** — injection, SSRF, path traversal, IDOR, mass assignment, secret leakage.
- **Invariants** — things that must always be true: uniqueness, ordering, monotonicity, referential integrity.
- **Regression anchors** — any past bug referenced in code, git history, or context gets a test that would have caught it.

## A good suite covers

- [ ] Happy path for each entry point (caller does X → expected observable outcome)
- [ ] Every validation rule
- [ ] Every error path / error code / non-2xx branch
- [ ] Authn boundaries (unauthenticated, expired token)
- [ ] Authz boundaries (wrong owner, IDOR)
- [ ] State preconditions (empty, not-found, already-exists, stale cache)
- [ ] Concurrency (duplicate submit, race, idempotency on retry)
- [ ] External dependency failures (timeout, 5xx, malformed, rate limit)
- [ ] Side effects asserted (email/webhook/row/event happened or didn't)
- [ ] Security boundaries (injection, SSRF, traversal, mass assignment, secret leakage)
- [ ] Invariants / data contracts (uniqueness, ordering, referential integrity)
- [ ] No flakiness-prone patterns (unmocked time, randomness, order-dependence, leaked state)

## Which kind of test

- **Unit** — pure functions, validators, reducers, format/parse. No I/O, minimal mocks.
- **Integration** — HTTP routes, DB access, service classes. Use a real test DB when available; don't mock the database.
- **Component** — a single UI component's state transitions and rendering.
- **E2E (Playwright)** — whole user flows, but only the golden path plus the top 2–3 critical failures. Expensive to write and maintain — reserve for auth, payments, and paths that have broken before.
- **Contract** — request/response shape and wire-format stability.
- **Snapshot** — only where the exact serialized shape *is* the contract.

*See also: [Jest](../stack/jest.md) | [Playwright](../stack/playwright.md) | [Code Review](./code-review.md)*
