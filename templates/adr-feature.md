# ADR {{NN}} — {{FEATURE_NAME}}

> The governing decision record for this feature. Consult it before any change
> that touches the feature; breaking an `active` entry requires explicit human
> confirmation and a recorded supersession (see `docs/adr/README.md`). Seeded by
> `/plan-guide`, kept current by `/feature-loop` step 4.

**Feature card:** `docs/features/{{NN}}-{{SLUG}}.md`
**Record state:** current <!-- current | backfilled (needs review) -->

## Decisions

<!-- One entry per decision that constrains future change. Never delete an
     entry — mark it superseded/retired so the history of intent survives. -->

### D1 — {{SHORT_TITLE}}
**Status:** active <!-- active | superseded by Dx | retired (date · by whom) -->
**Date:** {{DATE}}
**Decision:** _What was decided, one or two sentences._
**Why:** _The reasoning — what it buys, what it rules out._
**Instead of:** _Alternatives considered and rejected, and why._
**Constrains:** _What this locks in — files, behaviors, patterns future changes must respect._

## Deliberate omissions

<!-- Things this feature consciously does NOT have. Automated reviews treat an
     active omission as settled — not a finding (security/legal/a11y excepted;
     hard launch gates are never overridable). -->

### O1 — {{WHAT_WE_DONT_HAVE}}
**Status:** active <!-- active | superseded by Dx | retired (date · by whom) -->
**Date:** {{DATE}}
**Omitted:** _The capability/behavior we chose not to build._
**Why:** _Why leaving it out is the right call._
**Revisit when:** _The condition that would reopen this (optional)._
