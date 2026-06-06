---
name: plan-wireframes
description: "Stage 3 of the DevByAlex plan phase — create low-fidelity wireframe designs for each feature so the flow of the app is understood before any code is written. Drives a Figma MCP to build one wireframe frame per key screen (with empty/loading/error/onboarding/upgrade states), using the design/UX answers captured in docs/SPEC.md. Writes docs/wireframes/README.md indexing every frame and the screen-to-feature mapping. REQUIRES a Figma MCP server to be configured — if none is connected, it stops and tells the user how to set one up rather than faking it. Use after the implementation guide exists, when the user says 'wireframe the app', 'design the screens', or 'create the wireframes'."
argument-hint: "[optional: feature or screen to wireframe]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# plan-wireframes — Wireframe every feature (Figma MCP)

The third plan stage. Produces low-fidelity wireframes for each feature so the
app's flow is clear before the dev stage starts. Wireframes plus the
implementation guide are the two artifacts Alex approves to unlock the dev
stage, and the artifacts each finished feature is later checked against.

## Prerequisite: a Figma MCP server

This skill **drives a Figma MCP**. Before doing anything, verify a Figma MCP is
connected (look for `figma`-prefixed tools, e.g. via ToolSearch). **If none is
connected, stop** and tell the user to configure one — do not hand-wave
wireframes in markdown as a substitute. Setup pointer:

```
# A Figma MCP server (e.g. the official Figma Dev Mode MCP, or a community
# server such as figma-developer-mcp / framelink) must be registered:
claude mcp add figma -- <command-or-URL for the Figma MCP server>
# then provide the Figma access token / file key the server expects.
```

Record in `docs/wireframes/README.md` which Figma file/project the frames live
in so later stages can reference them.

## When to activate

- `docs/IMPLEMENTATION_GUIDE.md` exists and the feature list is set.
- The user says "wireframe the app," "design the screens," or "create
  wireframes."
- A new feature was added and needs screens before it's built.

## Workflow

### Step 1 — Confirm prerequisites
- A Figma MCP is connected (else stop, per above).
- `docs/SPEC.md` (design/UX answers) and `docs/IMPLEMENTATION_GUIDE.md` +
  feature cards exist. If the design/UX answers are missing from the spec, send
  the user back to `/plan-spec` rather than inventing tone/density.
- If `docs/DESIGN.md` exists (from `/uiux-init`), honor its tokens so wireframes
  match the intended visual direction.

### Step 2 — Build the screen list
From the feature cards, enumerate every key screen and, for each, the states it
needs (default, empty, loading, error, onboarding, upgrade where relevant) and
the primary user action. Group screens by feature and by the end-to-end flow a
user walks.

### Step 3 — Create frames via the Figma MCP
For each screen: create a low-fidelity frame (layout, hierarchy, key copy,
primary CTA, and the relevant states) using the Figma MCP. Keep it lo-fi —
structure and flow, not pixel polish. Lay frames out per feature, and add flow
arrows/links between screens so the navigation is legible. Use real placeholder
copy (Alex prefers concrete copy over lorem ipsum).

### Step 4 — Index in docs/wireframes/README.md
Write `docs/wireframes/README.md` from `../../templates/wireframes-README.md`:
- The Figma file/project link.
- A table mapping **feature → screens → frame link → states covered**.
- The intended primary user flow(s) as an ordered list of screens.

### Step 5 — Update STATUS and route
- Check **Plan → Wireframes created** in `docs/STATUS.md`, and mark the
  Wireframe step per feature in the feature table.
- Set `## Next action`: with all three plan artifacts done, the next action is
  **Alex reviews & approves** the guide + wireframes — the dev stage is blocked
  until the approval gates are checked.
- Add a log line.

## Rules

- **No Figma MCP, no wireframes.** Stop and route to setup; never fabricate.
- Wireframes are low-fidelity: flow and structure first.
- Cover the non-happy states (empty/loading/error) — they're where flows break.
- Don't unlock the dev stage; that's Alex's approval to give.

## Output

Figma wireframe frames per feature, `docs/wireframes/README.md` indexing them,
STATUS advanced, and a request for Alex's approval of the guide + wireframes.
