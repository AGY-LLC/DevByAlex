# Checklist: navigation

Navigation tells the user where they are, where they can go, and how to
get back. Most navigation failures are quiet; the user just stops
exploring.

## Structure

- [ ] Top-level destinations ≤ 7. If more, group them.
- [ ] Each top-level destination is named in a noun the user uses, not
      jargon.
- [ ] Section titles match page titles match URL slugs (or the
      disagreement is documented).
- [ ] No "Home" link that goes to a marketing page when the user is
      logged in (use logo → app surface).

## Wayfinding

- [ ] Current section / page is clearly indicated in the nav.
- [ ] Breadcrumbs present on deep pages and reflect actual hierarchy.
- [ ] Page title in the document matches what the user clicked.
- [ ] URL accurately encodes the visible state (deep links work).

## Behavior

- [ ] Browser back works after AJAX navigation.
- [ ] Browser back from a modal closes the modal, not the page.
- [ ] Forward/back round-trips preserve scroll position.
- [ ] Refreshing the page keeps the user on the same screen.

## Mobile

- [ ] Tab bar has 3–5 destinations max.
- [ ] Tab icons are labeled (no icon-only unless universally known).
- [ ] Drawer opens with swipe and a hamburger; closes with the same.
- [ ] No double navigation (top tabs AND bottom tabs at the same level).
- [ ] Hardware/OS back button respected on Android.

## Search

- [ ] Global search (Ctrl/Cmd-K) where appropriate.
- [ ] Recent / suggested queries on idle.
- [ ] Keyboard-only navigation through results works.
- [ ] Results group by type (notes, people, files) where relevant.

## Discoverability

- [ ] Primary actions are visible: not behind kebab menus.
- [ ] Secondary actions are findable; kebab menus are acceptable for
      them.
- [ ] Hover-only menus have a tap equivalent.
- [ ] Keyboard shortcuts visible (in a `?` overlay or next to actions).

## Errors

- [ ] 404 page is on-brand and offers a way back.
- [ ] 403 / unauthorized clearly distinguishes "you're not logged in"
      from "you don't have access."
- [ ] Login → original-destination round-trip works (no dropping the
      user on the home page after auth).

## Multi-tenant / multi-environment

- [ ] Organization / workspace switcher is unambiguous.
- [ ] Environment (sandbox / prod) is loudly indicated where it
      matters.
- [ ] Role (admin / member / read-only) is visible somewhere relevant.
- [ ] Destructive actions in non-prod environments still confirm.

## Onboarding

- [ ] First-time users land somewhere useful, not at "Welcome!".
- [ ] "Skip" is available on every tutorial step.
- [ ] Tutorial overlays don't block real actions.
- [ ] Returning users don't see the tutorial again unless they ask.

## Common misses

- [ ] Active state on the nav item visually weaker than hover.
- [ ] Nav items rearrange between breakpoints (memory burden).
- [ ] Modal "close" affordance is only the backdrop; users on touch
      tap-by-accident.
- [ ] "Back" in the app doesn't go back, it logs you out.
- [ ] Workspace switcher hidden behind a tiny chevron next to the user
      avatar.
