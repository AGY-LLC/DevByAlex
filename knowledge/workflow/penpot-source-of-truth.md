---
id: workflow-penpot-source-of-truth
title: "Penpot is the living source of truth for layout and design"
---

# Penpot is the living source of truth for layout and design

**Objective: the wireframe never drifts from what ships.** The Penpot
wireframe was originally a plan-time artifact: approved once in
`/plan-wireframes`, then frozen while the app was built, and allowed to go
stale as the code evolved. That let the artifact each feature is validated
against stop reflecting reality. This policy makes Penpot the **living**
source of truth for layout and design instead: a design or layout change lands
in Penpot first, then in the code, so the boards and the shipped screens stay
in step.

## The rule

**Any change to design or layout goes Penpot-first, then code.** New visual
surface, a moved or restructured layout, a restyle, a UI-affecting tweak: the
app's Penpot wireframe boards are updated to the new intent before (or in the
same pass as) the code that implements it.

- **No review gate by default.** The Penpot update is part of doing the work,
  not a stop-and-approve step. The agent updates the boards and proceeds to
  code without waiting for sign-off.
- **Preview is opt-in.** The one time it pauses is when the user asks to see
  the change in Penpot first: then the agent updates the boards, stops, and
  waits for a look before writing the code.
- **Non-visual changes are exempt.** Logic, data, API, and background work
  that does not alter design or layout never touches Penpot (the same
  boundary `/dev-tweak` and the E2E gate already draw around "user-facing
  flow").

## Who can drive Penpot, and the connection reality

The `penpot`-prefixed MCP tools (`execute_code`, etc.) are callable by **any**
agent, including the subagents `/dev-goal` dispatches. There is no skill-level
block. The only requirement for a write to **land** is Penpot's own: writes
hit the **currently focused page of a design file that is open and Connected
in a live browser tab** (File → MCP Server → Connect). So:

- **Penpot connected** (an interactive session with the app's wireframe file
  open and Connected): update the boards first, then implement the code. This
  works in `/dev-goal`, `/dev-tweak`, `/uiux-audit`, `/uiux-redesign`, and
  feature-loop UI work alike.
- **Penpot not connected** (a headless / cloud run, or simply no browser
  session): the write has nowhere to land, so the agent does **not** block.
  It records a **Penpot-sync debt** against the changed screen (a
  `Penpot-sync: pending` note in `docs/wireframes/README.md` for that screen)
  and proceeds with the code. The change is not fully **done** until the debt
  is cleared: the boards are brought up to match on the next connected
  session, and the reconciliation is verified at the design-critic / align
  step.

This keeps the invariant true at completion (Penpot matches the shipped
screen when the change is marked done) without letting the browser-connection
requirement stall unattended work.

## Applies to all apps

Every app is bound by this policy, including apps first documented in CAPTURE
mode (screens inventoried from existing code, no Penpot file). A CAPTURE-mode
app must have a Penpot wireframe file **backfilled** to mirror its current
screens before the Penpot-first rule can hold for it. That backfill is a
one-time human + browser task (open Penpot, Connect a new file, generate the
current screens as boards), done the next time that app is wireframed: it is
not performed by an unattended run. Until an app's Penpot file exists, its
UI changes accrue Penpot-sync debt to be cleared when the file is stood up.

Record each app's dedicated Penpot wireframe file link in its
`docs/wireframes/README.md` (see `/plan-wireframes` Step 4); that is the file
every later design/layout change reconnects to.

## Relationship to the existing gates

- **`/plan-wireframes`** still creates the boards and owns the artifact; the
  difference is the artifact is no longer frozen after approval.
- **design-critic** now also confirms the shipped screen matches the Penpot
  boards (or that any Penpot-sync debt for it has been cleared) before a
  UI change is vetted done: the boards are part of the intent it critiques
  against, alongside `docs/DESIGN.md` and the universal rules.
- **The E2E gate** is unchanged: Penpot-first governs the design/layout
  artifact; the E2E gate governs the flow proof. A UI feature pays both.
