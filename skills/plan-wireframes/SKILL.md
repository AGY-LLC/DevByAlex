---
name: plan-wireframes
description: "Stage 3 of the DevByAlex plan phase — establish the wireframe artifact each feature is later validated against. Two modes. GENERATE mode (greenfield): drives a write-capable Figma MCP to build one low-fidelity frame per key screen (with empty/loading/error/onboarding/upgrade states) from the design/UX answers in docs/SPEC.md. CAPTURE mode (existing app with UI already built): inventories the app's EXISTING screens from the code and documents them — no Figma MCP required — so the wireframe gate can be satisfied for an integrated repo without re-designing UI that already exists. Either way writes docs/wireframes/README.md indexing screens, states, and the screen-to-feature mapping. Use after the implementation guide exists, when the user says 'wireframe the app', 'design the screens', 'create the wireframes', or 'document the existing screens'."
argument-hint: "[optional: feature/screen; or 'capture' to inventory an existing app's screens]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# plan-wireframes — Wireframe every feature (Figma MCP)

The third plan stage. Produces the wireframe artifact each feature is later
validated against, so the app's flow is clear before the dev stage proceeds.
Wireframes plus the implementation guide are the two artifacts Alex approves to
unlock the dev stage.

## Two modes — pick one first

- **GENERATE** (greenfield / a feature with no UI yet): design new low-fidelity
  frames in Figma from the spec's design/UX answers. **Needs a write-capable
  Figma MCP.** This is the default for a blank app.
- **CAPTURE** (integrated/existing repo that already has the UI built): the
  screens exist in code — don't redesign them. **Inventory** the existing screens
  and document them as the wireframe artifact. **No Figma MCP required.** Use this
  when `init-ai` classified the repo `partial`/`mature`, the user passes
  `capture`, or there's already real UI in the codebase.

Choosing: if the feature/app already has built screens, prefer CAPTURE — it's
faster, doesn't need Figma, and reflects reality (you validate against what's
actually shipping, not a redesign). Only GENERATE for screens that don't exist
yet.

## Prerequisite for GENERATE mode: a Figma MCP server

GENERATE mode **drives a Figma MCP**. Before generating, verify a Figma MCP is
connected (look for `figma`-prefixed tools, e.g. via ToolSearch). **If none is
connected, either switch to CAPTURE mode (if the screens already exist) or stop**
and tell the user to configure one — do not hand-wave generated wireframes in
markdown as a substitute. (CAPTURE mode does not need Figma at all.)

**It must be a *write-capable* Figma MCP** — this skill *creates* frames, so a
read-only "design → code" server (the old Dev Mode codegen server, or framelink /
`figma-developer-mcp`) will connect but cannot wireframe. Use the official remote
Figma MCP server with **write-to-canvas** (the `use_figma` tool):

```
# Official remote server (Anthropic-hosted, browser OAuth — no token to paste):
claude plugin install figma@claude-plugins-official
# then: /plugin → Installed → figma → complete the OAuth → shows "connected".
```

Write-to-canvas is free during Figma's beta but needs the right seat: a **Full
seat** writes anywhere; a **Dev seat** writes only inside **draft** files — so
wireframe a new app into a Figma draft and a Dev seat suffices. (The local
desktop server at `127.0.0.1:3845` is Enterprise/Org-only and read-focused — not
sufficient here.)

Record in `docs/wireframes/README.md` which Figma file/project the frames live
in so later stages can reference them.

## When to activate

- `docs/IMPLEMENTATION_GUIDE.md` exists and the feature list is set.
- The user says "wireframe the app," "design the screens," or "create
  wireframes."
- A new feature was added and needs screens before it's built.

## Workflow

### Step 1 — Confirm prerequisites
- **Pick the mode** (GENERATE vs CAPTURE) per the section above.
- **GENERATE only:** a write-capable Figma MCP is connected (else switch to
  CAPTURE if the screens exist, or stop). `docs/SPEC.md` design/UX answers must
  exist — if missing, send the user back to `/plan-spec` rather than inventing
  tone/density.
- `docs/IMPLEMENTATION_GUIDE.md` + feature cards exist (both modes).
- If `docs/DESIGN.md` exists (from `/uiux-init`), honor its tokens.

### Step 2 — Build the screen list
- **GENERATE:** from the feature cards, enumerate every key screen and the states
  each needs (default, empty, loading, error, onboarding, upgrade where relevant)
  and its primary user action.
- **CAPTURE:** enumerate the **existing** screens from the code — routes/pages
  (`app/`, `pages/`, router config), top-level views/components, and navigation.
  For each, record its file path, primary user action, and which states it
  actually implements today (note missing empty/loading/error states as gaps —
  they become candidate work in the feature board, not invented designs).

