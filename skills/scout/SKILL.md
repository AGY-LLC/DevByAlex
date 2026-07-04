---
name: scout
description: >-
  Performs a deep, full-repo audit by partitioning the codebase into
  feature-coherent sections, then running an adversarial bad-cop / good-cop
  debate on each section to surface security flaws, logic bugs, missing edge
  cases, weak tests, brittle abstractions, and documentation gaps that a
  single-pass review would miss. Compiles every confirmed issue into a
  unified, IDed FIND-xxx queue ready for the fix-errors skill. Use when the
  user asks for a deeper / more thorough alternative to code-review, a
  whole-repo audit, a "pre-launch deep review", or wants two perspectives
  arguing each finding before it lands in the fix queue.
---

# Scout

A deeper alternative to `code-review`. Where `code-review` does one skeptical
pass and emits findings, **scout** partitions the entire repo into bounded
sections and runs a structured **bad-cop / good-cop debate** on each one. The
debate filters speculation from real defects, captures the reasoning behind
each verdict, and produces a unified `FIND-xxx` queue that `fix-errors` can
consume directly.

## When to run

- The user asks for a *deeper*, *more thorough*, or *more rigorous* alternative
  to `code-review`.
- The user wants the **entire** repo (or a large slice of it) audited, not
  just a diff or a single module.
- The user explicitly invokes scout, asks for a "deep audit", "two-perspective
  review", "adversarial review", "breakout-group review", or "second-opinion
  pass".
- Pre-launch hardening on a codebase that has never had a structured audit.

For a quick diff-level review, prefer `code-review`. For an end-to-end
review-test-fix loop on a small surface, prefer `technician`.

## Procedure

Scout has three phases that run **sequentially**: cartography → debate →
compile. Phases 1 and 3 run in the main agent; phase 2 fans out subagents.

```
phase 1: cartography  ──►  section manifest (SEC-001 … SEC-NNN)
                                  │
                                  ▼
phase 2: per-section debate  ──►  per-section finding lists (FIND-xxx)
   (bad-cop subagent ⇄ good-cop subagent ⇄ moderator)
                                  │
                                  ▼
phase 3: compile  ──►  unified FIND-xxx queue (fix-errors-ready)
```

All subagents are spawned via the Agent tool with
`subagent_type: general-purpose`. Phase 2 sections may run in parallel
(see "Parallelism" below); phases 1 and 3 are strictly sequential.

### Phase 1 — Cartography

Goal: partition the repo into **bounded, feature-coherent sections** small
enough that a single subagent can hold the section in its context window and
still have headroom to reason.

Steps:

1. **Survey the repo top-down.** Read root configs (`package.json`, monorepo
   layout, `CLAUDE.md`, top-level `README`, build config) to understand the
   shape of the codebase: languages, package boundaries, build targets,
   deployment surfaces.
2. **Identify feature groups, not directory groups.** Sections should follow
   *what the code does* — auth, billing, story-generation, the SRS engine,
   the mobile reader, the web paywall, observability glue, the migration
   pipeline — even when the code lives across multiple directories or
   packages. A single section may span server + client when the feature is
   genuinely cross-cutting (e.g. an API route plus the mobile screen that
   calls it).
