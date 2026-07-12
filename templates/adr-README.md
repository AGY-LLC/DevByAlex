# Architecture Decision Records (ADRs)

One file per feature, holding the decisions that govern it: what it has, what
it deliberately does **not** have, and why. `docs/DECISIONS.md` is the
chronological log of *what happened when*; this folder is the per-feature record
of *what holds now*. A feature's ADR is the contract future changes are checked
against.

## Why this exists

An automated review can't tell a gap from a choice. Without a record, a later
validator/scout/readiness pass will flag the thing we consciously left out, or
"fix" the thing we consciously built this way. The ADR makes intent durable:
documented deliberate decisions are not findings, and breaking one requires an
explicit human call, not a silent drive-by.

## Files

| File | Covers |
|------|--------|
| `docs/adr/<NN>-<slug>.md` | one per feature, mirroring `docs/features/<NN>-<slug>.md` |
| `docs/adr/scaffold.md` | cross-cutting scaffold decisions (topology, branch model, tooling, CI) |
| `docs/adr/auth.md` | authentication decisions (provider, session strategy, threat model) |
| `docs/adr/_TEMPLATE.md` | the per-feature template: copy it, don't edit it |

Inside a file, decisions are numbered `D1, D2, …` and deliberate omissions
`O1, O2, …`. Reference them as `adr/<file>#D2`. Entries are never deleted,
a reversed decision is marked `superseded by Dx` or `retired`, so the history
of intent survives.

## The contract (every skill and agent honors this)

1. **Consult before change.** Any work that touches a feature reads its ADR
   first: alongside the feature card. This includes bug fixes, refactors, and
   validation loops, not just new builds.
2. **Breaking an active decision requires explicit confirmation.** If a change
   would contradict an `active` decision or omission, **stop**. Surface the
   conflict (cite the entry), and proceed only when the human confirms the
   break. Then record it: mark the old entry `superseded by Dx`, add the new
   decision with its why. Never silently diverge.
3. **Documented omissions are not findings.** Automated reviews (validators,
   `scout`, `launch-readiness`) treat an `active` deliberate omission as
   settled: cite the ADR entry instead of filing it. **Exceptions:**
   security, legal, and accessibility issues are still reported (tagged as
   ADR-conflicting so the human decides), and the two hard launch gates
   (Legal & compliance, Accessibility) are **never** overridable by an ADR.
4. **Drift is a finding.** Code that contradicts an `active` decision without a
   recorded supersession is a defect: the record wins until a human retires it.
4b. **The ADR blocks blind change, not criticism.** A reviewer that finds
   concrete evidence an `active` decision is causing real harm (bugs, user
   damage, measurable cost: not stylistic preference) files an
   **ADR-challenge**: the finding is reported citing the entry and the
   evidence, routed to the human. It never enters the fix queue and code is
   never changed ahead of the human's call. Re-litigating a decision with no
   new evidence is still dropped.
5. **Every feature has an ADR before dev work proceeds.** Greenfield: seeded by
   `/plan-guide` with each card. Existing repo brought under the workflow:
   **backfill an ADR for every identified feature before any feature work**,
   observed decisions tagged `(needs review)` until confirmed.
6. **One home for feature docs.** Pre-existing scattered feature docs (design
   notes, `NOTES.md`, ad-hoc decision writeups) get consolidated into the
   feature's ADR, or removed if irrelevant. Don't leave a second, stale source
   of truth lying around.

## What earns an entry

A decision that **constrains future change**: an approach chosen over a real
alternative, a capability consciously omitted, a tradeoff someone would
otherwise "fix." Not implementation trivia: if reversing it wouldn't need a
conversation, it doesn't need an entry.

**The why is not optional.** Every entry carries its rationale: what the
choice buys, what it rules out, why the alternative lost. A decision recorded
without its why can't be re-evaluated later, only obeyed or ignored; the
rationale is what lets a future change (or Alex) judge whether the decision
still holds. If the why is unknown (backfilled from code), say so explicitly
and tag the entry `(needs review)` rather than inventing one.
