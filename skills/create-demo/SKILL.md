---
name: create-demo
description: >-
  Plan, script, and implement marketing-grade demo recordings for an app,
  not QA walkthroughs. Inspects an unfamiliar codebase, decides what is
  actually worth showing, drafts multiple demo flows tailored to different
  surfaces (landing hero, social short, app store preview, feature launch
  clip, investor demo), produces the automation (Playwright for web,
  Maestro for mobile), demo-safe seed data, recording scripts, and output
  folders under `marketing/demos/`, and: after the user approves the
  plan: runs the recording end-to-end so finished footage lands in
  `marketing/demos/output/` in the same session. Use when the user asks
  to "make a product demo", "record a demo video", "build a demo flow",
  "automate app screen recordings", "generate marketing video footage",
  "App Store preview video", "Product Hunt demo gif", or any variant of
  "I need recordings of my app for marketing". Composes with
  /marketer-video, /marketer-launch, /marketer-aso, and /remotion for
  post-production.
---

# Create demo

A **planner + implementer + runner** skill. It produces the strategy
(what to show, why, in what order), the working automation that
captures it and, after an explicit approval gate, actually runs the
recording so the user ends the session with footage on disk, not just
scripts. The output is reusable marketing footage, not a regression
test.

## Core principle: read this first, twice

> **Do not just automate whatever route is obvious.**
> First figure out what would make a good marketing demo.

The single biggest failure mode of this skill is producing a "click
around the app" test instead of a useful product demo. A test proves the
app works. A demo proves the app is *worth using*. They are different
artifacts with different success criteria.

Before opening Playwright/Maestro, **always run the Product Understanding
Phase below**. Skipping it is the defining mistake.

A second failure mode is producing one generic demo. Real marketing
needs different footage for different surfaces. **Default to producing
multiple demo plans**, not one.

## What it produces

Under `marketing/demos/` in the target repo:

```
marketing/demos/
  strategy/
    product-understanding.md     # what the app does, who it's for, the aha
    feature-priority.md          # what to show, what to skip, why
    demo-plan.md                 # the matrix of planned recordings
  flows/
    01-onboarding-first-value.spec.ts
    02-core-feature.spec.ts
    03-social-short.spec.ts
    ...
  seed/
    demo-data.ts                 # realistic, on-brand demo content
    reset.ts                     # idempotent reset to clean state
  scripts/
    record-all.sh                # one-command capture
    record-<name>.sh             # per-flow capture
  output/
    .gitignore                   # ignore raw recordings
  README.md                      # how to record, where outputs land
```

For mobile, swap `flows/*.spec.ts` for `flows/*.yaml` (Maestro) and add
a `device-matrix.md` describing which simulators/devices to capture on.

## Phase 1: Product Understanding

Before any automation, inspect the app (routes, README, marketing copy,
package.json, schema, primary screens) and write
`marketing/demos/strategy/product-understanding.md` answering:

- **What does this app do?** (one sentence, no jargon)
- **Who is it for?** (the actual user, not "everyone")
- **What is the main promise?** (the value the marketing site claims)
- **What is the "aha" moment?** (the moment a new user gets it)
- **What screens prove that value visually?** (concrete route list)
- **What features are impressive *and* easy to grasp in seconds?**
- **What features should be avoided?** (unfinished, slow, private,
  visually weak, requires too much context to understand)
- **What state must exist for the app to look good?** (data, accounts,
  prior activity)

If the codebase doesn't make these answers obvious, *ask the user*
before proceeding. Do not guess and barrel ahead: the wrong "aha"
moment poisons every downstream artifact.

## Phase 2: Feature Prioritization

Write `marketing/demos/strategy/feature-priority.md` with three buckets:

- **Hero features**: short to demo, visually strong, central to the
  product's promise. These get their own videos.
- **Supporting features**: only shown if they make a hero feature look
  better, or are part of a natural flow toward the aha moment.
- **Excluded features**: settings pages, admin screens, half-built UI,
  anything requiring a paragraph of explanation, anything that exposes
  test/debug affordances.

Write *why* each feature is in its bucket. A future contributor (or you,
next quarter) should be able to re-evaluate without re-deriving.

