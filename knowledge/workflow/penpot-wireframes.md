---
id: workflow-penpot-wireframes
title: "Penpot wireframes are a plan-time artifact, refreshed on demand"
---

# Penpot wireframes are a plan-time artifact, refreshed on demand

**Objective: get the planning value of wireframes without taxing every UI
change.** The boards exist so the app's screens and flow are thought through
before they are built, and so a human can see the shape of the app at a glance.
They are built **once** per app (the initial rollout) and **refreshed on
demand**. They are not a continuously-synced mirror of the shipped UI.

## The rule

**Wireframe once at plan time; refresh when asked, not on every change.**

- **Initial rollout.** Each app gets its Penpot wireframe boards stood up once:
  in `/plan-wireframes` GENERATE mode for a greenfield app, or as a one-time
  backfill of the existing screens for an app first documented in CAPTURE mode.
  Record the file link in `docs/wireframes/README.md`.
- **On-demand refresh afterwards.** The boards are updated when Alex asks for it,
  or when they are about to be used for planning again (before a redesign, a new
  feature area, or a flow rework). "Refresh the wireframes" is an explicit
  request, not a step inside every UI task.
- **No Penpot-first requirement.** A design or layout change does **not** have to
  land in Penpot before (or after) it lands in code. Ordinary UI work, tweaks,
  restyles, and feature UI ship without touching Penpot.
- **No Penpot-sync debt.** That bookkeeping is gone. Do not record
  `Penpot-sync: pending`, and do not gate any task on reconciling boards.

## Why it works this way

Penpot's MCP writes land only on the **currently focused page of a design file
that is open and Connected in a live browser tab** (File → MCP Server →
Connect). There is no headless path. A Penpot-first rule therefore makes every
UI change depend on a human having a browser open, which is incompatible with
running the workflow autonomously: an unattended `/dev-goal` would accrue
reconciliation debt on every screen it touched and could never clear it, so no
UI work could be called done. The planning value of wireframes does not require
continuous sync, so the sync requirement is dropped rather than the artifact.

## The accepted tradeoff, and where current-state truth lives

**The boards will drift from the shipped UI, and that is expected.** They are
dated plan-time intent, not a current-state spec. Read them as "this is how the
screen was conceived", not "this is how the screen looks now".

Current state is tracked in text instead, because text can be updated by an
unattended run:

- **`docs/wireframes/README.md`**: the screen inventory (screen → feature →
  source file → states covered, with **(missing)** marking states absent in the
  code). Derived from the code, cheap to regenerate, and the artifact that
  should stay current. Keep this honest as screens change.
- **`docs/DESIGN.md`**: the committed style, tokens, anti-patterns, and
  real-world references. This is the binding design intent.

So: **DESIGN.md governs how it should look, the inventory records what exists,
and the Penpot boards show how the flow was planned.**

## Applies to all apps, except the declared exemptions

Every app gets the initial rollout unless it carries an **exemption
declaration** (next section).

Record each app's dedicated Penpot wireframe file link in its
`docs/wireframes/README.md` (see `/plan-wireframes` Step 4); that is the file a
later on-demand refresh reconnects to. Keep one file per app, named after the
app.

## Exempt apps

Penpot is overhead on some apps rather than leverage, and forcing the artifact
there makes the app **harder** to work on for no design gain. Such an app may be
declared **exempt**, on exactly one of two grounds:

- **No UI surface.** The app ships no user-facing screens at all (a CLI, an MCP
  server, a library, a headless service). There is nothing to wireframe, so the
  artifact cannot exist.
- **Surface too simple to pay for itself.** A single-page site or a handful of
  static screens whose whole layout is legible at a glance in the code and in
  `docs/DESIGN.md`. Boards would cost more than they inform.

An exemption is permanent and total: the app never needs a Penpot file, and
`design-critic` judges it from `docs/DESIGN.md`, the screen inventory,
`docs/SPEC.md`, and the universal design rules. Absence of boards is **not** a
finding for an exempt app. Every other gate (universal checklist, decision
leakage, WCAG 2.2 AA floor, the E2E gate) applies unchanged: exemption removes
one artifact, never the rubric.

### Declaring it

Record the declaration in the app's `docs/wireframes/README.md` (create the file
with just this block if the app has no wireframes doc), alongside the `**Mode:**`
line or in place of it plus the now-dead Penpot-link line. Keep a CAPTURE
inventory if the app has one: under an exemption that inventory is
design-critic's primary layout reference, so it is worth more, not less.

```markdown
**Penpot:** exempt (permanent) - <no UI surface | surface too simple>
**Reason:** <one line: what the app is, why boards would not inform it>
**Declared:** <YYYY-MM-DD>
```

An exemption is Alex's call, never an agent's. An agent that finds Penpot
inconvenient for an app does **not** self-exempt it. Reversing an exemption is
likewise Alex's call (the app grew real UI): delete the block and run
`/plan-wireframes`.

## Relationship to the existing gates

- **`/plan-wireframes`** creates the boards and owns the artifact. Running it
  again is how a refresh happens.
- **design-critic** judges screenshots against `docs/DESIGN.md`, the universal
  design rules, the screen inventory, and `docs/SPEC.md`. It may consult the
  Penpot boards as plan-time context, but **board drift is not a finding** and a
  missing or stale board never blocks a pass. Nothing in the critic's verdict
  depends on a browser being connected.
- **The E2E gate** is unchanged and unrelated: it governs the flow proof
  (`knowledge/workflow/e2e-gate.md`).