3. **Bound each section.** Target ~300–1500 lines of code or ~5–20 files per
   section. If a feature is larger than that, split it (e.g. "billing —
   webhooks", "billing — entitlement", "billing — paywall UI"). Splitting
   along stable seams (route handler vs. background job, server vs. client)
   beats splitting by line count.
4. **Cover everything that ships.** Configuration, infrastructure-as-code,
   migrations, CI workflows, scripts, fixtures used by tests, generated code
   that humans hand-edit — all of it goes into a section. The only things
   that may be excluded are: vendored / generated artifacts the team never
   edits, lockfiles, and dependencies in `node_modules`.
5. **Record the manifest.** Emit a section manifest before starting phase 2.

#### Section manifest format

```markdown
### SEC-001 — [feature name]

| Field | Value |
| ----- | ----- |
| **Scope** | One-line description of what the section covers |
| **Files** | List of file paths (or globs) included in this section |
| **Surfaces** | API \| UI (web) \| UI (mobile) \| job \| script \| infra \| docs |
| **Trust boundaries** | Untrusted inputs entering this section (HTTP body, env, DB rows, webhooks, …) |
| **External deps** | Third-party services / libraries this section talks to |
| **Reason for grouping** | Why these files belong together |
```

Append a fenced `yaml` block listing the same sections in compact form so
phase 2 can iterate over it.

```yaml
sections:
  - id: SEC-001
    name: "auth — server"
    files: ["server/src/lib/auth/*.ts", "server/src/app/api/auth/**/*.ts"]
    surfaces: ["api"]
```

After emitting the manifest, **briefly summarize** total section count and
ask the user whether to proceed (so they can adjust scope or split / merge
sections before debate begins). If the user has already approved scout to
run end-to-end, skip the confirmation and proceed.

### Phase 2 — Per-section debate (bad cop / good cop)

For each section in the manifest, run a structured adversarial debate. The
goal is to surface *real* defects with the reasoning behind each verdict on
the record — not a generic "could be improved" list.

Three roles, all played by general-purpose subagents:

- **Bad cop** — assumes the section is broken until evidence otherwise. Hunts
  for security flaws, logic bugs, race conditions, missing edge cases, weak
  or absent tests, misleading documentation, brittle abstractions,
  silently-swallowed errors, and gaps between what the code claims and what
  it actually does. Expected to be aggressive and to overreach.
- **Good cop** — defends the section. Justifies design choices, cites
  invariants the bad cop missed, points out where a "finding" is actually
  intentional or already mitigated upstream, but **also concedes when bad
  cop is right** and helps tighten the finding so it's actionable.
- **Moderator** — the parent agent (you). Drives the debate rounds, cuts off
  at the right moment, and renders the final verdict on each disputed
  finding.

#### Debate protocol

Run this loop **per section**:

1. **Brief both subagents** with the section's files and the section
   manifest entry. Each subagent reads the section in full inside its own
   context. Do **not** include findings from other sections — each debate is
   self-contained.

2. **Round 1 — bad cop opens.** Spawn the bad-cop subagent with a prompt
   that:
   - Names the section and lists its files.
   - Tells it to behave as the adversarial reviewer: assume defects until
     proven otherwise.
   - Requires it to cover, at minimum: **security**, **logic / correctness**,
     **edge cases**, **test coverage**, **documentation accuracy**,
     **error handling**, **observability**, **API contract integrity**,
     **concurrency / idempotency** where applicable.
   - Asks for output as a list of **candidate findings** in the FIND-xxx
     template (see Output format below). Severity and confidence required.
     Confidence = `confirmed` for issues it can cite chapter and verse on,
     `likely` for strong inference, `hypothesis` for "I'd want to verify
     this".
   - Requires every candidate to cite `path:line` or a precise symbol.

3. **Round 2 — good cop rebuts.** Spawn the good-cop subagent with a prompt
   that:
   - Includes the same section files.
   - Includes bad cop's full candidate list verbatim.
   - Tells it to defend the section: for each candidate, mark
     `agree` / `partially-agree` / `disagree` / `out-of-scope` /
     `immaterial`, with a one-paragraph justification citing code or
     upstream invariants. Use `immaterial` when a candidate is *real but
     changes nothing that matters* — a micro-optimization with no
     measurable impact, redundant-but-correct work, a pure style refactor,
     or a mitigation that is already adequate (see **Materiality bar** in
     Rules and discipline). `immaterial` is distinct from `disagree`: the
     candidate is true, it just doesn't earn a fix.
   - Permits good cop to **add** findings bad cop missed (rare, but happens
     — especially around missing tests for behavior bad cop only saw the
     happy path of, or documentation that's wrong in a way bad cop didn't
     catch). Mark these as `good-cop-add`.
   - Requires the same `path:line` precision.

4. **Round 3 (optional) — bad cop counters.** If good cop disputed a
   meaningful number of bad cop's candidates, spawn bad cop again with both
   prior outputs and let it press the disputed ones once. Skip this round
   when good cop accepted most candidates — additional rounds become
   noise.

5. **Moderator verdict.** The parent agent reviews both transcripts and
   renders a final verdict per candidate:
   - **Confirmed** — survives the debate; goes into the section's finding
     list with confidence `confirmed` or `likely`.
   - **Open question** — debate didn't resolve it; goes in with confidence
     `hypothesis` and a `Suggested approach` of "confirm first: …".
   - **Non-material** — real but fails the **Materiality bar**: no user,
     security, correctness, cost/reliability, legal, or future-change
     consequence. Keep it out of the FIND queue; if worth recording at all,
     drop it into the run's single **Non-blocking observations** note. Do
     not let this collapse into `Rejected` — "true but pointless" and
     "false alarm" are different verdicts, and the debate log should say
     which.
   - **Rejected** — drop entirely, but record the rejection rationale in
     the section's debate log (so the same false alarm doesn't reappear in
     a future scout run).

