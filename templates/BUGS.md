# {{APP_NAME}} — Bug Log

> Drop bugs here as you hit them — one entry per bug under **Open**. This file is
> for **you** (the human); `dev-autopilot` is the one that clears it.
>
> On every run, **before** scaffold, auth, or any feature work, the autopilot
> drains this log: it fixes **every** open bug — each through its own verify loop
> via `fix-errors` — moves it to **Fixed** with the fixing commit, and only then
> moves on. Open bugs also **block the launch stage**: the autopilot will not
> advance into `/launch-acceptance` while any remain.
>
> You only need **Title** + enough **Repro / detail** for the fix to be
> unambiguous. Leave the rest blank — the autopilot fills the Fixed rows. Keep IDs
> unique and monotonic (BUG-001, BUG-002, …); never reuse a retired ID.

## Open

<!-- Copy this block per bug. Anything the autopilot can't reproduce or pin down
     it will NOT silently close — it leaves the bug here and records why in
     docs/STATUS.md › Blockers, then asks you. -->
<!--
### BUG-001 — <short title>
- **Severity:** blocker | high | medium | low
- **Surface:** <screen / route / module / file>
- **Repro:** <steps, or the exact failing input / command>
- **Expected:** <what should happen>
- **Actual:** <what happens instead — paste the error / stack trace>
- **Notes:** <links, related feature id, anything that pins it down>
-->

_(none)_

## Fixed

<!-- newest first — the autopilot appends here: BUG-id — title — fix summary
     (branch · commit · date). Kept as an audit trail; safe to prune old entries. -->

_(none)_
