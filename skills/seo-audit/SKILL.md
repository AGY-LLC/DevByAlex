---
name: seo-audit
description: >-
  Audit the SEO and AEO/GEO (AI-search) surface of a repo's **public-facing marketing and content pages** — landing pages, the marketing site, blog/docs, pricing, product, and other indexable routes — from the code, not from a live crawl. Out of scope are authenticated app screens, dashboards, and other surfaces behind a login that are not meant to rank or be cited. Covers semantic HTML, framework metadata (Next.js Metadata API / Astro `<head>` / Remix meta export / Nuxt `useHead`), JSON-LD structured data, canonical and hreflang implementation, `robots.txt` and sitemap generation, image alt attributes, heading hierarchy, viewport and mobile config, internal linking patterns, i18n routing, and AI-search/AEO/GEO citability of those same marketing pages. Treats SEO as a coding workflow concern, not a marketing audit — fires on commits that touch marketing routes, layouts, `<head>` config, `sitemap.ts`, `robots.ts`, JSON-LD components, `next-sitemap` config, `app/(marketing)`, `metadata` exports, OpenGraph tags, or i18n config. **Hard requirement: refuses to run if `docs/BRAND.md` does not exist; routes the user to `/marketer-brand-generation` first** (brand drives correct page titles, descriptions, locale targeting, schema `Organization`/`Brand` fields). Use when the user says "SEO audit," "technical SEO," "check my meta tags," "review my structured data," "are my schemas right," "audit my sitemap," "is my hreflang correct," "core web vitals from the code," "metadata review," "head tag audit," "SEO before merge," "pre-launch SEO check," "AI search / AEO / GEO visibility," or "my SEO is bad." Not for keyword research, competitor analysis, or off-page link building — those are out of scope.
metadata:
  version: 3.1.0
---

# SEO Audit (Code-Side)

You audit SEO **from the code**, not from a live crawler. The repo is the source of truth — every meta tag, canonical, sitemap entry, JSON-LD block, and locale route comes from somewhere in the codebase. Find the wiring, verify it, and report issues against `docs/BRAND.md`.

This is a coding-workflow skill: it runs alongside `code-review`, `launch-readiness`, and `uiux-audit`, not as a standalone marketing exercise.

---

## Hard Requirement — `docs/BRAND.md`

Before doing anything else, check whether `docs/BRAND.md` exists at the repo root.

- **If it does not exist**, stop and tell the user:
  > Cannot audit SEO without a brand foundation. Page titles, meta descriptions, schema `Organization` fields, locale targeting, and AI-search positioning all derive from positioning, voice, and audience. Run `/marketer-brand-generation` first, then return here.
- **If it does exist**, read it in full. The audit will check that on-page text in the code (titles, descriptions, H1s, OG copy, schema fields) matches the positioning, ICP language, voice, and pillar messages locked in `docs/BRAND.md`. Misalignment with brand is a finding, not a stylistic preference.

Do not proceed past this gate without `docs/BRAND.md`. Do not fall back to `.agents/product-marketing.md` or asking the user questions — those are upstream of brand generation, not substitutes for it.

---

## Scope (and Non-Scope)

**Page focus — public-facing marketing and content pages.** This audit targets routes meant to rank in search and be cited by AI: the landing/marketing site, blog and docs, pricing, product, and other publicly indexable pages. Authenticated app screens, dashboards, and anything behind a login are out of scope — they aren't meant to be indexed or cited, so don't flag missing meta/schema/canonical on them. When a repo mixes both (e.g. `app/(marketing)` vs `app/(app)`), scope the audit to the marketing/content surface.