6. **Emit the section's debate record.** Write a per-section block of:
   - The final finding list (FIND-xxx, in fix-order).
   - A short **debate log** capturing what was disputed and how the
     moderator ruled. This log is what makes scout deeper than code-review:
     the reasoning is preserved.

#### Parallelism

Sections are independent. You may run up to **3 sections in parallel** by
spawning their phase-2 debates concurrently — but each section's three
rounds remain sequential within itself (round 2 needs round 1's output,
etc.). Going wider than 3 risks token-budget thrash and makes the moderator
phase harder to keep coherent. Smaller repos (<10 sections) often run fine
fully sequentially.

#### Section budget

Cap debate rounds per section at **3** (steps 2–4). If the section is still
contentious after that, mark unresolved candidates as `hypothesis` and move
on — scout's job is to surface and triage, not to litigate every edge case.

### Phase 3 — Compile

After all sections complete, the parent agent merges per-section findings
into a single, consistent queue ready for `fix-errors`.

Steps:

1. **Renumber.** Assign fresh `FIND-001 … FIND-NNN` IDs across the entire
   repo, in **recommended fix order**. Preserve the original section ID in
   each finding's `Source section` field for traceability.
2. **Order.** Apply the same ordering rules `code-review` uses:
   - Critical / High before Medium / Low.
   - Honor `Depends on`: if a finding requires another to land first, place
     it after.
   - Cross-section dependencies are common (e.g. a server contract change
     forces a mobile client update); make them explicit.
3. **Deduplicate.** The same defect may surface in multiple sections (e.g.
   a missing CSRF check showing up in both "auth" and "API routes"). Keep
   one finding, list both sections in `Also seen in`.
4. **Sanity-check severity.** A finding marked Critical in one section's
   debate but only Medium elsewhere should be reconciled — pick the higher
   severity and record why.
5. **Emit the unified queue.** See Output format below.

## Output format

Scout emits a single document with three top-level sections:

### 1. Executive summary

