---
id: stack-seo
title: SEO
summary: >-
  How I think about SEO: the writing methodology lives next to the technical implementation (metadata API, structured data, sitemaps, AI-search) because the two are inseparable in practice.
tags: [stack, seo, content, nextjs, structured-data, ai-search]
updated: 2026-05-28
---

# SEO

This doc covers SEO end-to-end: the writing methodology and the engineering implementation. They live together because in a Next.js codebase you can't actually separate them: the page that ranks is the same page you wrote the copy for, the metadata for, and the structured data for. Splitting "SEO writing" off into a marketing practice and "SEO implementation" off into framework docs means every SEO task has to context-switch between two places. Don't.

For pure SEO diagnostics (lost rankings, technical audit, schema validation), pair this doc with the `/marketer-seo-audit` skill.

---

## When this matters

- **Building a new content page** (blog post, comparison page, glossary entry, programmatic page set). Use the writing methodology + the metadata + structured-data sections.
- **Building a new marketing page** (landing, pricing, feature, about). Use the writing methodology + the metadata sections; structured data is usually optional but worth it.
- **Building a new app route** that's user-facing. At minimum: title, description, OG image, canonical URL. Skip structured data unless it qualifies for a rich result.
- **Diagnosing a ranking drop or technical issue.** Start with `/marketer-seo-audit`, then come back to this doc for the patterns.

---

## Writing methodology

For SEO content: content that targets a real query and is meant to rank or get cited by LLMs.

### 1. Match intent before writing

Wrong-intent pages don't rank no matter how well written. Diagnose first:

- **Informational**: "how does X work" / "what is X". Long-form, depth-first, definitions + examples.
- **Commercial investigation**: "best X for Y" / "X vs Y" / "X alternative". Comparison table, opinionated ranking, decision criteria.
- **Transactional**: "buy X" / "X pricing". Conversion-focused, social proof, CTA-heavy.
- **Navigational**: "X login" / "X docs". Single anchor link, minimal copy.

If the top-3 organic results for your query are all the wrong shape for what you want to write, rethink the query.

### 2. Outline before drafting

The outline IS the page. If the outline is wrong, polished prose can't fix it.

- **H1**: match the query closely, in human voice. Not the literal keyword.
- **Opening paragraph**: 50–100 words, leads with the answer, includes the query naturally. Wins featured snippets, AI citations, and impatient readers.
- **Subheaders**: the user's actual sub-questions, not topic labels. "How long does X take?" beats "Duration".
- **First-party POV section**: the experience/data/opinion no AI competitor can generate. This is the E-E-A-T moat.
- **Closing**: informational pages link to related content; commercial pages have a clear product CTA.

### 3. Length is a symptom

Long content correlates with rank, but length isn't the cause: depth is. Match the longest top-3 result + maybe 20% if you have more to say, otherwise stop. Don't pad.

### 4. Structure for skim AND for AI extraction

- Short paragraphs (2–4 sentences max).
- Named lists with explicit labels.
- Comparison tables for any "X vs Y" question.
- Callout-able single-sentence facts that an LLM can quote in isolation.

---

## Next.js App Router: metadata implementation

App Router has a first-class metadata API. Use it; don't reach for `next-seo` unless you have a reason.

### Per-route static metadata

```ts
// app/(marketing)/pricing/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing: <Product>",
  description: "Plain-language description, 140–155 chars, includes the query naturally, no marketing-speak.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing: <Product>",
    description: "...",
    url: "/pricing",
    images: [{ url: "/og/pricing.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};
```

### Per-route dynamic metadata

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: `${post.title}: <Product>`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: post.ogImage, width: 1200, height: 630 }],
    },
  };
}
```

### Root metadata defaults

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: { default: "<Product>", template: "%s: <Product>" },
  description: "Default description for pages that don't override.",
  robots: { index: true, follow: true },
};
```

`metadataBase` is non-optional: without it, OG image URLs resolve relative to the page and break when crawlers fetch them out of context.

---

## Structured data (JSON-LD)

Schema.org markup. Inject as a `<script type="application/ld+json">` in the page. Test every emitted blob with [Google's Rich Results Test](https://search.google.com/test/rich-results) before shipping.

```tsx
// app/blog/[slug]/page.tsx
export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author },
    image: post.ogImage,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article>...</article>
    </>
  );
}
```

Schemas worth emitting where they apply:

- **Article / BlogPosting**: blog posts.
- **FAQPage**: pages with explicit Q&A sections. Gets you AI-extraction-friendly markup.
- **HowTo**: step-by-step procedural content (Google has narrowed eligibility; verify against current docs).
- **Product / Offer**: pricing pages, product pages with prices.
- **SoftwareApplication**: app pages, App Store / Play Store equivalents on the web.
- **BreadcrumbList**: any deep page so the SERP shows the breadcrumb path.
- **Organization**: once in the root layout, with `sameAs` linking to your social profiles.

Don't emit schemas that don't match what's actually on the page. Google penalizes lying structured data.

---

## sitemap.xml and robots.txt

App Router supports both as code-generated files. Don't hand-write them; they drift.

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    { url: "https://example.com", lastModified: new Date(), priority: 1.0 },
    { url: "https://example.com/pricing", lastModified: new Date(), priority: 0.9 },
    ...posts.map((p) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.7,
    })),
  ];
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] }],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

---

## OG images

The OG image is the entire above-the-fold experience on every platform that previews a link. Don't ship a default.

Two paths:

- **Static per-page OG images**: design once in Penpot, export to `public/og/<slug>.png`. Cheap, controlled, gets stale fast.
- **Dynamic OG images** with Next's `ImageResponse`: generate from a TSX template per route. Stays in sync as titles change.