**In scope — anything inspectable in the code:**
- Framework metadata API output (Next.js `metadata` / `generateMetadata`, Astro `<head>`, Remix `meta`, Nuxt `useHead`, SvelteKit `<svelte:head>`, plain HTML `<head>`)
- OpenGraph, Twitter Card, and `og:image` generation (including dynamic OG via `opengraph-image.tsx` or similar)
- JSON-LD structured data blocks (`Organization`, `Product`, `Article`, `BreadcrumbList`, `FAQPage`, `SoftwareApplication`, `LocalBusiness`, etc.)
- Canonical tag implementation (per-page, multilingual, paginated)
- Hreflang implementation and i18n routing config (Next.js `i18n` / App Router `[locale]`, Astro i18n, Remix routes, Nuxt i18n)
- `robots.txt` / `robots.ts` and sitemap generation (`sitemap.ts`, `next-sitemap`, `@astrojs/sitemap`, custom builders)
- Semantic HTML structure in components: one `<h1>` per route, logical `<h2>`/`<h3>` hierarchy, `<main>`/`<nav>`/`<article>` landmarks, `<a>` with descriptive text (not "click here")
- `<img>` alt attribute coverage, `next/image` `alt` props, decorative-vs-meaningful distinction
- Viewport meta, `lang` attribute on `<html>`, charset
- Internal linking patterns (orphan routes, navigation depth, anchor text)
- Page-weight / hydration patterns visible in code that affect Core Web Vitals (blocking scripts, oversized hero images, non-streamed `await` in RSC, missing `loading="lazy"`, font loading strategy, web-font `display`)
- AI-search visibility / AEO / GEO from the code: render mode (SSR/SSG vs JS-only) on pages the brand wants cited, answer extractability (direct-answer-first paragraphs, question-shaped headings, self-contained chunks, semantic labeled lists), citation/trust signals (statistics, attributed quotes, inline source links, `dateModified` freshness, author `Person` schema), entity grounding (`Organization`/`Brand`/`Product`/`SoftwareApplication` JSON-LD, `sameAs`, consistent brand naming), `FAQPage`/`HowTo` schema, `llms.txt`, and robots rules for AI crawlers split by training vs retrieval/citation bots (`GPTBot`/`ClaudeBot` vs `OAI-SearchBot`/`ChatGPT-User`/`PerplexityBot`/`Claude-SearchBot`/`Google-Extended`, etc.)

**Out of scope — explicitly do not investigate:**
- Keyword research / SERP analysis / competitor ranking
- Off-page link building, backlink profile, domain authority
- Search Console crawl reports / impressions / clicks (the user can read those themselves)
- Subjective content "quality" or word count targets disconnected from code
- Live performance numbers (LCP/INP/CLS measured against staging) — only the code patterns that produce them
- Authenticated app screens, dashboards, and login-gated surfaces — SEO/AEO only applies to publicly indexable marketing/content pages

If the user asks for any out-of-scope item, name it as out-of-scope and continue with the code audit.

### Partitioning routes, and the one app-side exception

Building on the page focus above: at the **start** of the audit, partition the routes into (a) public marketing/content, (b) public app-generated, (c) authenticated app — and report which routes landed in each bucket. If a route's intended audience is ambiguous (could be public or gated), ask rather than assume.

- **(c) authenticated app** — dashboards, settings, account, in-product workspaces: out of scope. A missing title tag or absent JSON-LD here is **correct**, not a finding. Their semantic-HTML, alt-text, and heading hygiene still matter — but as an **accessibility** concern; route that to `/accessibility-critique`, not here.
- **(b) public, app-generated pages** — the one exception that pulls app routes *back into* scope: pages the app produces that are meant to be shared and indexed (public user profiles, public posts, marketplace listings, share links, public-by-default content) genuinely need metadata + structured data even though they live in the app. Audit those; skip the rest of the authenticated surface.

**Cross-bucket correctness check:** authenticated/app routes *should* carry `noindex` (or sit behind auth middleware) and *should not* appear in the sitemap — flag it as a finding when an app route is indexable, or when a marketing route is accidentally `noindex`'d.

---

## Schema Markup Detection — From Code, Not from `web_fetch`

You're auditing the code, so search for JSON-LD where it lives in the repo:

```
<script type="application/ld+json">
JSON.stringify({ "@context": "https://schema.org", "@type": ...
```

Grep targets:
- `application/ld+json`
- `@context.*schema.org`
- Common schema components: `<JsonLd`, `<StructuredData`, `<OrganizationSchema`, `schema.org/Organization`

Do **not** rely on `web_fetch` or `curl` to detect schema — they strip `<script>` tags during HTML conversion. If the user wants live-rendered validation as a follow-up, point them at Google's Rich Results Test (https://search.google.com/test/rich-results) — but the audit itself reads the source.

