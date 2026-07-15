# {{APP_NAME}}: Feedback Inbox

> The post-launch inbox. Paste raw production signal here: user emails, support
> messages, store reviews, error-tracker exports, your own observations: one
> entry per item under **Inbox**, as rough as you like. `/live-triage`
> converts it into workflow state:
>
> - functional problem → a `docs/BUGS.md` entry tagged `[prod]` (the loop
>   drains it before any build unit)
> - cosmetic miss → a `docs/TWEAKS.md` entry (the light lane drains it)
> - small improvement, no new scope → a `docs/TODO.md` entry (the
>   planned-change lane re-qualifies and drains it)
> - feature request / scope change → surfaced to Alex in `docs/STATUS.md` ›
>   Blockers: **never silently turned into a feature**
> - duplicate / not actionable → marked triaged with the reason
>
> Triage never fixes anything itself; it routes. Each item moves to **Triaged**
> with a pointer to the ID it became. Keep IDs unique and monotonic (FB-001,
> FB-002, …).

## Inbox

<!-- Copy this block per item. Raw is fine: quote the user verbatim where you
     can; verbatim beats summarized. -->
<!--
### FB-001: <short title>
- **Source:** <user email / support / app review / error tracker / own testing>
- **Raw:** <the report, verbatim: paste the error event / review text / email>
- **Date:** <when it came in>
-->

_(none)_

## Triaged

<!-- newest first: /live-triage appends here:
     FB-id, title → BUG-xxx `[prod]` | TWK-xxx | TODO-xxx | blocker (feature request) | duplicate of <id> | not actionable, one-line reason (date) -->

_(none)_
