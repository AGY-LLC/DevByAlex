---
name: scout
description: >-
  Deep, adversarial audit of a whole repo or a feature's files: partitions the
  code into feature-coherent sections, runs a bad-cop / good-cop debate on each
  so only real defects survive, and compiles them into one IDed FIND-xxx queue
  ready for fix-errors. Use for a deeper alternative to code-review, a
  whole-repo or pre-launch audit, a two-perspective or second-opinion review,
  or when the feature-loop validators call it.
---

# Scout

## Goal

Find the defects a single skeptical pass would miss, and only those, with the
reasoning for each verdict on the record. The result is a `FIND-xxx` queue that
`fix-errors` works without translation and that a later scout run won't
re-litigate. For a quick diff-level review, `code-review` is cheaper.

## Done when

- **A section manifest exists** before any debate: `SEC-001 … SEC-NNN`, each
  with its scope, files (paths or globs), surfaces (API, web UI, mobile UI,
  job, script, infra, docs), trust boundaries (untrusted inputs entering it),
  external deps and why the files belong together, plus a compact `yaml` list
  (`id`, `name`, `files`, `surfaces`) to iterate over. Everything that ships is
  in some section: config, IaC, migrations, CI, scripts, test fixtures,
  hand-edited generated code. Only never-edited generated artifacts, lockfiles
  and `node_modules` are left out.
- **Every section was debated** and each candidate got a verdict:
  Confirmed (into the queue as `confirmed` or `likely`), Open question (into
  the queue as `hypothesis`, Suggested approach "confirm first: …"),
  Non-material (true but fails the materiality bar: out of the queue, at most
  one line in the run's Non-blocking observations) or Rejected (false alarm,
  rationale recorded). A section with no real defects gets one "clean" line.
- **The queue is compiled:** fresh `FIND-001 … FIND-NNN` ids across the whole
  run in recommended fix order (each item after everything in its `Depends
  on`, including cross-section ones such as a server contract change that
  forces a client update; otherwise Critical and High first); one record per
  defect, with other sections that surfaced it under Also seen in; a severity
  disagreement between sections resolved to the higher one, with the reason.
- **The output is one document** in three parts:
  1. Executive summary in 3 to 6 sentences: sections audited, finding count
     with Critical and High counts, recurring themes, unresolved sections, the
     Non-blocking observations (no ids, not counted) and the next step
     (usually `fix-errors`).
  2. A debate log per section: files; two or three sentences on what bad cop
     flagged, what good cop defended and how it was ruled; the section's
     FIND ids (ids only); and Rejected candidates with a one-line rationale
     each, so future runs don't raise them again.
  3. The unified queue, each record in this shape, then a closing `yaml` block
     of `id`, `severity`, `category`, `confidence`, `source_section`,
     `location` and `depends_on`:

```markdown
### FIND-XXX: [one-line title]

| Field | Value |
| ----- | ----- |
| **Severity** | Critical \| High \| Medium \| Low \| Note |
| **Category** | security \| logic \| contract \| reliability \| maintainability \| test-gap \| docs |
| **Confidence** | confirmed \| likely \| hypothesis |
| **Source section** | SEC-xxx |
| **Also seen in** | None \| SEC-yyy, SEC-zzz |
| **Location** | `path/to/file.ext`: lines or symbol |
| **Symptom** | What is wrong today |
| **Impact** | What breaks or who is at risk if unfixed |
| **Fix intent** | One sentence: desired end state or invariant |
| **Suggested approach** | Concrete steps, patterns, or APIs |
| **Verify** | How to prove the fix (fix-errors runs this) |
| **Depends on** | None \| FIND-yyy |
| **Debate notes** | One line on why it was ruled in |
```

## Decisions (and why)

- **Sections follow what the code does, not directories:** auth, billing,
  the mobile reader, a migration pipeline, spanning server and client when the
  feature does. Each holds roughly 300 to 1500 lines or 5 to 20 files; bigger
  features split along stable seams (handler vs job, server vs client). Why: a
  subagent must hold its whole section with room left to reason.
- **Show the manifest and ask before debating,** unless the run was already
  approved end to end or a validator invoked scout. Why: scope is cheapest to
  fix before the subagents start.
- **Three roles per section, all `general-purpose` subagents briefed with only
  that section's files, manifest entry and debate so far:**
  - Bad cop assumes the section is broken. It covers at least security,
    logic, edge cases, test coverage, documentation accuracy, error handling,
    observability, API contracts, and concurrency and idempotency where they
    apply, and returns candidate records with severity, confidence and a
    `path:line` or symbol for each. Documentation accuracy cuts both ways:
    wrong or missing docs, and doc bloat per
    `../../knowledge/workflow/doc-maintenance.md` (category `docs`, tagged
    `doc-bloat`; gates, active ADR entries, open lane entries and compliance
    records never count).
  - Good cop gets bad cop's list verbatim and marks each `agree`,
    `partially-agree`, `disagree`, `out-of-scope` or `immaterial` with a
    justification citing code or upstream invariants, and may add what bad cop
    missed (`good-cop-add`).
  - You moderate and rule. Bad cop gets one counter round only when good cop
    disputed a meaningful share; anything you can't rule on after that
    becomes `hypothesis`.
  Why: the debate filters speculation, and the log is what makes scout's
  queue more trustworthy than a single pass.
- **Up to three sections debate in parallel;** rounds within a section stay
  sequential. Why: wider runs thrash the token budget and blur the moderation.
- **Materiality bar:** a candidate earns a FIND only if a competent engineer,
  told only the finding, would agree it is worth fixing, because it ties to a
  concrete consequence: a user notices or is harmed, a security boundary
  weakens, a result or state or money goes wrong, cost or reliability
  measurably degrades at realistic load, a law or policy is implicated, or the
  next change gets materially riskier. Micro-optimizations, redundant but
  correct work, behavior-identical refactors, re-arguing an adequate
  mitigation and hardening against a threat the architecture already rules
  out don't. If a candidate's own fix note has to argue the impact is
  negligible, it fails. This is impact, not severity: a real Low a user feels
  still earns its FIND. Why: a padded queue stops being trusted.
- **Project conventions and ADRs win** over candidates that only re-argue
  them: reject citing the entry (e.g. `covered by adr/03-billing.md#O1`).
  Three exceptions: security, legal and accessibility candidates are reported
  tagged `ADR-conflict` for the human; concrete evidence that an `active`
  decision causes real harm is reported tagged `ADR-challenge` (entry plus
  evidence, human only, never the fix queue); code contradicting an `active`
  decision with no recorded supersession is itself a finding.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Scout never edits code, tests or docs; handing the queue to `fix-errors` is
  the user's or the feature loop's call.
- Every finding cites a real path with lines or a symbol.
- No debate mixes sections; cross-section concerns are handled when the queue
  is compiled.
