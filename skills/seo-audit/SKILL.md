---
name: seo-audit
description: >-
  Audit a repo's public, indexable marketing and content pages from code for technical SEO and AI-search/AEO/GEO readiness. Inspect framework metadata, canonicals and hreflang, robots and sitemaps, semantic HTML, structured data, images, internal links, i18n, and code-visible Core Web Vitals risks; exclude authenticated screens not meant to rank. Requires `docs/BRAND.md` and stops with a `marketer-brand-generation` handoff when it is missing so titles, descriptions, schema, and locale targeting are judged against approved positioning. Use for SEO audits, technical SEO, metadata or head-tag reviews, schema validation, sitemap or hreflang checks, pre-merge and pre-launch SEO checks, ranking-code diagnostics, and AI-search visibility audits. Not for keyword research, competitor analysis, or off-page link building.
metadata:
  version: 3.2.0
---

# SEO Audit (code-side)

## Goal

An `SEO-xxx` queue that `fix-errors` can work, listing every defect in the
code that keeps a public page from being crawled, understood, ranked or cited
by an AI engine, or that contradicts the brand. The repo is the source of
truth: every tag, canonical, sitemap entry, JSON-LD block and locale route
comes from somewhere in it.

## Done when

- **`docs/BRAND.md` was read** for the positioning one-liner, ICP language,
  voice and anti-adjectives, pillar messages, locales, AI-visibility intent
  and exact brand-name spelling. Without it the audit stops with: "Cannot
  audit SEO without a brand foundation. Titles, descriptions, `Organization`
  schema, locale targeting and AI-search positioning all derive from it. Run
  `/marketer-brand-generation` first, then return here."
- **Routes are partitioned and reported:** (a) public marketing and content,
  (b) public app-generated pages meant to be shared and indexed (public
  profiles, posts, listings, share links), (c) authenticated app. (a) and (b)
  are audited; (c) is out of scope, and its heading and alt hygiene goes to
  `accessibility-critique`. An ambiguous route is asked about, not assumed.
  An indexable (c) route, a (c) route in the sitemap, or a `noindex`'d (a)
  route is a finding.
- **The SEO surface is mapped:** framework and router, metadata sources,
  sitemap and robots sources, i18n routing and hreflang generator, JSON-LD
  components and inline blocks.
- **Each layer was checked, in this order** (a crawl or index blocker
  outranks everything below it):
  1. *Crawl and index:* `robots` reachable, no stray `Disallow: /` or
     `noindex` (meta or middleware header) leaking from staging, a `Sitemap:`
     line; a sitemap covering every public route and nothing gated or draft,
     with real `lastmod`, locale variants and `<xhtml:link>` alternates when
     multilingual, split past 50K URLs or 50MB; a canonical on every
     indexable page, self-referencing unless the page duplicates another, on
     the production host (no `localhost` or `vercel.app`), paginated pages
     self-canonical.
  2. *Metadata wiring:* for the Next App Router, `metadataBase` in the root
     layout, `title.template` with a default, a per-route `description`
     (not one shared constant), `openGraph` and `twitter`
     (`summary_large_image`) with images resolving absolutely,
     `alternates.canonical` and `alternates.languages`, no `next/head`, no
     "undefined | Brand" title when a fetch fails; the equivalent `<Head>`
     (Pages Router), `<head>`, `meta`, `useHead` or `<svelte:head>` wiring
     elsewhere.
  3. *On-page semantics:* one `<h1>` per route matching its intent and a
     pillar, no skipped heading levels or headings used only for size, real
     landmarks, descriptive anchor text, important pages within 3 clicks of
     home, `rel="noopener"` without default `nofollow` on editorial links;
     `alt` on every image (`alt=""` when decorative), the LCP image with
     `priority` or `fetchpriority="high"`, others lazy, modern formats where
     the pipeline can make them; `lang` on `<html>`, viewport and charset.
  4. *Core Web Vitals patterns:* LCP (unprioritized hero, fonts without
     `next/font` or `font-display: swap`, blocking head scripts, above-fold
     client components that could be server components), INP (heavy sync
     handlers, missing `startTransition`, unthrottled scroll handlers), CLS
     (images without dimensions, fonts without metric-adjusted fallbacks,
     late banners above content, dynamic imports above the fold).
  5. *Structured data:* `Organization` (or `LocalBusiness`) in the root
     layout with `name` spelled exactly as in BRAND, production `url`,
     absolute `logo`, `sameAs` from BRAND; `WebSite` with `SearchAction` when
     there is site search; `Article` (`headline`, `author`, `datePublished`,
     `image`), `Product` (`offers.price`, `offers.priceCurrency`),
     `SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList` (two or more
     levels deep) or another type the route fits. Every block parses, has no
     interpolated `undefined`, uses ISO 8601 dates, absolute URLs and an
     `https://schema.org` context.
  6. *International (when any i18n config exists):* one hreflang method, or
     several that agree exactly; self-reference, reciprocity, valid codes
     (`en-GB`, never `en-UK`), `x-default`, targets that are 200, indexable
     and canonical, no cross-locale canonicals; Next's sitemap alternates
     include the current locale; fully translated main content, localized
     currency, dates and phone formats. Evidence is in
     [international-seo.md](references/international-seo.md).
  7. *AI search (AEO/GEO):* pages the brand wants cited are server-rendered
     with key content in the initial HTML; robots rules match BRAND's intent
     for retrieval crawlers versus training-only tokens (below); the lead
     ~100 words answer the page's question, question-shaped headings on Q&A
     and help routes, self-contained sections, real lists and tables;
     statistics, attributed quotes, outbound citations, first-hand claims,
     `dateModified` from a real source, `Person` bylines; `Organization`,
     `Product` or `SoftwareApplication` entities with `sameAs`, consistent
     brand naming everywhere, and `llms.txt` as a recommendation only.
     Evidence is in
     [ai-search-optimization.md](references/ai-search-optimization.md).