## Phase 3: Marketing Story Rules

Every demo needs a story. Pick one of these structures per recording
and write it at the top of the flow file as a comment:

### Problem → Action → Payoff
Show the problem state, perform the product's main action, show the
useful result. The default for most demos.

### Before → After
Show a messy/manual state, then show how the app cleans it up. Strong
for productivity, organizing, or automation products.

### One Feature, One Benefit
Show exactly one feature; make the benefit unmissable. Best for social
shorts and feature launch clips.

### Speed Run to Value
Time-to-first-useful-outcome for a brand-new user. Best for onboarding
demos and "look how fast" positioning.

Avoid videos that feel like QA tests: no logging in three times, no
visiting the settings page, no opening the admin panel "to show it
exists".

## Phase 4: Video Format Planning

Write `marketing/demos/strategy/demo-plan.md` as a matrix. Plan for the
surfaces below; produce a flow for each one the user has, or will
plausibly have, in the next quarter.

### Landing page hero
- 10–30s, polished, broad product value
- Horizontal (16:9) or responsive
- Must work without sound
- Ends on the most photogenic screen

### Social short
- 6–20s, vertical (9:16)
- Strong first 2 seconds (the hook)
- One clear feature, one clear benefit
- Captions/callouts added later in Remotion: leave headroom in the
  composition for them

### App Store / Play Store preview
- Mobile-first, captured at exact device resolution
- No private data, no debug overlays
- Polished screens only: avoid tiny text
- Show core value within 3 seconds
- Respect store rules (no competitor mentions, no pricing claims that
  could become stale, no UI chrome that suggests another OS)

### Feature launch clip
- One feature, before/after or action/result
- Good for changelog, X, LinkedIn, email
- 5–15s, autoplay-friendly

### Investor / sales demo
- Slightly slower pacing, more complete flow
- Shows depth and credibility, not just polish
- 60–120s, narration-friendly cadence
- OK to include light setup if it makes the payoff land

## Phase 5: Demo Flow Quality Bar

A good demo flow:

- starts from a known clean state (seeded, not "whatever happens to be
  in dev today")
- reaches value within 5–15 seconds (faster for social, slower for
  investor)
- uses realistic, on-brand demo data (see Phase 6)
- pauses on important screens long enough for a viewer to read
- avoids dead time and visible loading states (preload, mock, or fade)
- hides developer/debug UI (devtools, React Query devtool, Tailwind
  indicator, env banners, "staging" ribbons)
- never shows production or private user data
- ends on a satisfying result: not on a modal, not mid-form
- is repeatable with a single command

A bad demo flow:

- clicks too fast for a viewer to follow
- looks like a test
- uses placeholder strings (`test123`, `asdf`, `foo@bar.com`,
  `lorem ipsum`)
- exposes admin/debug screens
- depends on flaky production data or live third-party calls
- shows unfinished or visually weak UI
- includes unnecessary setup
- tries to cram every feature into one video

If any of the "bad" items appear in the planned flow, change the plan
before writing automation.

## Phase 6: Demo data seeding

Real apps do not look good empty, and they do not look good with
`test123`. Create `marketing/demos/seed/demo-data.ts` (or the
language-appropriate equivalent) that populates the app with:

- realistic names (curated, not random: `Maya Chen`, not `User 47`)
- realistic content (well-written notes, plausible numbers, real-
  looking dates clustered around "today")
- enough volume to look used, not abandoned (~8–20 items typically)
- nothing that resembles a real customer's data

Create `marketing/demos/seed/reset.ts` that is idempotent: running it
twice gives the same clean state. Each flow should call reset at the
top so re-recording is one command.

If the app has no seed mechanism, propose the smallest one that works
(a script that hits the API or DB directly with the demo user's
credentials) and implement it: do not skip seeding because it doesn't
exist yet.

## Phase 7: Auth handling

Demos should not show the user typing a password. Options, in order of
preference:

1. **Pre-authenticated storage state** (Playwright `storageState`,
   Maestro `launchApp` with saved session): fastest, cleanest.
2. **Magic link / dev-only auth bypass**: acceptable if the bypass is
   not visible on screen.
3. **Live login**: only if the auth screen *is* the demo (rare).

Never record real credentials. Use a dedicated demo account with a
recognizable, on-brand display name and avatar.

## Phase 8: Test IDs and accessibility labels

Demo automation needs stable selectors. If the app lacks them:

- Add `data-testid` (web) or `accessibilityIdentifier` (iOS) /
  `contentDescription` (Android) **only on the elements the demo
  touches**.
- Do not blanket-add testids across the app, that's scope creep.
- Document added selectors in the flow file so removing them later is
  intentional.

If the app is in a state where adding selectors is risky (frozen for
release, owned by another team), use role/text selectors and flag the
brittleness in the flow comment.

## Phase 9: Recording quality

Web (Playwright):
- Viewport: 1920×1080 for landing hero, 1280×800 for general use,
  390×844 (iPhone 14) or device-specific for mobile-web.
- Disable animations that don't help (`prefers-reduced-motion`
  selectively: keep brand animations, drop incidental ones).
