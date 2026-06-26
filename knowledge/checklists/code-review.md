---
id: checklists-code-review
title: "Code Review Methodology"
summary: "How I review code: assume defects until proven otherwise, trace untrusted data to dangerous sinks, and work a structured per-diff checklist across security, logic, contracts, reliability, and maintainability. The review-side companion to the build-side checklists."
tags: ["checklists", "code-review", "review", "security"]
updated: 2026-05-30
---
# Code Review Methodology

This is the lens I want applied when reviewing a diff, a PR, or a module — not "does it look fine," but "what breaks?" It mirrors how my `/code-review` and `/scout` skills work.

## Stance

- **Assume defects until evidence says otherwise.** The job is to find what's wrong, not to bless what's there.
- **Cite evidence.** Every finding names a `file:line` (or symbol) and says concretely what breaks and under what input. "Looks risky" is not a finding.
- **Trace the data.** Follow every untrusted input — HTTP params/body/headers, query strings, DB rows, file contents, env, third-party responses — to where it reaches a dangerous sink (SQL, shell, HTML, file path, redirect, deserializer, template).
- **Ask the hostile question.** For each path: what happens if the input is empty, null, huge, malformed, malicious, duplicated, or arrives concurrently?
- **Gaps in tests are findings** when the behavior is non-obvious or the risk is real.

## Dimensions to review

- **Security** — injection (SQL/NoSQL/command/template/LDAP), XSS, SSRF, path traversal, unsafe deserialization, authn/authz gaps, IDOR, confused deputy, token/cookie handling, secrets in code or logs, weak/ homegrown crypto, reused IV/nonce, non-constant-time comparisons, unsafe defaults.
- **Logic & correctness** — off-by-one, wrong operator, integer overflow, unit/timezone confusion, null/undefined deref, empty-collection handling, partial failures, retries & idempotency, concurrency races, stale reads, lost updates.
- **Contracts & API** — schema drift, backward-incompatible changes, wrong HTTP status / error shape, half-deployed feature-flag or migration states, rollback behavior.
- **Reliability & ops** — resource leaks (connections, handles, listeners, timers), missing timeouts on outbound calls, unbounded queues/pagination, PII in logs, lazy/missing config validation.
- **Maintainability** — duplicated fragile logic, magic values, unclear state ownership, types that lie, missing tests for the risks above, flaky test patterns, mocks that hide integration bugs.

## What to check on every diff

- [ ] Injection on any user-supplied data (SQL, HTML, shell, template, NoSQL, LDAP)
- [ ] Authn check before business logic; authz/ownership check before acting on a resource (IDOR)
- [ ] XSS — user data rendered without escaping
- [ ] SSRF — outbound request to a user-supplied URL without an allowlist
- [ ] Path traversal — file access from a user-supplied path without normalization
- [ ] Null/undefined dereference and empty-collection handling
- [ ] Off-by-one / wrong comparison / integer overflow on untrusted input
- [ ] Concurrency: two writers, stale read, lost update, missing idempotency on retryable handlers
- [ ] Secrets in code, logs, error messages, or analytics events
- [ ] Errors swallowed or silently logged instead of handled
- [ ] Resource leak on every path including the error path (connection/file/listener/timer)
- [ ] Every outbound network call has an explicit timeout
- [ ] Backward-incompatible contract change or wrong error/status shape
- [ ] Feature flag or DB migration that's safe half-deployed and on rollback
- [ ] Validation: empty, null, wrong type, out-of-range, too large, duplicate
- [ ] Webhook/callback signatures verified; replay-protected; raw body used for signature
- [ ] Flaky test patterns (time, randomness, order-dependence, leaked state)
- [ ] Test gaps for any non-obvious behavior the diff introduces

## Structuring findings

Emit findings as a queue another pass can work through. Order by severity, then by dependency.

- **ID:** `FIND-001`, `FIND-002`, …
- **Severity:** Critical (exploitable security / data loss / guaranteed outage) · High (likely-exploitable / severe logic bug / contract break) · Medium (real bug or gap) · Low (small bug / hardening) · Note (observation / question).
- **Fields:** category (security | logic | contract | reliability | maintainability | test-gap), confidence (confirmed | likely | hypothesis), location (`file:line`), symptom, impact, fix intent, how to verify.

Confirmed criticals first. A plausible-but-unproven finding is labeled `hypothesis`, not asserted as fact.

*See also: [Security Basics](./security-basics.md) | [Production Readiness](./production-readiness.md) | [Lessons Learned](../lessons-learned.md)*
