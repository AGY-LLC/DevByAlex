# AI-Search Optimization (AEO / GEO): Evidence & Sources

Detailed evidence backing **Section 7 (AI-Search Visibility)** of the SEO Audit skill. AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) are two names for the same discipline: getting an AI engine to surface and cite *your* content when it answers a user — distinct from classic SEO, which gets a blue link ranked. Organized by sub-layer with source URLs and key points.

> Scope reminder: the SEO Audit skill audits these signals **from the code** (render mode, robots directives, schema presence, heading/markup structure, first-paragraph patterns). Off-page authority, backlink building, and content production are out of scope — they belong to `/marketer-copywriting` and the brand/content workflow.

---

## AEO vs GEO vs SEO — same goal, different surface

- **SEO** ranks a page in a list of links. **AEO/GEO** gets the page *extracted and cited* inside a synthesized answer (AI Overviews, ChatGPT search, Perplexity, Gemini, Claude). AEO emphasizes making content easy to *extract* (clear question→answer structure); GEO emphasizes making the model *choose you* when synthesizing (trust/citation signals). In practice they are audited together.
- SEO remains the foundation: a page that can't be crawled or rendered can't be cited. AEO/GEO is additive, not a replacement.

- [AEO vs SEO vs GEO: Complete Guide (2026)](https://www.stackmatix.com/blog/aeo-seo-geo)
- [AEO vs. GEO: Why they're the same thing (Profound)](https://www.tryprofound.com/blog/aeo-vs-geo)
- [FAQ on GEO and AEO — where AI search and SEO overlap (eMarketer, 2026)](https://www.emarketer.com/content/faq-on-geo-aeo--where-ai-search-seo-overlap-2026)
- [WTF are GEO and AEO (Digiday)](https://digiday.com/media/wtf-are-geo-and-aeo-and-how-they-differ-from-seo/)

---

## 7a. Crawler access

### JavaScript rendering

Most AI crawlers fetch raw HTML and **do not execute JavaScript**. Content that only appears after client-side hydration (a CSR SPA, `useEffect`-fetched copy, "read more" injected on click) is effectively invisible to them, even on pages Googlebot will eventually render. Server-render (SSR/SSG/ISR) anything you want cited.

- [Vercel: How AI crawlers and bots see your site](https://vercel.com/blog/how-ai-bots-crawl-and-render-the-web)
- [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

### Crawler taxonomy — training vs retrieval/citation

The single most consequential code-side AEO mistake is blocking the wrong bot. Blocking a *training* crawler does not stop your content from being *cited* in live AI search, and blocking a *retrieval* crawler kills citations while leaving training untouched.

| Engine | Training crawler (block to opt out of training) | Retrieval / live-citation bot (allow to be cited) |
|---|---|---|
| OpenAI / ChatGPT | `GPTBot` | `OAI-SearchBot`, `ChatGPT-User` |
| Anthropic / Claude | `ClaudeBot`, `anthropic-ai` | `Claude-SearchBot`, `Claude-User` |
| Google / Gemini & AI Overviews | `Google-Extended` | `Google-Extended` governs Gemini/AI-Overviews grounding; standard `Googlebot` still crawls |
| Perplexity | — | `PerplexityBot`, `Perplexity-User` |
| Apple | `Applebot-Extended` (training opt-out) | `Applebot` |
| Common Crawl (feeds many models) | `CCBot` | — |
| Others scraping at scale | `Bytespider` (TikTok), `Amazonbot` | — |

Classic self-own: `Disallow: /` for `GPTBot` while expecting to appear in ChatGPT's search answers — the citation fetch is `OAI-SearchBot` / `ChatGPT-User`, so the block only forfeits training and does nothing for (or against) citations. Audit that `robots.txt` directives match the brand's actual intent in `docs/BRAND.md`.

- [OpenAI: bots and crawlers (GPTBot, OAI-SearchBot, ChatGPT-User)](https://platform.openai.com/docs/bots)
- [Anthropic: does Claude access the web / crawler names](https://support.anthropic.com/en/articles/8896518-does-claude-have-access-to-the-internet)
- [Google: Google-Extended and AI crawlers](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Perplexity: PerplexityBot / Perplexity-User](https://docs.perplexity.ai/guides/bots)

---

## 7b. Answer extractability

LLM answer engines retrieve and quote **passages**, not whole pages. Structure each chunk to stand alone and answer outright.

- **Direct answer first.** The first definitive sentence is what gets lifted; throat-clearing intros ("In this guide we'll explore…") forfeit the snippet. Lead with the answer, then expand.
- **Question-shaped headings** (`<h2>How much does X cost?</h2>`) with the answer in the next block map directly onto user queries.
- **Definition-lead sentences** (`X is Y`) — models match queries to named entities and definitions over loose phrasings.
- **Self-contained chunks** — avoid "as mentioned above" and unresolved pronouns; a retrieved passage carries no prior context.
- **Semantic, labeled lists/tables** (`<ol>`/`<ul>`/`<table>` with explicit lead-ins) extract verbatim where `<div>`-soup does not.
- **`FAQPage` and `HowTo` schema** give engines pre-delineated Q&A / step pairs. Google deprecated FAQ *rich results* for most sites (Aug 2023), but the structured data still aids AI answer extraction — keep it for AEO even though it no longer paints SERP stars.

- [Google: FAQ and HowTo rich result changes (Aug 2023)](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
- [Schema.org: FAQPage](https://schema.org/FAQPage)

---

## 7c. Trust & citation signals — the Princeton GEO study

The foundational GEO study ("GEO: Generative Engine Optimization", Aggarwal et al., KDD 2024) ran controlled tests across a generative-engine benchmark and found content-side tactics that raised source visibility in AI answers by roughly **30–40%** over unoptimized baselines. The top movers:

- **Cite sources** (inline links to authoritative references).
- **Add statistics** — concrete numbers read as factual density.
- **Add quotations** — attributed quotes ("According to {expert}, …"); the model treats quotation + attribution as a credibility proxy.

Method effectiveness varied by query domain, but citations/quotations/statistics were the consistent winners; keyword stuffing did **not** help and could hurt.

Complementary, observed-in-practice signals:

- **First-party experience** ("we tested X and found Y") — engines over-cite these because a model cannot synthesize first-hand results from training data; generic explainers lose to them.
- **Freshness** — `dateModified` wired to a real source; recently-updated pages get preferred over stale-looking ones.
- **Author authority** — bylines backed by `Person` schema (`name`, `jobTitle`, `sameAs`).

- [GEO: Generative Engine Optimization (arXiv 2311.09735)](https://arxiv.org/abs/2311.09735)
- [Princeton GEO project page](https://generative-engines.com/GEO/)

---

## 7d. Entity grounding

AI engines recommend brands they can resolve to a **known entity**. Structured data + consistent naming is how you become one.

- **`Organization` / `Brand` JSON-LD** with `description`, `sameAs` (owned socials + Crunchbase/Wikipedia/Wikidata), `logo`, and where applicable `founders`, `foundingDate`. `sameAs` to authoritative knowledge-graph entries is the strongest disambiguation signal.
- **`Product` / `SoftwareApplication`** with `offers`, `aggregateRating`, `featureList`, `applicationCategory` — the structured facts an engine quotes for "what's a good tool for X?".
- **`Article`** on editorial content with `author` (`Person` sub-object), `datePublished`, `dateModified`.
- **Consistent brand name and terminology** across `title`, `<h1>`, schema `name`/`description`, and anchor text — engines disambiguate by repetition; naming drift weakens entity resolution. Cross-check spelling against `docs/BRAND.md`.

- [Google: Structured data general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Schema.org: Organization](https://schema.org/Organization) · [SoftwareApplication](https://schema.org/SoftwareApplication)
- [Google: about the Knowledge Graph / entity understanding](https://developers.google.com/knowledge-graph)

### `llms.txt`

`llms.txt` is an emerging convention: a curated Markdown file at the site root linking to the canonical pages for each topic, intended to give models a clean map of the site (optionally with an expanded `llms-full.txt`). Adoption is growing but **no major engine treats it as required or confirmed for ranking** — recommend it as a low-cost addition, not a hard finding.

- [llmstxt.org — the proposal](https://llmstxt.org/)

---

*Backs Section 7 of the SEO Audit skill. If an AI engine changes its crawler names or a study supersedes the Princeton numbers, update this doc — it is the source of truth for the skill's AEO checks.*
