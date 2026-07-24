# Checklist: performance

Performance is part of UX. A "beautiful" page with a 6-second LCP is a
broken page.

## Core Web Vitals targets

- [ ] **LCP** (largest contentful paint) < 2.5s on a mid-range phone
      on 4G. Identify the LCP element on every key page and protect
      it.
- [ ] **CLS** (cumulative layout shift) < 0.1. Reserve aspect ratios
      for images, ads, and embedded media.
- [ ] **INP** (interaction to next paint) < 200ms for primary
      interactions.
- [ ] **TTFB** < 0.8s for static; reasonable for SSR.
- [ ] **FCP** < 1.8s.

## Images

- [ ] Hero image weight < 200KB (compressed, modern format).
- [ ] Modern formats used (AVIF, then WebP, with JPEG/PNG fallback).
- [ ] `srcset` and `sizes` for responsive images.
- [ ] `<img>` has explicit `width` and `height` (or aspect ratio in
      CSS).
- [ ] Lazy-loaded below the fold; eager-loaded above it.
- [ ] No 4000×3000 hero images served to mobile.

## Fonts

- [ ] Self-hosted critical fonts where possible.
- [ ] `font-display: swap` or `optional` set to avoid invisible text.
- [ ] Only the weights actually used are loaded.
- [ ] Subset fonts where possible (latin, latin-ext only if not
      needed).
- [ ] Variable fonts considered for products that use many weights.

## JavaScript

- [ ] No third-party analytics or chat scripts blocking the main
      thread on first load: async/defer them.
- [ ] Hydration cost bounded: don't ship a SPA-sized bundle for a
      mostly-static landing page.
- [ ] Code-split routes; lazy-load heavy components (charts, editors).
- [ ] Verify no large libraries are accidentally shipped to mobile
      (look at bundle analyzer output).

## CSS

- [ ] Critical CSS inlined or otherwise small enough.
- [ ] No 200KB Tailwind production bundle: purge correctly.
- [ ] Animations use `transform` and `opacity` (GPU-friendly), not
      width/height/top/left.

## Network

- [ ] Aggressive caching for static assets (long max-age + filename
      hashes).
- [ ] HTTP/2 or HTTP/3 in use.
- [ ] No 50 small icon requests when a single sprite or inline SVG
      would do.
- [ ] Critical API calls happen in parallel, not waterfalled.

## Perceived performance

- [ ] Skeletons or progressive content for slow regions.
- [ ] Optimistic UI on social-style interactions.
- [ ] Instant feedback on every press (haptic / press state).
- [ ] No spinner where a skeleton would carry layout.

## Lists & tables

- [ ] Virtualization beyond ~50 rows on lists.
- [ ] Pagination or infinite scroll on long tables.
- [ ] Avoid rendering 10k DOM nodes for what could be a server query.

## Mobile specifics

- [ ] No JS-heavy parallax on mobile.
- [ ] Reduced motion respects performance: fewer animations to run.
- [ ] Background videos disabled on cellular by default.

## Power and battery

- [ ] No animations running off-screen.
- [ ] No interval-based polling when WebSockets/SSE would do.
- [ ] Pause video and audio when off-screen.

## Common misses

- [ ] Large client-side analytics SDK loaded eagerly on a marketing
      page.
- [ ] A 1.2MB Lottie animation in the hero "just for fun."
- [ ] Hero image loaded after fonts and JS instead of first.
- [ ] CLS from a banner that injects late at the top of the page.
- [ ] Carousel rendering all slides at once even with virtualization
      available.
