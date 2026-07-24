# Prompt: mobile-ui-polish

Polish a mobile surface to feel native-quality. The most common
failure mode is "desktop UI shrunk down": this prompt fixes that.

## Inputs

- The mobile screen(s) in scope.
- The style choice block.
- The current viewport behavior (mobile-first, responsive, or
  desktop-with-mobile-fallback).

## Behavior

1. Open the screen at 375px width and walk it from the top with your
   thumb on the right edge of the device.
2. Check the thumb-reachable zone (lower 60% of the screen). The
   primary action must be there.
3. Check tap targets: every actionable element must be ≥ 44×44 pt.
4. Check the gesture map:
   - Swipe back: works and is not blocked by horizontal scrollers.
   - Pull to refresh: present where users expect it.
   - Long-press: opens context menus where it should.
   - Drag to dismiss: works on sheets and modals.
5. Check the keyboard:
   - Inputs scroll into view when focused.
   - The submit affordance is reachable above the keyboard.
   - Correct `inputMode`, `autocomplete`, `enterKeyHint` on every
     input.
6. Check sticky chrome:
   - Bottom CTA bars do not occlude content above.
   - Top bars shrink/disappear on scroll where appropriate.
   - Safe-area insets respected (notch, home indicator).
7. Check media:
   - Images are not letterboxed badly; full-bleed where the reference
     calls for it.
   - Videos do not autoplay with sound; pause when off-screen.
8. Check perceived performance:
   - Skeleton placeholders match the real layout exactly.
   - Optimistic UI on social-style interactions.
9. Check density and type sizes: minimum body 15px on mobile, 16px
   preferred. Tap labels ≥ 13px.
10. Run `checklists/mobile-interaction.md` end-to-end.
11. Run `prompts/generic-ai-ui-detector.md`.

## Output format

1. A short narrative of what changed and why.
2. The implementation.
3. A "mobile QA notes" block:
   ```
   THUMB REACH:           <pass / issues>
   TAP TARGETS:           <pass / issues>
   GESTURES:              <pass / issues>
   KEYBOARD:              <pass / issues>
   SAFE AREA:             <pass / issues>
   PERF:                  <LCP, INP, skeleton match>
   ```

## Safety / quality checks

- Do not assume the desktop layout will work shrunk. Most won't.
- Do not introduce a bottom tab bar in addition to a sticky CTA; pick
  one or the other unless the screen demands both (and then test that
  they don't collide).
- Do not break the OS swipe-back gesture with horizontal carousels.
- Never override a native input control with a fake one that loses
  keyboard accessibility.

## Example invocation

> "Use prompts/mobile-ui-polish.md on src/screens/Feed.tsx. The product
> is the photo-sharing preset."
