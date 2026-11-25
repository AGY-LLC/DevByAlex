---
name: create-demo
description: >-
  Plans, builds and, after the user approves, records marketing-grade demo
  footage of an app (not QA walkthroughs): decides what is worth showing,
  drafts flows per surface (landing hero, social short, store preview,
  feature launch clip, investor demo), writes the Playwright (web) or Maestro
  (mobile) automation, demo-safe seed data and record scripts under
  `marketing/demos/`, then runs them so footage lands in
  `marketing/demos/output/`. Use when the user asks to make a product demo,
  record a demo video, automate app screen recordings, get App Store preview
  or Product Hunt footage, or otherwise needs recordings of the app for
  marketing. `launch-store-assets` reuses its capture for store screenshots.
---

# Create demo

## Goal

Footage on disk that shows why the app is worth using, at least one recording
per surface the user has or plausibly will have soon, reproducible with one
command. A test proves
the app works; a demo proves it is worth using. Automating whatever route is
obvious is the defining failure, and one generic demo is the second.

## Done when

- **The strategy is written** under `marketing/demos/strategy/`:
  - `product-understanding.md`: what the app does in one plain sentence, who
    it is for, the main promise, the aha moment, the routes that prove it
    visually, features that are impressive and graspable in seconds,
    features to avoid (unfinished, slow, private, visually weak, needing
    context), and the state the app needs to look good.
  - `feature-priority.md`: hero features (short, visual, central; each gets
    its own video), supporting features (shown only on the way to a hero's
    payoff) and excluded ones (settings, admin, half-built UI, anything
    needing a paragraph, anything exposing test or debug affordances), each
    with why.
  - `demo-plan.md`: the matrix of recordings with surface, length, story and
    the one sentence a viewer should walk away with. At least three unless
    the user says "just one": onboarding speed run to first value, the core
    feature as problem, action, payoff, and a 9:16 one-feature social short.
    Mature apps add a power-user workflow, a store preview, a landing hero
    and a before/after as fits.
- **The automation exists and runs:** `flows/NN-<name>.spec.ts` (web, with
  `marketing/demos/playwright.config.ts` holding a project per viewport) or
  `flows/NN-<name>.yaml` (Maestro, plus `device-matrix.md`), each opening with
  its brief and story; `seed/demo-data.ts` and an idempotent `seed/reset.ts`
  that every flow calls first; `scripts/record-<name>.sh` (reset, launch the
  recorder, run, write to `output/`) and `scripts/record-all.sh`;
  `output/.gitignore` excluding raw recordings; and `marketing/demos/README.md`
  with prerequisites, the one record command, common flakes and a pointer to
  the strategy.
- **The user approved a SETUP REVIEW** before anything recorded: the numbered
  flow list with surface, length, story and brief; every product change made
  to enable demos; the seed data and the demo account it goes in as; the exact
  commands, the environment they target (URL, device, simulator) and where
  output goes; the rough wall-clock time; and side effects (servers started,
  simulators booted, network calls, files touched outside `marketing/demos/`).
  A changed plan updates the files and gets a fresh review.
- **Every approved flow the user didn't skip was recorded and watched end to
  end.** Each meets the quality bar below and answers its brief, shows no debug
  UI, real user data, placeholder strings, unplanned auth screen or empty state,
  and a second run gives narratively equivalent footage. Files are named
  `<NN>-<surface>-<feature>-<aspect>.<ext>` (e.g.
  `02-social-short-ai-summarize-9x16.mp4`), `NN` matching the flow file, so
  editors and Remotion can pick them without opening them. With the media
  toolkit installed, the footage is filed through `media`.
- **The handoff** gives the plan, each output path, flows skipped or deferred
  and why, the product changes to review, and the command to re-record.

## Decisions (and why)

- **Understand the product before opening Playwright or Maestro,** and ask
  the user when the code doesn't make the aha moment obvious. Why: a wrong
  aha poisons every downstream artifact.
- **Every recording has one story,** written atop its flow: problem, action,
  payoff (the default); before and after (productivity, organizing,
  automation); one feature, one benefit (shorts and launch clips); or speed
  run to value (onboarding). Why: a story is what separates a demo from a
  test; no logging in three times, no settings page, no admin "to show it
  exists".
- **Surface specs:**

  | Surface | Length | Shape |
  |---|---|---|
  | Landing hero | 10 to 30s | 16:9, works without sound, ends on the most photogenic screen |
  | Social short | 6 to 20s | 9:16, hooks in 2s, headroom left for captions added later |
  | Store preview | per store | exact device resolution, value within 3s, none of: private data, tiny text, competitor mentions, stale pricing claims, other-OS chrome |
  | Feature launch clip | 5 to 15s | one feature, before/after or action/result, autoplay-friendly |
  | Investor or sales | 60 to 120s | slower, fuller flow showing depth, light setup allowed |

- **Quality bar:** start from a seeded clean state, reach value in 5 to 15s
  (faster for social, slower for investor), pause where a viewer must read,
  hide loading and dead time, hide dev UI (devtools, query devtools, env
  banners, staging ribbons), end on a satisfying result, never on a modal or
  mid-form, depend on no live third-party calls or flaky shared data, and
  don't cram every feature into one video. A planned flow that
  misses this is re-planned before automation is written. Why: viewers, not
  machines, are the audience.
- **Seed data looks used and real:** curated names (`Maya Chen`, not
  `User 47`), well-written content, plausible numbers, dates near today,
  roughly 8 to 20 items, nothing resembling a real customer, never `test123`,
  `asdf`, `foo@bar.com` or lorem ipsum. No seed mechanism means building the
  smallest one that works (a script hitting the API or DB as the demo user).
  Why: apps don't look good empty or fake.
- **Auth stays off screen:** a pre-authenticated session (Playwright
  `storageState`, a saved Maestro session) first, an invisible magic link or
  dev bypass second, a live login only when auth is the demo. A dedicated demo
  account with an on-brand name and avatar. Why: typing a password is dead
  time and a credential risk.
- **Selectors are added only where a flow touches** (`data-testid`,
  `accessibilityIdentifier`, `contentDescription`) and listed in the flow
  file; where adding them is risky (release freeze, another owner), role or
  text selectors with the brittleness noted. Any product change made to enable
  demos is the smallest safe one and is listed for review. Why: demos must not
  become scope creep.
- **Capture settings:** web at 1920x1080 for a landing hero, 1280x800 for
  general use, the device size for mobile web; incidental animation off,
  brand animation kept; the cursor hidden unless it is the story (then a
  branded overlay). Mobile at exact store device sizes and native resolution,
  status bar overridden (9:41, full battery and signal, no carrier). Explicit
  pauses after meaningful changes. Why: the frames are the product.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Nothing records before the user explicitly approves the SETUP REVIEW. Earlier
  discussion, partial approval ("looks good, but…") and auto mode don't count.
- Never record against production. Before launching, check the target URL,
  `NODE_ENV`, the database connection and feature-flag env; anything that looks
  like prod (prod host, real customer DB, live payment keys) stops the run and
  is re-confirmed even after approval.
- Never record real credentials or real user data.
- Stream per-flow progress while recording. A failed or stalled flow (over twice
  its planned length) stops and is reported with the flow, step and error,
  asking whether to fix and retry, skip or abort. Never silently re-run it, and
  never edit a flow mid-run; fix it and re-run from that flow's start.
- Broken footage is fixed at its flow, seed or selector and re-recorded, not
  deleted or handed over with "should work after you tweak X".
- This skill ends at footage: editing, captions, intros, music and publishing
  are out of scope.
