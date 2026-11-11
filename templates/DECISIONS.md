# Goal, hard rules and decisions

The project's top-level record. Every skill and agent reads the Goal and Hard
rules before it works, and works toward the goal within them. How to get there
is the agent's call unless a decision below, or a feature's ADR in `docs/adr/`,
settles it.

## Goal

<!-- Seeded by /plan-spec from the approved spec; changed only by Alex. -->
_What this app is for and who it serves, in two or three sentences._

**Done looks like:** _the observable outcomes that mean v1 can ship._

## Hard rules

Non-negotiable. A change that would break one stops and goes to Alex.

- No secrets in the repo, logs, docs or test fixtures.
- Gates are Alex's: spec, guide and wireframe approval, the `staging` to `main`
  promotion, and the legal and accessibility launch gates. Agents never merge
  to `main`, self-approve a gate, or submit to a store unasked.
- The suite is green at every commit. Never skip, weaken or delete a test to
  get there.
- Authentication's contract (`docs/features/authentication.md`,
  `docs/adr/auth.md`) is never weakened to land other work.
- An `active` decision here or in `docs/adr/` changes only on Alex's explicit
  confirmation, recorded as a supersession.
- No new scope without Alex: new ideas are proposals in STATUS.

<!-- Add app-specific hard rules below. Keep the list short: a rule that
     needs a paragraph is a decision. -->

## Decisions

Project-wide choices, newest first. A feature-scoped decision lives in that
feature's ADR; the entry here can just point at it (`→ adr/03-billing.md#D2`).
Record a decision when reversing it would need a conversation: an approach
chosen over a real alternative, a provider, a topology call, a tradeoff someone
would otherwise "fix". The why is required; without it a later agent can only
obey or ignore the decision, not judge whether it still holds.

```
## YYYY-MM-DD: <short title>
**Status:** active <!-- active | superseded by <title> | retired -->
**Decision:** <what was decided, one or two sentences>
**Why:** <what it buys, what it rules out, why the alternative lost>
**Affects:** <files, features, or follow-ups this constrains>
```

---

<!-- Newest entries below this line -->
