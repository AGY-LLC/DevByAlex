# {{APP_NAME}}: Wireframes

> Written by `/plan-wireframes`, in one of two modes. **GENERATE** (greenfield):
> low-fidelity Penpot boards per feature. **CAPTURE** (existing app): an inventory
> of the screens already in the code: no Penpot. Either way it's the artifact each
> feature is validated against and **part of Alex's approval gate** with the guide.

**Mode:** GENERATE (Penpot) | CAPTURE (from code): _delete one_
**Penpot file/project:** _link (GENERATE only)_
**Updated:** {{DATE}}

<!-- Exempt app? If this app ships no UI at all (CLI, MCP server, library) or its
     surface is too simple to pay for the Penpot round-trip (a static one-pager),
     Alex may replace the two lines above with:
       **Penpot:** exempt (permanent) - <no UI surface | surface too simple>
       **Reason:** <what the app is, why boards would not inform it>
       **Declared:** <YYYY-MM-DD>
     No boards then apply; every other gate still does.
     See knowledge/workflow/penpot-wireframes.md. Alex declares this, never
     an agent. -->


## Screen → feature map

> In CAPTURE mode, "Frame link / source" is the file the screen lives in, and
> mark states that are **missing** in the code (they become feature-board work).

| Feature | Screen | Frame link / source | States covered |
|---------|--------|---------------------|----------------|
| _auth_ | Login | _link or `src/...`_ | default, error |
| _auth_ | Sign up | _link or `src/...`_ | default, loading, error |
| _…_ | _…_ | _…_ | _…_ |

## Primary user flow(s)

1. _Landing → Sign up → Onboarding → <core screen> → <core job>_
2. _…_

## Notes

- Low-fidelity: structure and flow, not pixel polish.
- Non-happy states (empty / loading / error) are included, that's where flows
  break.
- If `docs/DESIGN.md` exists, these honor its tokens.
- **The Penpot boards are plan-time intent, refreshed on demand** (see
  `knowledge/workflow/penpot-wireframes.md`): they are built once and updated
  only when Alex asks, so they drift from the shipped UI by design. Dev-stage
  work never touches Penpot.
- **The screen table above is the part that must stay current.** It is text, so
  an unattended run can maintain it: when a screen's structure or states change,
  update its row (and mark states the code lacks as **(missing)**).