```ts
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 64, background: "#fff" }}>
        <div style={{ fontSize: 64, fontWeight: 700 }}>{post.title}</div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#666" }}>{post.author}</div>
      </div>
    ),
    size,
  );
}
```

Test in [opengraph.xyz](https://www.opengraph.xyz/): every Slack/LinkedIn/iMessage preview is a different render.

---

## AI-search optimization (AEO / GEO)

Showing up in AI Overviews, ChatGPT citations, Perplexity sources, and Claude's web answers is its own discipline. AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) are two names for the same goal: get an AI engine to **extract and cite you** in its answer, not just rank a blue link. The signals overlap with classic SEO but the optimizations are different. Think in four layers: `/seo-audit` §7 audits all of them from the code (deep evidence + sources in its `references/ai-search-optimization.md`).

**1. Crawler access: can the engine even reach the content?**

- **Server-render anything you want cited.** Most AI crawlers fetch raw HTML and don't run JavaScript. A CSR-only page (SPA shell, `useEffect` fetch) is invisible to them even when Googlebot eventually renders it. Use SSR/SSG/ISR.
- **Split AI crawlers by purpose in `robots.txt`:** don't block the wrong one. *Retrieval/citation* bots gate whether you can be cited (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `Google-Extended`, `Applebot-Extended`); *training* bots gate model training (`GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot`). A common mistake is blocking `GPTBot` while expecting ChatGPT-search citations. The citation fetch is `OAI-SearchBot`/`ChatGPT-User`, so the block only forfeits training.

**2. Answer extractability: can the engine lift a clean answer?**

- **Direct answers in the first ~100 words.** LLMs grab the first definitive sentence. Bury it under "In this post we'll cover…" and you lose the citation.
- **Question-shaped headings** (`<h2>How much does X cost?</h2>`) with the answer in the next block map onto user queries.
- **Named entities + definitions.** Open paragraphs with `<Term>` is `<definition>`. LLMs match queries to terms more than to phrasings.
- **Self-contained chunks.** AI retrieval indexes passages, not whole pages: avoid "as mentioned above" and pronouns that need three paragraphs of context.
- **Lists with explicit labels.** "Three reasons:" followed by `1.`, `2.`, `3.` (real `<ol>`/`<table>`) extracts cleanly. Loose prose does not.
- **FAQ / HowTo schema** where natural, gives the LLM cleanly delineated Q&A and step pairs. (Google deprecated FAQ rich *results*, but the schema still feeds AI extraction, keep it for AEO.)

**3. Trust & citation signals: will the engine pick you over a competitor?**

Princeton's GEO study found these moved AI visibility +30–40% vs. unoptimized content:

- **Statistics with concrete numbers**: read as factual density.
- **Attributed quotations** ("According to {named expert}…"): quotes + attribution read as a credibility proxy.
- **Inline citations to authoritative sources**: outbound links that build a chain of trust.
- **First-party experience.** AI Overviews and Perplexity over-cite sources that say "I tried X and found Y" because a model can't synthesize that from training data. Generic explainers lose to first-party reports.
- **Freshness**: `dateModified` wired to a real source, not hardcoded.

**4. Entity grounding: does the engine know who you are?**

- **`Organization`/`Brand` schema** with `description`, `sameAs` (owned socials + Crunchbase/Wikipedia/Wikidata), `logo`: how engines resolve you to a known entity.
- **`Product`/`SoftwareApplication` schema** with `offers`, `aggregateRating`, `featureList`: the structured facts an engine quotes for "what's a good tool for X?".
- **Consistent brand name + terminology** across title, H1, schema, and anchor text: engines disambiguate by repetition.
- **`llms.txt`** at the site root (emerging convention; nice-to-have, not required).

What doesn't help (and may hurt):

- Keyword stuffing: every modern ranking system penalizes it; LLMs ignore it.
- Hidden text / cloaking: both classic SEO and AI systems flag this.
- Content farms: LLMs are getting better at detecting and downranking low-effort generated content.

---

## Anti-patterns

- **Title cases that don't match the H1.** The two should agree, optionally with a brand suffix on the title.
- **Meta description = first paragraph.** They serve different audiences (SERP snippet vs. opening reader). Write them separately.
- **Same OG image on every page.** Looks lazy in feed previews; lower CTR than a per-page OG image.
- **`<h1>` inside a component used multiple times per page.** Exactly one H1 per page. Lint for it.
- **Robots blocking JS / CSS.** Google needs them to render the page. Don't block.
- **Non-canonical URLs for the same content.** Always set `alternates.canonical`. Especially important for paginated or filtered pages.
- **Inline `<style jsx>` for marketing pages.** Hurts Core Web Vitals (LCP) for content that benefits from server-rendered CSS.
- **Blocking the indexable site behind cookie consent.** EU pages need a compliant default that still serves the content to crawlers.

---

## Tools I actually use

- **Google Search Console**: the only tool that knows what Google thinks of you. Set up early; check weekly.
- **Ahrefs** or **Semrush**: competitor + keyword research. Either, not both.
- **Google's Rich Results Test**: validate every JSON-LD blob before shipping.
- **opengraph.xyz**: preview OG images across platforms.
- **PageSpeed Insights** + **WebPageTest**: Core Web Vitals.
- **`/marketer-seo-audit`** (when available): automated SEO diagnostic.

---

*This doc covers the SEO patterns I actually use across Nisatsu, JapanByAlex, and DayDump. If you're working in one of those repos and find a pattern that should be added or corrected here, update this doc: it's the source of truth.*
