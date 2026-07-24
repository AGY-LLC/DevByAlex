# Checklist: responsive

A responsive UI isn't one layout that scales; it's a deliberate set of
layouts for the viewports your users actually use.

## Breakpoints

Use breakpoints that match real device classes, not arbitrary numbers:

- **xs**: 360–479px (small phones, also the safety net)
- **sm**: 480–767px (phones / phablets)
- **md**: 768–1023px (small tablet, also large phone landscape)
- **lg**: 1024–1279px (laptop)
- **xl**: 1280–1535px (standard desktop)
- **2xl**: ≥ 1536px (large monitor)

Match the project's actual framework breakpoints if they differ.

## Per viewport

For each breakpoint:

- [ ] Layout is intentional, not a side-effect of `flex-wrap`.
- [ ] Primary action is reachable and obvious.
- [ ] Type sizes are appropriate for the viewport (mobile body ≥ 15px,
      desktop body ≥ 16px).
- [ ] Touch targets ≥ 44×44 pt on touch viewports.
- [ ] Tap-only and hover-only states differ; touch viewports don't
      rely on hover for critical info.
- [ ] Sticky chrome doesn't occlude content.

## Reflow rules

- [ ] No horizontal scrolling on the body at any viewport.
- [ ] Tables reflow to cards or get a horizontal scroll region (with a
      visible affordance) on small viewports.
- [ ] Multi-column layouts collapse to single column at the right
      breakpoint, not at 320px after content has already overflowed.
- [ ] Sidebars collapse to drawers or icon strips below a known
      breakpoint.
- [ ] Modals are full-screen sheets on mobile, not floating tiny
      windows.
- [ ] Wide hero images letterbox tastefully on portrait viewports (or
      get a portrait variant).

## Hidden content

- [ ] Content that *disappears* at small viewports was intentionally
      cut, not accidentally hidden. Document it in the page override.
- [ ] No critical action is accessible only on desktop.
- [ ] Secondary actions on mobile live behind an overflow menu, not
      removed entirely.

## Images & media

- [ ] Responsive images (`srcset` / `sizes` / `<picture>`) used for
      large media.
- [ ] Aspect ratios reserved via CSS to prevent CLS.
- [ ] Background images degrade to solid color or gradient on slow
      connections.

## Density adaptation

- [ ] Dense data surfaces (tables, dashboards) provide a
      density-toggle on desktop, and a card view on mobile.
- [ ] Mobile composers and editors do not try to render the desktop
      toolbar; they offer the same tools via the keyboard accessory
      bar or a sheet.

## Print

- [ ] Important pages (invoices, articles, receipts) have a print
      stylesheet: no nav, no ads, body text legible at 11–12pt.

## Common misses

- [ ] At 320px width nothing breaks.
- [ ] Landscape phones (typically ~700×360) don't show a desktop
      layout incorrectly.
- [ ] iPad portrait (768px) doesn't get desktop layout that wastes
      space.
- [ ] At 4K (3840×2160) the layout doesn't stretch to infinity: set a
      max-width.
- [ ] Loading states are responsive too: skeletons should match the
      target layout at each breakpoint.