If the project uses a CMS plugin (AIOSEO, Yoast, RankMath) that injects schema client-side, note that the code audit cannot see plugin-generated JSON-LD and recommend Rich Results Test as a complement.

---

## Audit Workflow

1. **Read `docs/BRAND.md`** — pull positioning one-liner, ICP, voice adjectives, pillar messages, anti-patterns, locale list, brand name spelling.
2. **Map the SEO surface.** Find every place SEO is wired:
   - Framework: detect Next.js (App vs Pages Router), Astro, Remix, Nuxt, SvelteKit, vanilla HTML.
   - Metadata sources: `metadata` exports, `generateMetadata`, `<head>` blocks, layout files, root templates.
   - Sitemap source: `app/sitemap.ts`, `next-sitemap.config.js`, `@astrojs/sitemap`, custom script.
   - Robots source: `app/robots.ts`, `public/robots.txt`, framework-specific config.
   - i18n: routing config, `[locale]` segments, hreflang generator.
   - JSON-LD: dedicated components, inline scripts, layout-level blocks.
3. **Walk the priority order** (see below) — each layer gates the ones below it. No point checking title tags if pages aren't crawlable.
4. **Emit findings as `SEO-xxx` items** (see Output Format) so `fix-errors` can consume the queue directly.
5. **Cross-check each on-page string against `docs/BRAND.md`.** A grammatically correct title that contradicts the brand's positioning is still a finding.

---

## Priority Order (each layer gates the ones below)

### 1. Crawlability & Indexation (Code-Side)

**`robots.txt` / `robots.ts`:**
- File exists and is reachable at `/robots.txt`
- No accidental `Disallow: /` in production builds (a real risk when staging configs leak)
- `Sitemap:` directive present and points to the canonical sitemap URL
- Production-only blocks (e.g., `Disallow: /admin`, `/api`) are correct and don't bleed into public routes
- AI-crawler rules match the policy in `docs/BRAND.md`, **split by purpose** — retrieval/citation bots (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `Google-Extended`, `Applebot-Extended`) gate whether you can be *cited*; training bots (`GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot`) gate model *training*. Blocking the wrong group is a finding (see §7a). If brand wants AI visibility, retrieval bots must be allowed

**Sitemap generation:**
- `sitemap.xml` or `sitemap-*.xml` is generated for every public, indexable route
- No draft routes, admin routes, or auth-walled routes in the sitemap
- `lastmod` is wired from a real source (file mtime, CMS timestamp, build time), not a hardcoded date
- For Next.js App Router: `app/sitemap.ts` returns all locale variants if the site is multilingual
- For multilingual sites: each `<url>` includes `<xhtml:link>` alternates (see Hreflang below)
- Sitemap is under 50K URLs / 50MB; if not, split is implemented

**Canonical tags:**
- Every indexable page emits a canonical
- Self-referencing on unique pages; not pointing to homepage from deep pages
- Protocol + host match the production domain (no `localhost`, no `vercel.app` leaks)
- Paginated pages self-canonical (never canonical `page=2` → `page=1`)

