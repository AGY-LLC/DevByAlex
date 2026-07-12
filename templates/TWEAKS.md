# {{APP_NAME}}: Tweak Lane

> Drop small cosmetic changes here: one entry per tweak under **Open**. This is
> the **light lane**: copy edits, token/spacing/color adjustments, asset swaps,
> changes that carry no logic risk and therefore don't deserve the full
> per-feature build/validate loop. `/dev-tweak` (called by `dev-autopilot` after
> the bug log is clear) drains it.
>
> **A tweak must pass the qualification test** (see `/dev-tweak`): user-visible
> copy, design tokens/styles, static assets, or ordering/visibility of existing
> elements, and NO logic, data-model, API, auth, dependency, or test changes.
> Anything heavier is a **bug** (`docs/BUGS.md`) or a **feature**: the lane
> escalates it rather than sneaking it through. Behavior wrong? That's a bug,
> not a tweak.
>
> Open tweaks also **soft-block the launch stage** (like bugs: they're cheap to
> drain, and known cosmetic misses never ship). Keep IDs unique and monotonic
> (TWK-001, TWK-002, …); never reuse a retired ID.

## Open

<!-- Copy this block per tweak. If /dev-tweak finds an entry fails the
     qualification test it will NOT force it through: it reclassifies it
     (to docs/BUGS.md or a feature proposal) and notes that here. -->
<!--
### TWK-001: <short title>
- **Surface:** <screen / route / component>
- **Change:** <exactly what to change: before → after for copy; the token/value for styling>
- **Notes:** <optional: why, or a reference>
-->

_(none)_

## Done

<!-- newest first, /dev-tweak appends here: TWK-id, title, what changed
     (branch · commit · date). Safe to prune old entries. -->

_(none)_
