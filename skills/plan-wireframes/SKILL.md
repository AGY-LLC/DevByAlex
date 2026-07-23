---
name: plan-wireframes
description: "Stage 3 of the DevByAlex plan phase. It establishes the wireframe artifact each feature is later validated against. Two modes. GENERATE mode (greenfield): drives a write-capable Penpot MCP to build one low-fidelity board per key screen (with empty/loading/error/onboarding/upgrade states) from the design/UX answers in docs/SPEC.md. CAPTURE mode (existing app with UI already built): inventories the app's EXISTING screens from the code and documents them. No Penpot MCP is required, so the wireframe gate can be satisfied for an integrated repo without re-designing UI that already exists. Either way writes docs/wireframes/README.md indexing screens, states, and the screen-to-feature mapping. Use after the implementation guide exists, when the user says 'wireframe the app', 'design the screens', 'create the wireframes', or 'document the existing screens'."
argument-hint: "[optional: feature/screen; or 'capture' to inventory an existing app's screens]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# plan-wireframes: Wireframe every feature (Penpot MCP)

The third plan stage. Produces the wireframe artifact each feature is later
validated against, so the app's flow is clear before the dev stage proceeds.
Wireframes plus the implementation guide are the two artifacts Alex approves to
unlock the dev stage.

**The boards are a living artifact, not a frozen one.** Once approved, the
Penpot wireframe stays the source of truth for layout and design: any later
design or layout change goes **Penpot-first, then code**, so the boards keep
matching what ships (see
[`../../knowledge/workflow/penpot-source-of-truth.md`](../../knowledge/workflow/penpot-source-of-truth.md)).
This stage stands the boards up; the dev and uiux skills keep them in step, and
the design-critic verifies the shipped screen still matches them.

## Two modes: pick one first

- **GENERATE** (greenfield / a feature with no UI yet): design new low-fidelity
  boards in Penpot from the spec's design/UX answers. **Needs a write-capable
  Penpot MCP.** This is the default for a blank app.
- **CAPTURE** (integrated/existing repo that already has the UI built): the
  screens exist in code: don't redesign them. **Inventory** the existing screens
  and document them as the wireframe artifact. **No Penpot MCP required.** Use this
  when `init-ai` classified the repo `partial`/`mature`, the user passes
  `capture`, or there's already real UI in the codebase.

Choosing: if the feature/app already has built screens, prefer CAPTURE: it's
faster, doesn't need Penpot, and reflects reality (you validate against what's
actually shipping, not a redesign). Only GENERATE for screens that don't exist
yet.

## Prerequisite for GENERATE mode: a Penpot MCP server

GENERATE mode **drives a Penpot MCP**. Before generating, verify a Penpot MCP is
connected (look for `penpot`-prefixed tools, e.g. `mcp__penpot__execute_code` via
ToolSearch). **If none is connected, either switch to CAPTURE mode (if the screens
already exist) or stop** and tell the user to configure one: do not hand-wave
generated wireframes in markdown as a substitute. (CAPTURE mode does not need
Penpot at all.)

**It must be a *write-capable* Penpot MCP.** Penpot's official MCP server
(v2.15+) is write-capable: the `execute_code` tool runs write operations against
the focused Penpot page (create, rename, move, delete, restyle boards / frames /
text), which is what this skill needs. A read-only "design → code" server can
connect but cannot wireframe.

Connect the official **cloud** server over remote HTTP:

```
# In Penpot: Your account → Integrations → MCP Server → enable →
#   Generate key (shown ONCE, copy it) → copy the server URL.
# Then add it to Claude Code at user scope (kept out of the repo; token is personal):
claude mcp add --scope user --transport http penpot \
  "https://design.penpot.app/mcp/stream?userToken=YOUR_MCP_KEY"
# Restart Claude Code so the penpot-prefixed tools load.
```