Include the **legal/consent surfaces** the spec's compliance section requires —
Terms of Service page, Privacy Policy page, and the **cookie consent banner**
(web) — as screens in their own right so the flow accounts for them.

Group screens by feature and by the end-to-end flow a user walks.

### Step 3 — Produce the wireframe artifact
- **GENERATE:** for each screen, create a low-fidelity Figma frame (layout,
  hierarchy, key copy, primary CTA, relevant states). Keep it lo-fi — structure
  and flow, not pixel polish. Lay frames out per feature with flow arrows between
  screens. Use concrete placeholder copy (Alex prefers it over lorem ipsum).
- **CAPTURE:** do **not** open Figma. Write a per-screen description from the code
  — purpose, key elements, primary action, states present, and the file it lives
  in — plus the navigation flow between screens. This documented inventory **is**
  the wireframe artifact for an existing app; flag it as captured-from-code so a
  later reader knows it reflects the current UI, not an approved redesign.

**Prose-check the copy (both modes).** Run the `prose-check` skill over the copy
you authored (GENERATE) or captured (CAPTURE) — CTAs, empty states, labels,
headings, error/validation messages — and strip AI tells before this artifact
becomes what features are built and validated against.

**Note accessibility structure per screen (both modes).** Record heading order,
where labels/landmarks/focus belong, and the primary keyboard path — so the build
inherits a11y intent, not just layout (it's verified later by
`accessibility-critique` against the WCAG 2.2 AA hard gate).

### Step 3b — Spec the app-wide design resources
Some visual assets aren't tied to a single screen — they belong to the whole app.
Write `docs/design/RESOURCES.md` from `../../templates/design-resources.md`,
driven by the spec's Design & UX + SEO answers and the brand (`docs/BRAND.md` /
`docs/DESIGN.md` if present). Spec three things so `/dev-scaffold` can build them
and `/launch-compliance` can verify them:

- **App loading animation** — the custom in-app loader, inspired by the theme.
  Record the chosen approach (logo-based animation of the logo SVG / theme-derived
  abstract loader / generated Lottie or video loop), the technique/format, timing,
  where it shows, and the `prefers-reduced-motion` fallback. Pick logo-based when a
  clean logo SVG exists; theme-derived when it doesn't or a richer feel is wanted.
- **Marketing load-in (public surfaces only)** — the separate one-time hero
  entrance: a staggered fade-up (`translateY` + `opacity` only, ~300–600ms,
  ease-out, ~60–120ms stagger, first content <~1s) and, optionally, a Stripe-style
  animated WebGL mesh-gradient background (~10kb, pause off-screen, 60fps mobile).
  Must not block LCP or shift layout, and must honor `prefers-reduced-motion`. Omit
  this entirely if the app has no public marketing page.
- **Social preview (OG) image** — the Stripe-style 1200×630 link-share card:
  default to dynamic generation from brand tokens (`@vercel/og` / Satori
  `opengraph-image.tsx`) using the app name, tagline, logo, and colors; note the
  per-route title strategy and that a hand-designed override is allowed.

This doc is part of the same approval gate as the wireframes.

### Step 4 — Index in docs/wireframes/README.md
Write `docs/wireframes/README.md` from `../../templates/wireframes-README.md`:
- **GENERATE:** the Figma file/project link.
  **CAPTURE:** state "captured from existing code (no Figma)" and link the source
  files instead of frames.
- A table mapping **feature → screens → (frame link *or* source file) → states
  covered** (mark states that are missing in CAPTURE mode).
- The intended primary user flow(s) as an ordered list of screens.

### Step 5 — Update STATUS and route
- Check **Plan → Wireframes created** in `docs/STATUS.md`, and mark the
  Wireframe step per feature in the feature table.
- Set `## Next action`: with all three plan artifacts done, the next action is
  **Alex reviews & approves** the guide + wireframes — the dev stage is blocked
  until the approval gates are checked.
- Add a log line.

## Rules

- **GENERATE mode: no Figma MCP, no generated wireframes.** Stop and route to
  setup, or switch to CAPTURE if the screens already exist — never fabricate
  Figma frames in markdown.
- **CAPTURE mode documents reality, it doesn't design.** Describe screens that
  exist in the code; don't invent new ones or redesign. Record missing states as
  gaps for the feature board, not as wireframes.
- Wireframes are low-fidelity: flow and structure first.
- Cover the non-happy states (empty/loading/error) — they're where flows break.
- Don't unlock the dev stage; that's Alex's approval to give (he approves a
  captured inventory the same way he'd approve generated frames).

## Output

The wireframe artifact for every feature — Figma frames (GENERATE) or a
documented screen inventory (CAPTURE) — `docs/wireframes/README.md` indexing them,
`docs/design/RESOURCES.md` speccing the app-wide design resources (loader,
marketing load-in, OG preview image), STATUS advanced, and a request for Alex's
approval of the guide + wireframes.