3–6 sentences:
- Total sections audited and total findings (with Critical / High counts).
- Themes that recurred across sections (e.g. "weak input validation on
  three API routes", "no tests for the SRS scheduler").
- Any sections where the debate could not resolve to a confident verdict
  (these become `hypothesis` findings).
- **Non-blocking observations** (if any): real-but-immaterial items the
  debate ruled **Non-material**, listed once without `FIND` IDs and
  excluded from the finding counts — so they are on the record but never
  compete with the queue.
- Recommended next step for the user (typically: "hand to `fix-errors`").

### 2. Section debate logs

For each `SEC-xxx`, a block of:

```markdown
## SEC-001 — [feature name]

**Files:** …

**Debate summary:** 2–3 sentences on what bad cop flagged, what good cop
defended, and where the moderator landed.

**Findings (in fix order):** FIND-xxx, FIND-yyy, …
(IDs only — full records appear in the unified queue.)

**Rejected candidates:** Brief list of bad-cop candidates the moderator
threw out, with the rationale (one line each). This is the institutional
memory that prevents future scout runs from re-raising the same false
alarms.
```

### 3. Unified FIND queue

Every finding uses the same record template `code-review` emits, so
`fix-errors` consumes scout output without translation. The template:

```markdown
### FIND-XXX — [one-line title]

| Field | Value |
| ----- | ----- |
| **Severity** | Critical \| High \| Medium \| Low \| Note |
| **Category** | security \| logic \| contract \| reliability \| maintainability \| test-gap \| docs |
| **Confidence** | confirmed \| likely \| hypothesis |
| **Source section** | SEC-xxx (the section that surfaced it) |
| **Also seen in** | None \| SEC-yyy, SEC-zzz |
| **Location** | `path/to/file.ext` — lines or symbol |
| **Symptom** | What is wrong today |
| **Impact** | What breaks or who is at risk if unfixed |
| **Fix intent** | One sentence: desired end state or invariant |
| **Suggested approach** | Concrete steps, patterns, or APIs |
| **Verify** | How to prove the fix |
| **Depends on** | None \| FIND-yyy |
| **Debate notes** | One-line summary of why the moderator ruled this in (e.g. "good cop conceded the race window is real after re-reading transaction boundary") |
```

Append a closing fenced `yaml` block listing all findings in compact form
for tooling (same shape as `code-review`'s yaml block, plus the
`source_section` field).

```yaml
findings:
  - id: FIND-001
    severity: High
    category: security
    confidence: confirmed
    source_section: SEC-003
    location: "server/src/app/api/auth/oauth/callback/route.ts:42"
    depends_on: []
```

## Differences from code-review

| Dimension | code-review | scout |
| --- | --- | --- |
| Scope | A diff, PR, or specified module | Full repo (or large slice) by default |
| Pass count | One skeptical pass | Adversarial debate, up to 3 rounds per section |
| Reasoning trail | Findings only | Findings + debate log per section |
| False-positive filtering | Reviewer's own judgment | Good cop pushes back before findings land |
| Output cost | Cheaper | More expensive (multiple subagents per section) |
| When to use | Diff-level review, fast turnaround | Deep audit, pre-launch hardening, second-opinion pass |

The output format is intentionally **identical** to `code-review`'s — same
`FIND-xxx` template, same severity rubric, same yaml block — so
`fix-errors`, `technician`, and any other downstream consumer cannot tell
the difference. Scout is a *deeper way to produce* the same fix queue.

## Rules and discipline

- **Never silently fix.** Scout produces findings. It does not edit code,
  add tests, or otherwise touch the working tree. Hand-off to `fix-errors`
  (or `technician` for a full review-harden-fix loop) is the user's call.
- **Cite chapter and verse.** Every finding's `Location` must be a real
  path with line range or symbol. "somewhere in auth" is not acceptable.
- **Preserve the debate record.** The per-section debate log is part of the
  deliverable, not a working note. It's what makes scout's findings more
  trustworthy than a single-pass review and prevents regression of false
  alarms across runs.
- **Earn the slot (materiality bar).** A candidate enters the FIND queue
  only if a competent engineer, told only the finding, would agree it is
  worth someone's time to fix. It must connect to a concrete consequence:
  a user notices or is harmed, a security boundary weakens, a result is
  wrong or state/money corrupts, cost or reliability *measurably* degrades
  at realistic load, a law/policy is implicated, or the next change gets
  materially riskier. Items that are *technically true but change nothing
  that matters* — micro-optimizations with no measurable impact (saving a
  cheap cache write, a DB read off a non-hot path, sub-millisecond work),
  redundant-but-correct work, pure style/structure refactors with identical
  behavior, re-litigating an already-adequate mitigation, or hardening
  against a threat the architecture already precludes — do **not** earn a
  FIND. The tell: if a candidate's own fix note has to argue the impact is
  negligible, it fails the bar. Good cop marks these `immaterial`; the
  moderator rules them **Non-material** and (optionally) rolls them into the
  run's single **Non-blocking observations** note. This is impact, not
  severity — a genuine Low that a user actually feels (a visible copy typo,
  a real hardening gap) still earns its FIND.
- **Don't pad.** A section with no real defects gets a one-line "clean"
  entry in phase 2 and contributes zero findings to phase 3. Inflating the
  queue erodes trust in the queue.
- **Respect project conventions and decision records.** If the repo's
  `CLAUDE.md` declares a pattern is intentional (e.g. "we don't test web
  React components by policy"), or a `docs/adr/` file records an `active`
  decision or deliberate omission covering the candidate, the moderator
  should reject candidates that just re-litigate that decision — citing the
  ADR entry (e.g. `covered by adr/03-billing.md#O1`). The debate log records
  the rejection so future runs see the precedent. Three exceptions: security/
  legal/accessibility candidates survive an ADR (report them tagged
  `ADR-conflict` for the human); concrete evidence that an `active` decision
  is itself causing real harm survives too (tagged `ADR-challenge`, entry +
  evidence, routed to the human only — never the fix queue: the ADR blocks
  blind change, not criticism); and code that *contradicts* an `active` ADR
  decision with no recorded supersession is itself a finding (drift from
  decided architecture).
- **One section, one debate.** Don't merge debates across sections — the
  whole point of partitioning is that each section fits in a subagent's
  context with headroom. Compilation in phase 3 handles cross-section
  concerns.

## Hand-off

The unified queue is consumed downstream by:

- `fix-errors` — works through the queue one fix at a time.
- `technician` — can take scout's output as the initial FIND list and run
  the full review-harden-fix loop from there. (Technician's own
  `code-review` step becomes optional in this configuration; the user
  decides whether to re-review after fixes land.)

If the user does not specify, recommend `fix-errors` for execution and
`technician` if they want test-hardening to accompany each fix.