**Operational note unique to Penpot:** writes hit the **currently focused Penpot
page in your browser**, not an arbitrary file by ID. So before generating, open
the target Penpot design file and connect it via **File → MCP Server → Connect**,
and select/create the page the boards should land on: only the focused page
receives operations. Start with a read-only prompt (list / inspect) to confirm
the connection before writing.

This is a human, plan-time step (wireframing is not part of the autonomous dev
loop), and it's per app, not per session-once. **Keep one dedicated Penpot file
per app** (e.g. "<App> Wireframes"), record its link in
`docs/wireframes/README.md` (Step 4), and reopen + Connect that same file each
time you wireframe that app. The `penpot` MCP server itself is connected once at
user scope for all projects: what you re-point per app is only which Penpot file
is focused.

Record in `docs/wireframes/README.md` which Penpot file/project the boards live
in so later stages can reference them.

## When to activate

- `docs/IMPLEMENTATION_GUIDE.md` exists and the feature list is set.
- The user says "wireframe the app," "design the screens," or "create
  wireframes."
- A new feature was added and needs screens before it's built.

## Workflow

### Step 1: Confirm prerequisites
- **Pick the mode** (GENERATE vs CAPTURE) per the section above.
- **GENERATE only:** a write-capable Penpot MCP is connected and the target
  Penpot file is open and connected (else switch to CAPTURE if the screens exist,
  or stop). `docs/SPEC.md` design/UX answers must exist: if missing, send the user
  back to `/plan-spec` rather than inventing tone/density.
- `docs/IMPLEMENTATION_GUIDE.md` + feature cards exist (both modes).
- **Read the committed style.** `docs/DESIGN.md` should carry a **Style choice**
  (PRIMARY × SECONDARY) from `/plan-design`: design the frames to that style,
  consult its recorded **real-world references** (open them: the frames should
  belong to the same world), and honor any tokens `/uiux-init` has expanded. If
  no style is recorded yet, run `/plan-design` first rather than defaulting to a
  generic look.
- **Read the universal design rules**
  ([`../../knowledge/design/universal-design-rules.md`](../../knowledge/design/universal-design-rules.md))
  and make every frame answer them structurally: one clear primary action per screen,
  obvious hierarchy, predictable navigation, recognition over memory,
  progressive disclosure, and empty states that teach.

### Step 2: Build the screen list
- **GENERATE:** from the feature cards, enumerate every key screen and the states
  each needs (default, empty, loading, error, onboarding, upgrade where relevant)
  and its primary user action.
- **CAPTURE:** enumerate the **existing** screens from the code: routes/pages
  (`app/`, `pages/`, router config), top-level views/components, and navigation.
  For each, record its file path, primary user action, and which states it
  actually implements today (note missing empty/loading/error states as gaps,
  they become candidate work in the feature board, not invented designs).

Include the **legal/consent surfaces** the spec's compliance section requires,
Terms of Service page, Privacy Policy page, and the **cookie consent banner**
(web): as screens in their own right so the flow accounts for them.

Group screens by feature and by the end-to-end flow a user walks.

### Step 3: Produce the wireframe artifact
- **GENERATE:** for each screen, create a low-fidelity Penpot board (layout,
  hierarchy, key copy, primary CTA, relevant states). Keep it lo-fi: structure
  and flow, not pixel polish. Lay boards out per feature with flow arrows between
  screens. Use concrete placeholder copy (Alex prefers it over lorem ipsum).
  **Show, don't tell:** never give sections a descriptive subtitle or paragraph
  explaining what they're for, and never let spec/decision rationale appear as
  UI copy: layout, hierarchy, and labels carry that meaning (universal rule
  31). A frame whose sections need explanation gets restructured, not
  annotated. Whatever explanatory text the wireframe shows is what gets built,
  so leave it out here.
- **CAPTURE:** do **not** open Penpot. Write a per-screen description from the code:
  purpose, key elements, primary action, states present, and the file it lives
  in, plus the navigation flow between screens. This documented inventory **is**
  the wireframe artifact for an existing app; flag it as captured-from-code so a
  later reader knows it reflects the current UI, not an approved redesign.