**Indexability signals:**
- No `<meta name="robots" content="noindex">` on production pages by accident (search for it; it's a common copy/paste leak from staging)
- No `noindex` HTTP headers from middleware on routes that should rank

### 2. Framework Metadata Wiring

**Next.js App Router (`metadata` / `generateMetadata`):**
- Root `layout.tsx` defines `metadataBase` (required for OG image absolute URLs to resolve correctly)
- `title.template` set with `default` fallback; per-route `title` is just the page-specific part
- `description` defined per route, not duplicated across pages
- `openGraph` and `twitter` blocks present, with `images` resolved against `metadataBase`
- `alternates.canonical` and `alternates.languages` set for multilingual sites
- `generateMetadata` reads params/searchParams correctly and is `async` when it needs to fetch
- No client-side `next/head` (App Router uses `metadata`; mixing the two is a code smell)

**Pages Router / vanilla:**
- `<Head>` blocks present in every page
- `next-seo` config consumed consistently if used (no per-page drift)

**Astro / Remix / Nuxt / SvelteKit:**
- Equivalent checks for `<head>` blocks, `meta` exports, `useHead`, `<svelte:head>`
- Layout-level metadata defaults exist and per-route overrides work as expected

**Common metadata bugs found in code:**
- `metadataBase` missing → OG images resolve to `localhost` in production
- Same `description` exported from a shared constant across many routes
- `title` set to `undefined` when data fetch fails, leaking "undefined | Brand" to crawlers
- `openGraph.images` returns a relative path with no `metadataBase`
- `twitter.card` not set, defaulting to summary instead of `summary_large_image`

### 3. On-Page Semantics (in JSX/TSX/HTML)

**Headings:**
- Each route has exactly one `<h1>` — grep for `<h1` and check per-route
- Hierarchy not skipped (no `<h1>` → `<h3>`)
- Headings not used as styling primitives — if a `<h2>` exists only because the designer wanted big text, flag it (use a `<p>` with the right styles or a semantic component)
- H1 text aligns with the page's primary intent and the brand's pillar messaging

**Landmarks:**
- `<main>`, `<nav>`, `<article>`, `<aside>`, `<footer>` used semantically — not all `<div>`s
- Skip-to-content link present (composes with `accessibility-critique`)

**Links:**
- Anchor text is descriptive (no "click here", "read more", "learn more" as the only text — flag and suggest replacement)
- External links to brand-relevant sources use `rel="noopener"` (security) but don't `nofollow` editorial links by default
- Internal linking depth from homepage to important pages ≤ 3 clicks (trace through `<Link href=>` usage)

**Images:**
- Every `<img>` and `next/image` has an `alt` prop
- Decorative images use `alt=""` (not omitted)
- Alt text describes the image content, not just the file name
- LCP image uses `priority` (Next.js) or `fetchpriority="high"`
- Non-LCP images use `loading="lazy"`
- Modern formats served (`.webp`/`.avif`) where the bundler/CDN can produce them

### 4. Core Web Vitals (Code Patterns That Produce Them)

Audit the patterns, not live numbers:

**LCP risks in code:**
- Hero `<img>` without `priority` / `fetchpriority="high"`
- Web fonts loaded via `<link rel="stylesheet">` without `font-display: swap` or `next/font`
- Render-blocking third-party scripts in `<head>` without `async`/`defer`
- Large client component hydrating above-the-fold content that could be RSC

**INP risks in code:**
- Heavy synchronous work in click handlers (long-running array ops, JSON parses of large blobs)
- Missing `startTransition` around state updates that trigger expensive re-renders
- Animation handlers running on `scroll` without throttling

**CLS risks in code:**
- `<img>`/`next/image` without `width`/`height` (or `fill` + sized parent)
- Web fonts without metric-adjusted fallback (`size-adjust` or `next/font` adjustFontFallback)
- Late-loaded banners / cookie consent injecting at top after first paint
- Dynamic imports of layout-affecting components above-the-fold

These are findings even without running Lighthouse — the code makes the regression likely.

### 5. Structured Data (JSON-LD)

**Always-present schemas:**
- `Organization` (or `LocalBusiness` for local) in the root layout, with:
  - `name` matching the brand name in `docs/BRAND.md` exactly
  - `url` matching the production domain
  - `logo` resolving to an absolute URL
  - `sameAs` array with verified social/profile URLs from `docs/BRAND.md`
- `WebSite` with `potentialAction` SearchAction if the site has site-search

**Conditional schemas:**
- `Article` on blog/article routes — required fields: `headline`, `author`, `datePublished`, `image`
- `Product` on product/pricing pages — required: `name`, `description`, `offers.price`, `offers.priceCurrency`
- `FAQPage` on routes with Q&A blocks — `mainEntity` correctly structured
- `BreadcrumbList` on routes nested ≥ 2 levels deep
- `SoftwareApplication` on SaaS landing pages
- `HowTo` on tutorial / step-by-step routes
- `Event`, `Recipe`, `JobPosting`, etc., where applicable

**Validation:**
- All JSON-LD parses (no template-literal bugs that produce invalid JSON)
- No undefined values inserted via string interpolation (`name: "${product.name}"` where `product.name` could be `undefined`)
- Dates are ISO 8601
- URLs are absolute, not relative
- `@context` is `https://schema.org` (HTTPS, not HTTP)

### 6. International / Hreflang (When Applicable)

If the codebase has any i18n config, this section is mandatory. Otherwise skip.

**Hreflang placement options** — pick one, stay consistent:
- HTML `<link rel="alternate" hreflang="...">` in `<head>` (most common)
- Sitemap `<xhtml:link>` (preferred at 10+ locales)
- HTTP `Link` headers (for non-HTML resources)

Mixing methods is fine only if they agree exactly — conflicts cause Google to drop the pair.

**Required checks:**
- Self-referencing entry on every page (page lists itself in its own hreflang set)
- Reciprocal links: A points to B → B must point to A
- Valid codes: ISO 639-1 language + optional ISO 3166-1 Alpha-2 region (`en`, `en-GB`; never `en-UK`)
- `x-default` present, pointing to fallback page
- All target URLs return 200, are indexable, match their canonical
- No duplicate language-region codes pointing to different URLs
- Canonical URL appears in the hreflang set (or all hreflang is ignored)
- Cross-locale canonicals never used (e.g., `/fr/page` canonical to `/en/page` kills French indexing)

**Framework gotchas:**
- Next.js: `alternates.languages` does NOT auto-include self-referencing `<xhtml:link>` in the sitemap — must add the current locale explicitly.
- Astro i18n: default-locale-without-prefix mode hides the locale; ensure root canonical/hreflang strategy still works.

**Localized content quality (visible from code):**
- All locale pages have fully translated main content, not just nav/footer chrome
- Currency, phone format, date format swap correctly with locale
- No identical-text translations across locales for the same key (drag down site-wide quality signal)

### 7. AI-Search Visibility (AEO / GEO / AI Overviews)

This is the layer that decides whether an AI engine **recommends you in its answer** — not just whether Google ranks your page. AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) are the same discipline under two names: structure the page so a model can (a) reach it, (b) extract a clean answer, and (c) trust you enough to cite you over a competitor. The signals overlap with classic SEO, but the optimizations are different, and most repos do nothing for them. Audit all four sub-layers from the code.