- Use `page.video()` with high bitrate, or capture frames and assemble
  with FFmpeg for editorial control.
- Hide the cursor unless the cursor *is* the story; if shown, use a
  branded cursor overlay rather than the system pointer.

Mobile (Maestro + simulator/emulator):
- Use exact App Store / Play Store device sizes.
- Set the demo time to a flattering value (9:41 on iOS by convention).
- Hide the carrier, set full battery, full signal: use simulator
  status bar overrides.
- Record at native resolution and downscale in post.

In both cases: pace the flow for *viewers*, not for *machines*. Insert
explicit `wait`/`pause` after meaningful state changes so a human eye
has time to register them.

## Phase 10: Output naming

Every recording lands in `marketing/demos/output/` named:

```
<NN>-<surface>-<feature>-<aspect>.<ext>
e.g.
01-landing-hero-collab-16x9.mp4
02-social-short-ai-summarize-9x16.mp4
03-app-store-onboarding-iphone15pro.mp4
```

Numbered prefix matches the flow file. Surface, feature, and aspect are
all in the name so downstream tools (Remotion, video editors) can pick
the right asset without opening it.

`marketing/demos/output/.gitignore` excludes raw recordings from git.
Final, color-graded, captioned exports live elsewhere (the marketing
site repo, asset CDN, etc.) this skill produces *footage*, not
finished videos.

## Phase 11: Required outputs

Unless the user explicitly says "just one", produce a plan for **at
least three** recordings:

1. **Onboarding / first-value demo**: speed run to value
2. **Core feature demo**: problem → action → payoff on the hero feature
3. **Short social feature highlight**: one feature, one benefit, 9:16

For mature apps, also plan:

4. Power-user workflow (depth and credibility)
5. App Store / Play Store preview (mobile)
6. Landing page hero recording (horizontal, sound-off)
7. Before/after transformation demo

For each: write the flow file *and* a one-paragraph brief at the top
(surface, length target, story structure, the single sentence a viewer
should walk away with).

## Phase 12: Implementation requirements

Do **not** stop at strategy docs. Create the actual files:

- Playwright config (`marketing/demos/playwright.config.ts`) with
  separate projects for each viewport/surface.
- Maestro flows (`marketing/demos/flows/*.yaml`) with explicit waits
  and screenshot/recording hooks.
- Per-flow shell scripts (`scripts/record-<name>.sh`) that reset seed
  data, launch the recorder, run the flow, and write to
  `output/<name>.mp4`.
- `scripts/record-all.sh` that runs everything sequentially.
- `marketing/demos/README.md` with: prerequisites, the one command to
  record everything, troubleshooting (common flakes), and a pointer to
  the strategy docs.

If the app cannot currently support reliable demo recording (no seed
mechanism, no stable selectors, debug UI everywhere), make the
**smallest safe changes** needed to make demos possible, and list
each change in the PR description so the user can review them as
intentional product changes, not test scaffolding.

## Phase 13: Approval gate

After implementation, **stop and get explicit approval before running
any recording**. This is the last cheap checkpoint: rerecording is
expensive, and the recording will touch the dev server, browsers,
simulators, and disk.

