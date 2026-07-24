# Checklist: mobile interaction

Mobile is not "desktop shrunk." Test with a phone in hand or a 375px
dev viewport plus touch emulation.

## Thumb reach

- [ ] Primary action sits in the lower 60% of the screen.
- [ ] Destructive actions are not in the easy-thumb zone unless
      protected by a confirmation.
- [ ] Top-bar actions are reachable (or have a duplicate in the
      bottom).
- [ ] Tab bar buttons are evenly spaced and at least 44pt tall.

## Tap targets

- [ ] Every interactive target ≥ 44×44 pt.
- [ ] Spacing between adjacent targets ≥ 8pt to avoid mis-taps.
- [ ] Inputs are at least 44pt tall.
- [ ] Tappable rows (list items, cells) have a visible press state.

## Gestures

- [ ] Swipe-back from the left edge works on every screen. Horizontal
      carousels do not block it (start the carousel away from the
      edge).
- [ ] Pull-to-refresh is present on lists where users expect it.
- [ ] Long-press opens context menus (and that fact is discoverable).
- [ ] Drag-to-dismiss works on sheets and modals.
- [ ] No gestures conflict with system gestures (home indicator
      swipe, notification pull-down).

## Keyboard

- [ ] Focused inputs scroll into view above the keyboard.
- [ ] Submit affordance is reachable above the keyboard (accessory
      bar, sticky button, or "Done" key).
- [ ] Each input has correct `inputMode` (numeric, email, tel, url,
      decimal, search).
- [ ] `autocomplete` set on every credential and address-like field.
- [ ] `enterKeyHint` set so the return key reads "Next" / "Done" /
      "Send" appropriately.
- [ ] Keyboard dismisses on tap outside the field in scrollable forms.

## Sticky chrome

- [ ] Bottom CTA bars do not occlude content above them.
- [ ] If the page has both a sticky CTA and a tab bar, they don't
      collide.
- [ ] Top bars can shrink/disappear on scroll where appropriate.
- [ ] Safe area insets respected (notch, dynamic island, home
      indicator).

## Media

- [ ] No auto-play with sound.
- [ ] Off-screen videos pause to save battery.
- [ ] Full-bleed images respect safe area.
- [ ] No motion auto-plays on first load on cellular by default.

## Haptics

- [ ] Confirm-style actions (send, like, save) trigger a light haptic.
- [ ] Destructive confirmations trigger a heavier haptic.
- [ ] Haptics not used decoratively.

## Skeletons & optimistic UI

- [ ] Skeletons match the real layout exactly (don't show a generic
      grey blob if the real content is a feed card).
- [ ] Social actions (like, follow, react) reflect immediately.
- [ ] On error, the optimistic state reverts cleanly with a toast.

## Performance

- [ ] Interaction-to-paint < 100ms on a mid-range phone for taps.
- [ ] Lists virtualize beyond ~50 rows.
- [ ] No JS-heavy parallax on mobile by default.

## Common misses

- [ ] "Hover" states don't replace tap affordances.
- [ ] Tooltips do not appear on tap-and-hold without an explicit trigger.
- [ ] Forms do not zoom the viewport on focus (iOS): body input ≥ 16px.
- [ ] Modal stacks do not blow up tab-and-back gestures.
- [ ] Pull-to-refresh is not present on screens where it would discard
      in-progress work.
