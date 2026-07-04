# Feature {{NN}} — {{FEATURE_NAME}}

> One card per feature, written by `/plan-guide`. The `test-author` writes tests
> from the **Acceptance criteria**; the `feature-implementer` builds from the
> rest. The `feature-loop` builds this card to done.

**Status:** todo <!-- todo | in-progress | blocked | done -->
**Depends on:** _scaffold, auth, feature NN…_
**Wireframes:** _link(s) to the screens in `docs/wireframes/`_
**ADR:** `docs/adr/{{NN}}-{{SLUG}}.md` — consult before changing this feature; breaking an active decision needs explicit confirmation

## Purpose

_One paragraph. Traceable to a spec core-job._

## Behaviors / user stories

- _As a <user>, I can <do X> so that <outcome>._
- _Error/edge behavior: <what happens when …>._

## Data model

- _Entities/fields/relations/indexes this feature adds or touches. `select` to
  avoid over-fetching; transactions for multi-step writes._

## API / server surface

- _Routes/handlers/services, with Zod-validated inputs/outputs. Thin handlers;
  logic in services._

## UI / screens

- _Which wireframe screens; the states each needs (default, empty, loading,
  error, onboarding, upgrade)._
- _SEO (public pages only): page title/description, heading hierarchy, image
  alt text, canonical/structured data if applicable._

## Acceptance criteria (tests are written from THIS — keep it outcome-based)

- [ ] _Given … when … then … (observable outcome)_
- [ ] _Failure path: …_
- [ ] _Edge case: …_
- [ ] _Security boundary: … (authz, ownership/IDOR, validation, rate limit)_
- [ ] _Accessibility (UI features — WCAG 2.2 AA): semantic structure + correct
      name/role, keyboard-operable with visible focus, sufficient contrast,
      adequate target size, labels tied to inputs and errors._

## Security & privacy notes

- _Authz rules (default-deny), PII handling, validation, anything sensitive._

## Out of scope

- _What this feature explicitly does not do. Mirror each entry into the ADR's
  **Deliberate omissions** so automated reviews don't flag it later._
