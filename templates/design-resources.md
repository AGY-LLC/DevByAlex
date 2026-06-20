# {{APP_NAME}} — Design Resources

> Written by `/plan-wireframes` (design stage) from the spec's Design & UX
> answers and the brand (`docs/BRAND.md` / `docs/DESIGN.md` if present). Specs the
> **app-wide** visual assets that aren't tied to a single screen — the loading
> animation, the marketing load-in, and the social preview image — so
> `/dev-scaffold` builds them into the baseline and `/launch-compliance` can verify
> them. Part of the wireframe/design approval gate.

**Status:** draft <!-- draft | approved -->
**Updated:** {{DATE}}

## Brand inputs

- **Logo:** _path/URL; is an **SVG** available? (drives the logo-based loader and
  the OG card)._
- **Primary / accent colors:** _from `docs/BRAND.md`._
- **Type:** _display + body fonts._
- **Motion personality:** _2–3 adjectives (e.g. crisp, playful, calm) — drives the
  easing and duration choices below so motion matches the theme._

## App loading animation (in-app loader)  — **Required**

> The small, repeatable loader shown on initial boot, route transitions, and
> Suspense/data fetches. Theme is the inspiration. Distinct from the marketing
> load-in below. **Every app gets a custom loader** — this is a tracked checklist
> item (`Custom app loader` in `docs/STATUS.md`). It may be **overridden**, but
> only with a recorded reason; it must never be silently skipped.

- **Override (if not building a custom loader):** _leave blank to build one.
  Otherwise record the reason and what's used instead (e.g. "framework default
  spinner — internal tool, no brand yet"). A recorded override satisfies the
  checklist; a blank with no loader built is a gap._

- **Approach (decided per project):**
  - **Logo-based** — animate the logo SVG (draw-on / mask-reveal / pulse /
    shimmer). Preferred when a clean logo SVG exists.
  - **Theme-derived** — an abstract loader built from the brand's color + shape
    language (e.g. morphing blob, orbiting dots, mesh-gradient pulse) when there's
    no logo SVG or a richer feel is wanted.
  - **Generated animation** — a Lottie / short video loop for a bespoke loader.
    Record where the asset comes from and confirm it's brand-matched.
- **Technique / format:** _SVG + CSS keyframes / Framer Motion / Lottie._
- **Timing:** _loop duration + easing — keep it light. Honor
  `prefers-reduced-motion` (fall back to a static logo or simple spinner)._
- **Where it shows:** _initial app load, route change, Suspense fallback._

## Marketing load-in (landing / marketing hero) — _public surfaces only_

> A one-time, on-first-paint entrance for the landing/marketing hero. **Separate
> from the app loader.** Skip this section entirely if there's no public marketing
> page.

- **Hero reveal:** _staggered fade-up of headline → subhead → CTA → media
  (`translateY` + `opacity` only — GPU-friendly, no layout-affecting props).
  ~300–600ms per element, ease-out, ~60–120ms stagger; first meaningful content
  visible within ~1s._
- **Background treatment (optional):** _Stripe-style animated WebGL mesh gradient
  (~10kb minigl / Gradient.js, GLSL noise, a ScrollObserver that pauses it
  off-screen, target 60fps on mobile) — or a lighter CSS gradient. Match the
  brand colors._
- **Constraints:** _don't block LCP or cause layout shift; animate after paint.
  Honor `prefers-reduced-motion` — render the final state with no motion._

## Social preview (OG) image

> The link-share card (1200×630). **Stripe-style:** a clean, branded template —
> brand-colored / gradient backdrop, crisp typographic title, the logo, an
> optional product motif — consistent across the site, with the page title filled
> per route.

- **Generation:** _dynamic from brand tokens (`@vercel/og` / Satori via
  `opengraph-image.tsx`) — app name + tagline + logo + colors pulled from
  `docs/BRAND.md`. You provide the **logo** only; everything else derives from the
  brand and regenerates when it changes._
- **Per-page vs static:** _one default site card + per-route title where useful
  (blog posts, key landing pages)._
- **Override:** _a hand-designed image may be dropped in to replace the generated
  card for any route._
- **Wiring:** _`og:image` + `twitter:image` (`summary_large_image`), **absolute**
  URL, exactly 1200×630. Verified to actually resolve by `/launch-compliance`
  (SEO step)._
