# Feature {{NN}}: {{FEATURE_NAME}}

> One card per feature, written by `/plan-guide` and built to done by
> `/feature-loop`. The card says what the feature must achieve; the ADR says
> what is already decided and why. Everything else (data shape, routes,
> components, file layout) is the implementer's call within the guide, the ADR
> and the hard rules in `docs/DECISIONS.md`. `test-author` writes tests from
> **Goal** and **Done when** only.

**Status:** todo <!-- todo | in-progress | blocked | done -->
**Depends on:** _scaffold, auth, feature NN…_
**Wireframes:** _link(s) to the screens in `docs/wireframes/`_
**ADR:** `docs/adr/{{NN}}-{{SLUG}}.md`

## Goal

_One paragraph: what a user can do once this ships and why it matters.
Traceable to a spec core job._

## Done when

Outcome-based: each line is observable from outside the code.

- [ ] _Given … when … then …_
- [ ] _Failure path: …_
- [ ] _Edge case: …_
- [ ] _Security boundary: who may and may not do this (authz, ownership/IDOR,
      validation, rate limit)._
- [ ] _Screens: which wireframe screens, with the states each must handle
      (empty, loading, error, onboarding, upgrade as relevant)._
- [ ] _Accessibility (UI features, WCAG 2.2 AA): semantic structure and
      name/role, keyboard with visible focus, contrast, target size, labeled
      inputs and errors._
- [ ] _SEO (public pages only): title/description, headings, alt text._

## Constraints

- _Anything sensitive the builder must respect that isn't a decision: PII
  handling, data that must never leave the server, a limit from a provider._

## Out of scope

- _What this feature does not do. Each line is mirrored as an `O`-entry in the
  ADR so reviews don't flag it later._
