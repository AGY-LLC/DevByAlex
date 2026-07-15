# {{APP_NAME}}: Todo Lane

> Drop planned changes here: one entry per change under **Open**. This is the
> **third lane**, after bugs and tweaks: deliberate improvements you've decided
> you want, heavier than a cosmetic tweak (behavior, structure, or flows may
> change) but smaller than a feature (no new scope). Once the app is stable,
> most iteration lives here. `/dev-todo` (called by `dev-goal` after the bug log
> and the tweak lane are clear) drains it.
>
> **Every entry is routed before it's worked** (see `/dev-todo`): broken
> behavior → `docs/BUGS.md`; cosmetic-only → `docs/TWEAKS.md`; feature-sized
> (new capability, new data model/API surface, substantial new dependency) →
> a feature proposal for Alex in STATUS blockers, never silently built. ADRs
> govern: an entry contradicting an `active` decision becomes a blocker.
>
> Open todos also **soft-block the launch stage** (like bugs and tweaks: a known
> planned change never ships unaddressed). Keep IDs unique and monotonic
> (TODO-001, TODO-002, …); never reuse a retired ID.

## Open

<!-- Copy this block per change. If /dev-todo routes an entry to another lane
     (or up to Alex as a feature proposal) it will note that here. -->
<!--
### TODO-001: <short title>
- **Surface:** <screen / route / module / flow>
- **Change:** <exactly what should be different afterward: current → desired>
- **Notes:** <optional: why, constraints, or a reference>
-->

_(none)_

## Done

<!-- newest first, /dev-todo appends here: TODO-id, title, what changed
     (branch · commit · date). Safe to prune old entries. -->

_(none)_
