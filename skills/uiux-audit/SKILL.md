---
name: uiux-audit
description: "Audit the project's UI against the existing design doc and apply tweaks to bring screens into alignment. Walks every customer-facing surface through the design-doc rules, the AI-UI tells detector, all applicable checklists (accessibility, responsive, mobile-interaction, visual-quality, interaction-states, forms, navigation, performance), consistency, reduced motion, dark/light parity, and empty/loading/error completeness; then implements the fixes inline. **Hard requirement: refuses to run if `docs/DESIGN.md` does not exist; routes the user to `/uiux-init` instead.** Actions: audit, review, tweak, polish, sweep, pre-ship pass. Inputs: branch or surface paths, `docs/DESIGN.md`. Outputs: IDed AUD-xxx fix list with applied/deferred status, change summary."
argument-hint: "[branch or surface paths]"
license: MIT
metadata:
  author: alex-yoza
  version: "1.0.0"
---

# /uiux-audit: Review the design and apply tweaks

Walk the project's UI against the existing `docs/DESIGN.md`, surface
the gaps, and **apply the fixes** inline. Unlike a critique-only
pass, this skill ships code. Unlike a redesign, it does not change
the underlying style; it makes the screens match the doc.

## Hard prerequisite

`docs/DESIGN.md` **must exist** at the project root. If it does not:

1. Stop immediately: do not audit, do not propose tweaks, do not
   read any reference files.
2. Tell the user:
   > "No `docs/DESIGN.md` found. `/uiux-audit` requires a design doc
   > to audit against. Run `/uiux-init` first to generate one, then
   > re-run `/uiux-audit`."
3. Exit.

Never fabricate a design doc on the fly to unblock the audit. Never
fall back to a generic system. The point of this skill is to enforce
the *project's* doc.

## When to Activate

- After `/uiux-init` is done and screens exist.
- Before a UI ship or stakeholder review.
- Mid-build when drift is suspected.
- When the user says "audit the UI," "polish this," "tweak the
  design," "sweep the screens," or "is this ready to ship?"
- Skip if the change is non-UI (backend, infra, tooling).

## Workflow

Run in order. Stop, fix, and re-walk the stage when a critical
issue is found.

### Step 0: Load the design doc
Read `docs/DESIGN.md` in full. Pull out: primary + secondary
direction, brand adjectives, anti-patterns, tokens, component rules,
empty/loading/error policy.

### Step 1: Scope the surfaces
List every customer-facing screen / component / page in the target
branch. Exclude admin tooling unless the user named it.

### Step 2: Style fit
For each surface, compare to `references/<primary>.md` and
`references/<secondary>.md` named in the doc. Note divergences as
`AUD-<###>` items.

### Step 3: Token + component fit
Compare actual colors, type, spacing, radii, shadows, motion
durations, and component shapes to the doc's tokens. Anything
off-token is an `AUD-` item.

### Step 4: Checklist sweep
Walk every applicable file in `checklists/`:
- `accessibility.md`
- `responsive.md`
- `mobile-interaction.md` (if mobile is in scope)
- `visual-quality.md`
- `interaction-states.md`
- `forms.md` (if forms present)
- `navigation.md`
- `performance.md`

### Step 5: AI-UI tells pass
Apply `prompts/generic-ai-ui-detector.md` to every customer-facing
screen. A single tell is a yellow flag; two or more is an `AUD-`
item with severity `high` minimum.

### Step 6: Consistency sweep
Radius, shadow, color, type size, motion duration: they must match
across screens. Flag inconsistencies.

### Step 7: Reduced motion + dark/light + empty/loading/error
Toggle `prefers-reduced-motion`. Verify dark/light parity. Verify
every data region has empty, loading, and error states per the
doc's policy.

### Step 8: Sort and prioritize
Rank `AUD-` items: `critical` > `high` > `med` > `low`. Bundle
related items.

### Step 9: Apply tweaks
Implement fixes inline. Smallest change that resolves the item.
Don't refactor surrounding code. Don't lose interaction states the
original had. Don't strip features.

**Penpot is the source of truth for layout/design** (see
[`../../knowledge/workflow/penpot-source-of-truth.md`](../../knowledge/workflow/penpot-source-of-truth.md)):
any `AUD-` item that changes layout or design goes Penpot-first, then code. When
the app's Penpot wireframe file is open and Connected, update the boards before
applying the tweak; when Penpot is not connected, record a `Penpot-sync: pending`
debt on the changed screen (in `docs/wireframes/README.md`) and reconcile it
before the audit is called done. No review gate unless the user asks to preview
in Penpot first. Purely non-visual fixes are exempt.

For each `AUD-` item, mark: `applied` | `partial` | `deferred
(reason)`.

### Step 10: Re-verify
Re-run steps 2–7 against the modified surfaces. Anything still
failing gets a second pass. If a screen still trips the AI-UI
detector after two passes, escalate: recommend `/uiux-redesign`.

## Files referenced

- `docs/DESIGN.md` (project): required.
- `references/<primary>.md`, `references/<secondary>.md`: as named
  in the doc.
- `tokens/*.md`: token shape reference.
- `checklists/*.md`: every file applicable to the surface.
- `prompts/critique-ui.md`, `prompts/generic-ai-ui-detector.md`,
  `prompts/final-ui-qa.md`.

## Output Format

```
AUDIT REPORT: <product>, <date>

DESIGN DOC:              docs/DESIGN.md (loaded)
SURFACES AUDITED:        <count>: <list>

ID       AREA          ISSUE                       SEVERITY    STATUS
AUD-001  Tokens        <…>                         high        applied
AUD-002  AI-UI tells   <…>                         critical    applied
AUD-003  A11y          <…>                         high        partial
…

CONSISTENCY:             <pass | issues fixed>
REDUCED MOTION:          <pass | issues fixed>
DARK / LIGHT PARITY:     <pass | issues fixed>
EMPTY/LOADING/ERROR:     <pass | issues fixed>
AI-UI DETECTOR:          <pass | borderline: see AUD-xxx>

REMAINING DESIGN DEBT:
  - <…>

NEXT STEP:               <ship | re-audit | escalate to /uiux-redesign>
```

## Safety / quality checks

- Refuse to run without `docs/DESIGN.md`. No exceptions.
- Don't soften severity to be polite.
- Don't lose interaction states the original had.
- Don't strip features under the banner of "polish."
- Don't change the underlying style; that's `/uiux-redesign`'s job.
- Never break WCAG AA in a tweak.
- Cite `file:line` for every `AUD-` item.

## Example

> "/uiux-audit: current branch."
