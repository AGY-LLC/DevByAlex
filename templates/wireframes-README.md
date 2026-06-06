# {{APP_NAME}} — Wireframes

> Written by `/plan-wireframes`, in one of two modes. **GENERATE** (greenfield):
> low-fidelity Figma frames per feature. **CAPTURE** (existing app): an inventory
> of the screens already in the code — no Figma. Either way it's the artifact each
> feature is validated against and **part of Alex's approval gate** with the guide.

**Mode:** GENERATE (Figma) | CAPTURE (from code) — _delete one_
**Figma file/project:** _link (GENERATE only)_
**Updated:** {{DATE}}

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
- Non-happy states (empty / loading / error) are included — that's where flows
  break.
- If `docs/DESIGN.md` exists, these honor its tokens.
