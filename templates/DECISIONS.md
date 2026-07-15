# Decision Log

Material decisions made while building this app, newest first. The workflow
appends here instead of writing back to an external brain: this file is the
project's own durable record of *why* things are the way they are.

Append an entry whenever a stage makes a choice worth remembering: an auth
provider, a data-model tradeoff, a scaffolding/topology call, a launch decision.
Keep each entry short: the rationale matters more than the prose.

This log records *what happened when*. The **governing** record of what holds
now lives per feature in `docs/adr/`: a feature-scoped decision goes in that
feature's ADR (the log entry can just point at it, e.g. `→ adr/03-billing.md#D2`).

## Format

```
## YYYY-MM-DD: <short title>
**Stage:** <plan-spec | dev-auth | dev-scaffold | dev-goal | launch-* | …>
**Decision:** <what was decided, one or two sentences>
**Why:** <the reasoning / what it rules out>
**Affects:** <files, features, or follow-ups this constrains>
```

---

<!-- Newest entries below this line -->