- **Brand alignment was checked** on every title, description, H1, OG text
  and schema `name` and `description`: positioning, ICP language, voice,
  pillar and exact brand spelling. Misalignment is a finding, not taste.
- **The report is the queue:** a header (BRAND date, framework, locales,
  routes scanned), then each finding as
  `SEO-NNN [P0|P1|P2|P3] [Crawl|Metadata|Semantics|CWV|Schema|i18n|AEO|Brand]`
  with Where (`path:line` or the files a pattern spans), What (one unhedged
  sentence), Evidence (the snippet or grep), Fix (the exact change) and Brand
  link where relevant, then any out-of-scope asks that were raised.

## Decisions (and why)

- **Code, not a crawler.** JSON-LD is found by grepping (`application/ld+json`,
  `schema.org`, `<JsonLd`-style components), never by `web_fetch` or `curl`,
  which strip `<script>`. Schema injected client-side by a CMS plugin is noted
  as invisible here, with Google's Rich Results Test as the complement. Why:
  the fix lands in code, so the finding must point at code.
- **Robots rules separate crawlers by purpose.** Retrieval and citation
  crawlers (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`,
  `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `Applebot`) decide
  whether the site can be cited. Training crawlers and tokens (`GPTBot`,
  `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot`, `Applebot-Extended`) only
  govern training, and `Google-Extended` governs Gemini training and grounding
  but not Search or AI Overviews, which follow `Googlebot`. Blocking `GPTBot`
  to "stay out of ChatGPT" while wanting citations is the classic self-own.
  Why: blocking the wrong group silently forfeits citations or fails to opt
  out.
- **Priority:** P0 blocks indexing or drops pages (prod `Disallow: /`, a
  cross-locale canonical, missing `metadataBase` breaking OG); P1 measurably
  hurts ranking (missing canonicals, broken schema, no H1, ignored hreflang);
  P2 is visible SERP quality (duplicate descriptions, weak titles, missing
  alt or breadcrumbs); P3 is polish. When BRAND makes AI visibility a goal,
  AEO gaps on routes it wants cited (JS-only, a blocked retrieval crawler, a
  missing `Product` or `Organization` entity) are P1 or P2. Why: priority
  follows what the brand is trying to win.
- **Overlaps are noted, not duplicated:** headings, alt and landmarks with
  `accessibility-critique`, copy quality with `prose-check` (AI tells:
  [ai-writing-detection.md](references/ai-writing-detection.md)), rewrites
  with `marketer-copywriting`, the pre-launch sweep with `launch-readiness`.
  Why: one owner per finding.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- No audit without `docs/BRAND.md`, and no substitute for it.
- Every finding cites a path and line or a reproducing grep. No "consider
  adding" findings: a gap is a finding with a fix, or it isn't reported.
- Out of scope, named as such when asked and never investigated: keyword
  research, SERPs, competitors, backlinks and domain authority, Search Console
  data, live performance numbers, word-count or subjective content quality,
  marketing strategy, and authenticated screens.
- The audit reports; fixes go through `fix-errors`, with the `SEO-xxx` ids as
  the contract.