Present a short SETUP REVIEW that includes:

- The planned flow list (numbered, with surface, length, story
  structure, and the one-sentence brief for each).
- Any product changes made to enable demos (Phase 12), so the user
  can review them as intentional changes rather than discovering them
  in the diff later.
- The seed data that will be inserted, and which demo account it
  will be inserted as.
- The exact command(s) about to run, the environment they target
  (URL / device / simulator), and where the output will be written.
- Approximate wall-clock time for the full run.
- Any non-obvious side effects (dev server it'll start, simulators
  it'll boot, network requests it'll make, files outside
  `marketing/demos/` it'll touch).

Then ask, plainly: **"Approve this setup and run the recording?"**
Wait for explicit approval. Do not infer approval from earlier
discussion, do not run on partial approval ("looks good, but…"), and
do not run "to save a round trip": this gate exists precisely to
avoid producing footage the user will throw away.

If the user changes the plan, update the flows / seed / scripts
first, then re-present the SETUP REVIEW and ask again.

**Auto mode does not bypass this gate.** Recording is a "shared
system" type action (browsers open, simulators boot, time is spent,
output lands on disk) and the whole point is producing footage the
user actually wants. Ask, then run.

## Phase 14: Run the recording

After approval, execute `scripts/record-all.sh` (or the narrower
subset the user approved: they may say "just the social short" or
"skip the App Store preview for now"). While running:

- **Refuse to run against production.** Before launching, check the
  target URL, NODE_ENV, DB connection string, and any feature-flag
  env vars. If anything looks like prod (prod hostname, real
  customer DB, live payment keys), stop and re-confirm with the user,
  even if they already approved. Demo recording must run against
  a dedicated demo / staging / local environment.
- **Stream output** so the user sees per-flow progress and can
  interrupt with Ctrl-C if a flow is clearly heading somewhere bad.
- **Fail loudly, not silently.** If a flow fails mid-recording,
  stop, surface the exact flow + step + error, and ask: fix and
  retry, skip and continue, or abort the run. Never silently re-run
  a failed flow: re-runs hide flakes that will bite later.
- **Watch for stalls.** If a flow runs > 2× its planned length, that
  almost always means a selector is missing or a loading state is
  stuck. Surface it and ask the user how to proceed.
- **Do not edit flows mid-run** to "make it pass". Editing during a
  run produces footage the scripts on disk can't reproduce. Stop,
  fix, re-run from the top of that flow.

## Phase 15: Validation

After the run completes:

- Watch every output video end-to-end. Each must hit its quality bar
  (Phase 5) and answer its one-sentence brief (Phase 11).
- Confirm no recording shows: debug UI, real user data, placeholder
  strings, the auth screen (unless intentional), or empty states the
  product isn't proud of.
- Confirm the recording is reproducible: a second run of the same
  flow should produce equivalent footage (frame-perfect is not the
  bar: narratively equivalent is).
- For any video that fails the bar, fix the underlying flow / seed /
  selector: do not just delete the file and hope. The next person
  to run the script should get usable footage on the first try.

If anything fails, fix it and re-run that specific flow. Do not
declare done with broken footage on disk and a note that says
"should work after you tweak X".

## Phase 16: Final handoff

End with a short message to the user covering:

- What was planned (the matrix from Phase 4)
- What was implemented and recorded (paths to each output file)
- Any flows the user chose to skip, or that were deferred mid-run,
  and why
- Any product changes that were made to enable demos (Phase 12) so
  the user can review them as intentional changes
- The exact command to re-record everything (so they can rerun
  themselves later without invoking this skill again)
- Suggested next steps (e.g. "pipe these into /remotion to add
  captions and intros" or "use /marketer-aso to write the App Store
  copy that frames these previews")

This skill ends at *footage*. Editing, captions, intros, music, and
publication belong to other skills.

## Mindset

You are simultaneously a **product marketer** (what is worth showing
and why), a **QA automation engineer** (how to capture it reliably),
a **demo video producer** (what makes the captured frames worth
watching), and a **careful operator** (the one who actually runs the
recording, but only after the user has signed off on what is about to
happen). If any of those four roles is missing, the flow is not done.
