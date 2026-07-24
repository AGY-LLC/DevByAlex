# Checklist: interaction states

Every interactive element needs a full state set. The most common
shipping failure is missing focus, disabled, loading, or empty states.

## Buttons

For every button variant (primary, secondary, ghost, destructive,
small, icon-only):

- [ ] Default
- [ ] Hover (cursor-only devices)
- [ ] Focus (visible ring, keyboard reachable)
- [ ] Active / pressed
- [ ] Disabled: perceivably different, still readable, not enabled-
      looking
- [ ] Loading: the button shows progress; subsequent clicks are
      blocked
- [ ] Destructive confirm: second-tap-to-confirm OR a confirmation
      modal echoing the value being changed

## Inputs

For every input (text, textarea, select, search, password, number,
date, file, toggle, checkbox, radio):

- [ ] Default
- [ ] Hover
- [ ] Focus (clear ring, raised label or visible label)
- [ ] Filled (label persists if floating)
- [ ] Disabled
- [ ] Read-only (looks like input, but unmistakably not editable)
- [ ] Error: color + icon + text
- [ ] Success: used only when it conveys meaning (e.g., field-level
      "username available")

## Cards / list rows

- [ ] Default
- [ ] Hover (cursor-only)
- [ ] Focus (keyboard reachable, ring visible)
- [ ] Pressed (subtle scale or background shift)
- [ ] Selected (clear, persistent)
- [ ] Loading (skeleton matching real layout)
- [ ] Empty (designed empty state, not "no items")
- [ ] Error (load failure with retry)

## Data regions (charts, tables, feeds)

- [ ] Loading: skeleton or spinner appropriate to scale.
- [ ] Empty: explains *why* it's empty and what to do.
- [ ] Error: clear cause when known; retry affordance.
- [ ] Partial: when some data loaded and some failed.
- [ ] Live updating: subtle indicator (no full re-render flash).

## Modals & sheets

- [ ] Open animation (motion-reduced-safe).
- [ ] Close: backdrop tap, Esc key, explicit close button.
- [ ] Trap focus on open, return focus on close.
- [ ] Mobile: full-screen sheet or bottom sheet with drag-to-dismiss.
- [ ] Stacked modals avoided where possible: flatten into a wizard.

## Toasts & banners

- [ ] Persistent banners for state that requires action (offline,
      payment failed).
- [ ] Toasts for transient notifications; auto-dismiss with a pause-
      on-hover.
- [ ] Toasts don't obscure the action they confirm.
- [ ] Critical messages can be re-summoned (not lost after dismiss).

## Navigation

- [ ] Current page / current section visibly indicated.
- [ ] Hover state on nav items (cursor-only).
- [ ] Focus state visible.
- [ ] Mobile drawer: open, close, swipe-to-dismiss.
- [ ] Breadcrumbs reflect current location accurately.

## Drag & drop

- [ ] Drag-source has a "drag handle" affordance or the whole item is
      grabbable.
- [ ] Hover-over-target shows a drop-zone indicator.
- [ ] Keyboard alternative (move up / move down) for the same action.
- [ ] On drop: optimistic UI; on failure, revert with a toast.

## Search

- [ ] Idle state has a clear prompt.
- [ ] Loading state during query.
- [ ] Empty result state explains "nothing matched" without sounding
      personal.
- [ ] Error state on failed query.
- [ ] Recent / suggested queries available on idle.

## Selection

- [ ] Single-select state.
- [ ] Multi-select state: count visible, bulk actions surface.
- [ ] Select-all behavior: explicit ("all 1,247 across all pages?").
- [ ] Selection cleared on navigation or has explicit "keep selection"
      affordance.

## Common misses

- [ ] Buttons that look identical to disabled buttons when they're
      enabled.
- [ ] Inputs whose focus state has lower contrast than the default.
- [ ] Modals that don't return focus to the trigger.
- [ ] Toasts that block the bottom CTA on mobile.
- [ ] "Loading" overlays that don't actually block input; users
      double-submit.