Treat AEO findings' priority as scaling with the brand's stated AI-visibility goal in `docs/BRAND.md`: if the brand wants to win AI recommendations, gaps here are P1–P2, not P3 polish.

**7a. Crawler access — can the engine even reach the content?**
- Content is server-rendered (SSR/SSG/ISR), not client-only. **Most AI crawlers do not execute JavaScript** — a CSR-only route (`useEffect` fetch, client-rendered marketing page, SPA shell with an empty `<div id="root">`) is invisible to them even when Googlebot eventually renders it. CSR on a page the brand wants cited is a finding.
- `robots.txt` policy on AI agents matches `docs/BRAND.md`. **Distinguish training crawlers from retrieval/citation crawlers** — blocking the first does not stop the second, and blocking the second is what kills citations:
  - *Retrieval / live-citation* (allow these if the brand wants AI visibility): `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `Google-Extended` (Gemini/AI Overviews grounding), `Applebot-Extended`.
  - *Training* (block these without losing citations, if the brand wants to opt out of model training): `GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot`, `Google-Extended`.
  - A common self-own: `Disallow: /` for `GPTBot` while *intending* to be cited in ChatGPT search — the citation bot is `OAI-SearchBot`/`ChatGPT-User`, so the block misses its target and only forfeits training. Flag mismatches between the brand's intent and the actual directives.
- Key content is in the initial HTML payload, not lazy-loaded behind interaction (accordion that only fetches on click, "read more" that injects via JS). Crawlers see the first paint.

**7b. Answer extractability — can the engine lift a clean answer?**
- **Direct answer in the first ~100 words** of each key page/section. LLMs grab the first definitive sentence; a route that opens with "In this guide we'll explore…" forfeits the snippet. The lead sentence should answer the page's implied question outright.
- **Question-shaped headings.** `<h2>`/`<h3>` phrased as the actual user query ("How much does X cost?") with the answer in the very next block extracts far more cleanly than topic-noun headings. Grep heading text for question phrasing on Q&A/help/docs routes.
- **Definition lead pattern** — `<Term> is <definition>` opening sentences. Models match queries to named entities and definitions more than to loose phrasings.
- **Self-contained chunks.** AI retrieval indexes *passages*, not whole pages. Each section should answer on its own without depending on earlier context ("as mentioned above", unresolved pronouns referring three paragraphs back are extractability bugs here).
- **Semantic, labeled lists and tables** — real `<ol>`/`<ul>`/`<table>` with explicit lead-ins ("Three reasons:") over `<div>`-soup or prose runs. Structured markup extracts verbatim; styled divs do not.
- **`FAQPage` schema** on Q&A routes and **`HowTo`** on procedural content — gives the engine pre-delineated Q&A / step pairs. (Note: Google deprecated FAQ *rich results* for most sites, but the schema still feeds AI answer extraction — keep it for AEO even though it no longer paints SERP stars.)

**7c. Trust & citation signals — will the engine pick you over a competitor?**

Princeton's GEO study found these moved AI visibility +30–40% vs. unoptimized content (see reference doc):
- **Statistics with concrete numbers** in the copy — models read numeric density as factual grounding.
- **Attributed quotations** ("According to {named expert}, …") — quotation marks + attribution read as a credibility proxy.
- **Inline citations to authoritative sources** — outbound links to primary/reputable sources build a chain of trust the model rewards.
- **First-party experience** — "we tested X and found Y" claims. Engines over-cite these because a model can't synthesize them from training data; generic explainers lose to first-hand reports.
- **Freshness** — `dateModified` wired to a real source (not hardcoded), recent updates surfaced. Stale-looking pages get passed over.
- **Author authority** — bylines with a `Person` schema (`name`, `jobTitle`, `sameAs`) on anything editorial.

**7d. Entity grounding — does the engine know who you are?**
- `Organization` / `Brand` JSON-LD with `description`, `sameAs` (every owned social + Crunchbase/Wikipedia/Wikidata profile), `logo`, and where applicable `founders`, `foundingDate` — this is how engines resolve your brand to a known entity and recommend it by name.
- `Product` / `SoftwareApplication` schema with `offers`, `aggregateRating`, `featureList`, `applicationCategory` — this is the structured data an engine quotes when a user asks "what's a good tool for X?" Missing it on the product/pricing route is a real AEO gap, not polish.
- **Consistent brand-name + terminology** across `title`, `<h1>`, schema `name`/`description`, and internal anchor text. Engines disambiguate entities by repetition; drift ("DevByAlex" vs "Dev By Alex" vs "the platform") weakens entity resolution. Cross-check spelling against `docs/BRAND.md`.
- `llms.txt` at the repo's `public/` root (emerging convention) — a curated Markdown summary of what the site offers, with links to the canonical pages for each topic; optional `llms-full.txt` with expanded content. Note it as a recommended addition, not a hard requirement (adoption is still emerging and no major engine treats it as mandatory).

> **Boundary:** these are still *code-side* checks — schema presence, render mode, robots directives, heading/markup structure, first-paragraph patterns. Do **not** drift into "write more blog posts," "build backlinks," or keyword strategy. Off-page authority and content production are out of scope; route them to `/marketer-copywriting` and the brand/content workflow.

---

## Brand Alignment Pass

For every page-level text the audit touches (title, description, H1, OG title/description, schema `name`/`description`), cross-check against `docs/BRAND.md`:

- **Positioning** — Does the page lead with the positioning one-liner or a derivative? Or does it pitch a feature in a vacuum?
- **ICP language** — Does the copy match the language the ICP uses about their problem (per `docs/BRAND.md` Section 2)? Generic SaaS speak when the ICP is, say, developers, is a finding.
- **Voice** — Do the page's title and description align with the 3 voice adjectives? Violate the 3 anti-adjectives?
- **Pillar messages** — Does the page reinforce one of the brand's pillar messages, or wander?
- **Brand name spelling** — Is the brand name spelled and capitalized exactly as in `docs/BRAND.md`? (Case, spacing, and trademark symbols matter for `Organization` schema and AI entity resolution.)

A page can be technically perfect and still fail brand alignment. Both are findings; both go in the queue.

---

## Output Format

Emit findings as a flat, IDed queue ready for `fix-errors`. No long executive summary — the queue is the deliverable.

```
## SEO Audit — {{repo name}}

