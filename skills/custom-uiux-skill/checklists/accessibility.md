# Checklist: accessibility

WCAG 2.1 AA is the floor. Some products need AAA on specific things
(contrast for medical, motion for vestibular-sensitive audiences).
Check the brief.

## Contrast

- [ ] Body text: ≥ 4.5:1 against its background.
- [ ] Large text (18pt regular / 14pt bold or larger): ≥ 3:1.
- [ ] UI components and graphical objects (icons, focus rings, form
      borders): ≥ 3:1.
- [ ] Hover and focus states maintain contrast (don't drop into the
      surface color).
- [ ] Functional colors (positive, warn, danger) pass against every
      surface they appear on, in both light and dark mode.
- [ ] No text on busy photographic backgrounds without a scrim.

## Keyboard

- [ ] All interactive elements reachable with Tab in a logical order.
- [ ] Focus ring visible on every focusable element, never `outline:
      none` without a replacement.
- [ ] Custom controls (selects, menus, dialogs, tabs) implement the
      keyboard pattern from WAI-ARIA APG.
- [ ] No keyboard traps: modals can be dismissed and exited with
      keyboard alone.
- [ ] Skip-to-content link on pages with long navs.
- [ ] Tab order survives dynamic content insertion.

## Screen reader

- [ ] Each page has a unique, descriptive `<title>`.
- [ ] Landmarks: header, nav, main, footer.
- [ ] Headings form a meaningful outline (no skipping levels for
      style).
- [ ] Icons that convey meaning have accessible labels; decorative
      icons are `aria-hidden`.
- [ ] Form inputs have `<label>` (not just placeholder).
- [ ] Errors are announced (`aria-live` or proper role on alerts).
- [ ] Dynamic content updates use `aria-live` regions when appropriate.
- [ ] Images have alt text; decorative images use `alt=""`.

## Motion & animation

- [ ] `prefers-reduced-motion` respected: purely decorative motion
      disabled.
- [ ] Meaningful motion (streaming text, progress indication) still
      conveys its meaning when motion is reduced.
- [ ] No flashing > 3 times per second (seizure risk).
- [ ] Parallax and large transforms disabled under reduced motion.

## Text scaling & zoom

- [ ] Layout survives at 200% browser zoom: no horizontal scroll on
      body content.
- [ ] Text size respects user OS settings.
- [ ] No fixed-height containers that clip text at large sizes.
- [ ] Line lengths reflow gracefully.

## Forms specifically

- [ ] Labels visible, not placeholder-only.
- [ ] Errors not color-only: include an icon and text.
- [ ] Required fields marked in text, not only with an asterisk color.
- [ ] Helper text persistent (don't only show on focus).
- [ ] Field-level errors associated via `aria-describedby`.

## Internationalization / RTL

- [ ] Layout works in RTL if any target locale is RTL.
- [ ] Icons that imply direction (arrows, back/forward) flip in RTL.
- [ ] Numerals and dates respect locale.
- [ ] No baked-in English error messages where the rest is localized.

## Common misses

- [ ] Custom checkboxes / toggles announce state.
- [ ] Disabled buttons are perceivable (not just visual).
- [ ] Tooltips don't disappear on hover-out before users can read them.
- [ ] Modals trap focus and return it to the trigger on close.
- [ ] "Close" affordances on modals reachable by keyboard.
- [ ] Touch targets ≥ 44×44 pt on mobile.