**Prose-check the copy (both modes).** Run the `prose-check` skill over the copy
you authored (GENERATE) or captured (CAPTURE): CTAs, empty states, labels,
headings, error/validation messages, and strip AI tells before this artifact
becomes what features are built and validated against.

**Note accessibility structure per screen (both modes).** Record heading order,
where labels/landmarks/focus belong, and the primary keyboard path, so the build
inherits a11y intent, not just layout (it's verified later by
`accessibility-critique` against the WCAG 2.2 AA hard gate).

### Step 3b: Spec the app-wide design resources
Some visual assets aren't tied to a single screen: they belong to the whole app.
Write `docs/design/RESOURCES.md` from `../../templates/design-resources.md`,
driven by the spec's Design & UX + SEO answers and the brand (`docs/BRAND.md` /
`docs/DESIGN.md` if present). Spec three things so `/dev-scaffold` can build them
and `/launch-compliance` can verify them:

- **App loading animation**: the custom in-app loader, inspired by the theme.
  Record the chosen approach (logo-based animation of the logo SVG / theme-derived
  abstract loader / generated Lottie or video loop), the technique/format, timing,
  where it shows, and the `prefers-reduced-motion` fallback. Pick logo-based when a
  clean logo SVG exists; theme-derived when it doesn't or a richer feel is wanted.
- **Marketing load-in (public surfaces only)**: the separate one-time hero
  entrance: a staggered fade-up (`translateY` + `opacity` only, ~300–600ms,
  ease-out, ~60–120ms stagger, first content <~1s) and, optionally, a Stripe-style
  animated WebGL mesh-gradient background (~10kb, pause off-screen, 60fps mobile).
  Must not block LCP or shift layout, and must honor `prefers-reduced-motion`. Omit
  this entirely if the app has no public marketing page.
- **Social preview (OG) image**: the Stripe-style 1200×630 link-share card:
  default to dynamic generation from brand tokens (`@vercel/og` / Satori
  `opengraph-image.tsx`) using the app name, tagline, logo, and colors; note the
  per-route title strategy and that a hand-designed override is allowed.

This doc is part of the same approval gate as the wireframes.

### Step 4: Index in docs/wireframes/README.md
Write `docs/wireframes/README.md` from `../../templates/wireframes-README.md`:
- **GENERATE:** the Penpot file/project link.
  **CAPTURE:** state "captured from existing code (no Penpot)" and link the source
  files instead of boards.
- A table mapping **feature → screens → (board link *or* source file) → states
  covered** (mark states that are missing in CAPTURE mode).
- The intended primary user flow(s) as an ordered list of screens.

### Step 5: Update STATUS and route
- Check **Plan → Wireframes created** in `docs/STATUS.md`, and mark the
  Wireframe step per feature in the feature table.
- Set `## Next action`: with all three plan artifacts done, the next action is
  **Alex reviews & approves** the guide + wireframes: the dev stage is blocked
  until the approval gates are checked.
- Add a log line.

## Rules

- **GENERATE mode: no Penpot MCP, no generated wireframes.** Stop and route to
  setup, or switch to CAPTURE if the screens already exist: never fabricate
  Penpot boards in markdown.
- **CAPTURE mode documents reality, it doesn't design.** Describe screens that
  exist in the code; don't invent new ones or redesign. Record missing states as
  gaps for the feature board, not as wireframes.
- Wireframes are low-fidelity: flow and structure first.
- Cover the non-happy states (empty/loading/error) they're where flows break.
- Don't unlock the dev stage; that's Alex's approval to give (he approves a
  captured inventory the same way he'd approve generated boards).

## Output

The wireframe artifact for every feature: Penpot boards (GENERATE) or a
documented screen inventory (CAPTURE): `docs/wireframes/README.md` indexing them,
`docs/design/RESOURCES.md` speccing the app-wide design resources (loader,
marketing load-in, OG preview image), STATUS advanced, and a request for Alex's
approval of the guide + wireframes.