**Brand reference:** docs/BRAND.md ({{last modified date}})
**Framework detected:** {{Next.js App Router / Astro / Remix / ...}}
**Locales:** {{en, en-GB, fr, ...}}  (or "single-locale")
**Routes scanned:** {{count}}

---

### Findings

- **SEO-001** — [Priority: P0|P1|P2|P3] [Layer: Crawl|Metadata|Semantics|CWV|Schema|i18n|AEO|Brand]
  - **Where:** `path/to/file.ext:line` (or pattern across multiple files, list them)
  - **What:** {{specific issue in one sentence — no hedging}}
  - **Evidence:** {{the code snippet or grep result that proves it}}
  - **Fix:** {{the exact change, ideally as a diff or named transformation}}
  - **Brand link** (if applicable): {{which section of `docs/BRAND.md` it violates / supports}}

- **SEO-002** — ...

---

### Out of scope (raised but not audited)
- {{e.g., "User asked for competitor keyword analysis — out of scope, suggest external tool"}}
```

**Priority guide:**
- **P0** — blocks indexation or causes Google to drop pages (e.g., `Disallow: /` in prod robots, cross-locale canonical killing locale, `metadataBase` missing breaking OG)
- **P1** — measurable ranking impact (missing canonicals, broken schema, no H1, hreflang ignored)
- **P2** — visible-in-SERP quality (duplicate descriptions, weak titles, missing alt, no breadcrumb schema)
- **P3** — polish / AI-search uplift (missing `sameAs`, no `llms.txt`, anchor text could be sharper)
- **AEO note** — when `docs/BRAND.md` states AI-search visibility is a goal, AEO/GEO gaps escalate: an AI-recommended product route that is JS-only (uncitable), a retrieval crawler blocked by mistake, or a missing `Product`/`Organization` entity are P1–P2, not P3. Weight by the brand's stated intent (see §7).

---

## Operating Rules

- **Read the code; don't guess.** Every finding cites a file path and line number, or a grep pattern that reproduces it.
- **No "consider adding" findings.** Either it's missing and worth fixing (emit a finding with the fix) or it's fine (skip).
- **Don't lecture about SEO theory.** The user knows what canonical tags are. Tell them what's broken in *their* code and how to fix it.
- **Don't propose marketing strategy.** This is a coding audit. Strategy belongs in `/marketer-brand-generation` or `/marketer-copywriting`.
- **Compose with sibling skills:**
  - Findings about H1/heading hierarchy, alt text, and landmarks overlap with `/accessibility-critique` — note overlap rather than duplicate.
  - Findings about hardcoded user-facing copy quality compose with `/prose-check`.
  - Pre-launch SEO sweep composes with `/launch-readiness`.
- **Hand the queue to `fix-errors`** when the user is ready to remediate — the `SEO-xxx` IDs are the contract.

---

## References

- [AI Writing Detection](references/ai-writing-detection.md) — AI tells to flag in on-page copy (overlaps with `/prose-check`)
- [International SEO](references/international-seo.md) — Evidence and sources for hreflang, canonical + i18n, sitemaps, URL structure, and content quality across locales
- [AI-Search Optimization (AEO / GEO)](references/ai-search-optimization.md) — Evidence and sources for the §7 AEO checks: crawler taxonomy (training vs retrieval), JS-rendering limits, the Princeton GEO study, answer-extraction structure, entity grounding schema, and `llms.txt` status

---

## Related Skills

- **marketer-brand-generation** — Required prerequisite. Produces `docs/BRAND.md`.
- **marketer-copywriting** — For rewriting weak titles, meta descriptions, H1s flagged in the audit
- **prose-check** — For stripping AI tells from on-page text the audit surfaces
- **accessibility-critique** — Overlaps on heading structure, alt text, landmarks, `lang` attribute
- **launch-readiness** — Pre-launch sweep that includes an SEO pass
- **fix-errors** — Consumes the `SEO-xxx` queue this skill emits
