# Real-world examples (visual grounding)

This is the one file in `references/` that names real products. Every
other reference file is deliberately conceptual; this one exists to give
the AI (and the user) **live visual anchors** for each direction after
the style router has picked one.

Screenshots are **remote-linked** from Lapa Ninja's public gallery.
Nothing is copied into this skill. Copyright and trademarks belong to
the respective site owners.

**How to use this file:**

- After the style router nominates a primary + secondary direction,
  scan the matching section here and study the linked examples.
- Show the user the relevant examples during the brief Q&A ("references
  you love or hate") to ground their answers in something concrete.
- Study structure, hierarchy, pacing, and tone. **Never lift assets**:
  no copying screenshots, copy, fonts, palettes, or identities into the
  product (hard rule 2 in `SKILL.md` applies in full).

---

## playful-consumer

### Tinycards by Duolingo: playful learning app
Source: https://www.lapa.ninja/post/tinycards-duolingo/

![Tinycards by Duolingo screenshot](https://cdn.lapa.ninja/assets/images/1x/tinycards.webp)

Consumer app landing: colorful hero, phone UI, simple CTA, playful
brand language. Strong anchor for language-learning and habit apps.

### Flow Your Money: soft friendly fintech
Source: https://www.lapa.ninja/post/flowyourmoney/

![Flow Your Money screenshot](https://cdn.lapa.ninja/assets/images/1x/flowyourmoney.webp)

Soft app/product style: friendly color, phone mockups, feature
sections, clear benefit copy. Shows how playful can stay trustworthy
around money.

### Send App: illustrated finance sections
Source: https://www.lapa.ninja/post/send-flutterwave/

![Send App screenshot](https://cdn.lapa.ninja/assets/images/1x/send-flutterwave.webp)

Illustrated, approachable finance page with colorful section blocks
and feature storytelling.

---

## social-mobile

### Cash App: bold consumer fintech
Source: https://www.lapa.ninja/post/cash-app/

![Cash App screenshot](https://cdn.lapa.ninja/assets/images/1x/cash-app.webp)

Loud consumer style: black/green, oversized hero, 3D/isometric product
storytelling. Good anchor for social and mobile-first consumer
products with attitude.

---

## ai-native-productivity

### Linear: premium product-led SaaS
Source: https://www.lapa.ninja/post/linear-5/

![Linear screenshot](https://cdn.lapa.ninja/assets/images/1x/linear-5.jpg)

Premium SaaS style: dark background, crisp product screenshots, short
sections, refined spacing. The polish bar for AI/productivity web apps.

### Scale: enterprise illustrated clarity
Source: https://www.lapa.ninja/post/scaleapi-2/

![Scale screenshot](https://cdn.lapa.ninja/assets/images/1x/Scale-Api-01-05-2018.webp)

Business/enterprise product page: explains categories, shows workflow,
logos, and credibility sections. Anchor for the B2B/enterprise end of
this direction.

---

## technical-devtool

### Vercel: dark technical landing
Source: https://www.lapa.ninja/post/vercel-2/

![Vercel screenshot](https://cdn.lapa.ninja/assets/images/1x/vercel-2.webp)

Dev-tool style: dark, high-contrast, platform credibility, technical
visuals and code/product sections.

### Resend: email/API product
Source: https://www.lapa.ninja/post/resend-2/

![Resend screenshot](https://cdn.lapa.ninja/assets/images/1x/resend-2.jpg)

Technical SaaS/API style: dark, clean, code snippets, developer trust,
focused message.

### React Email: immersive dark product
Source: https://www.lapa.ninja/post/react-email/

![React Email screenshot](https://cdn.lapa.ninja/assets/images/1x/react-email.jpg)

Dark technical product page with strong product visuals and
code-driven sections.

---

## luxury-commerce

### Commonry: fashion, product-first
Source: https://www.lapa.ninja/post/commonry/

![Commonry screenshot](https://cdn.lapa.ninja/assets/images/1x/commonry.webp)

Fashion ecommerce with strong photography, large type,
category/product sections, and direct shopping paths.

### Poppi: bold DTC food/drink (loud counterpoint)
Source: https://www.lapa.ninja/post/drinkpoppi/

![Poppi screenshot](https://cdn.lapa.ninja/assets/images/1x/drinkpoppi.webp)

Bright DTC brand style: packaging hero, loud color, playful copy,
flavor/product sections. The opposite pole of commerce from Commonry:
useful when the brief says "bold," not "premium."

---

## premium-editorial

### Bowery: bold editorial food brand
Source: https://www.lapa.ninja/post/bowery-2/

![Bowery screenshot](https://cdn.lapa.ninja/assets/images/1x/bowery-2.webp)

Huge type, bold visuals, product/process storytelling. Anchor for
modern food brands and editorial-leaning product sites.

---

## creative-studio-portfolio

### MILK London: playful illustrated restaurant
Source: https://www.lapa.ninja/post/milk-london/

![MILK London screenshot](https://cdn.lapa.ninja/assets/images/1x/milk-london.webp)

Immersive illustration and personality. Good anchor for cafes, food
trucks, and playful hospitality brands.

---

## Directions without examples yet

No live anchors collected so far for: **calm-japanese-mindful**,
**wellness-minimal**, **finance-trading-dashboard**,
**brutalist-experimental-startup**, **mobile-native-utility**. When one
of these is nominated, browse https://www.lapa.ninja/ (or the user's
own loved references) and add the best find here, following the format
above.

---

## Quick mapping for Alex's projects

Where a project has its own `docs/DESIGN.md`, that doc is the contract:
this table only routes to anchors consistent with it.

| Project | Best references |
|---|---|
| DayDump (quiet cinematic photo journal) | Linear for marketing polish, Commonry for photography-forward restraint. Cash App / Send are **anti-references**: its DESIGN.md bans shouting chrome. |
| Nisatsu (calm reading-first language app) | Linear, Vercel, Resend: calm dark product-led polish. Tinycards/Duolingo is an **anti-reference**: its DESIGN.md explicitly rejects Duolingo-style gamification. |
| SitesByAlex | Scale for business clarity, Linear for product polish, Commonry for premium spacing |
| AI/web app | Linear, Vercel, Resend, React Email |
| Ecommerce demo | Commonry for product-first, Poppi for bold DTC |
| Restaurant/food | MILK for playful, Bowery for bold editorial food |

---

## Appendix: capturing fresh screenshots locally (optional)

Remote images can rot, and live sites evolve past their gallery
screenshots. If fresh full-page captures are wanted, this skill stays
Markdown-only, so the script lives here as a snippet the user can copy
out and run themselves (never run it on the skill's behalf):

```js
// Save as capture-sites.js, then:
//   npm init -y && npm i playwright && npx playwright install chromium
//   node capture-sites.js
const { chromium } = require('playwright');
const fs = require('fs');
const sites = [
  ['duolingo', 'https://www.duolingo.com/'],
  ['cashapp', 'https://cash.app/'],
  ['linear', 'https://linear.app/'],
  ['vercel', 'https://vercel.com/'],
  ['resend', 'https://resend.com/'],
  ['poppi', 'https://drinkpoppi.com/'],
  ['commonry', 'https://www.commonry.com.au/'],
];
(async () => {
  fs.mkdirSync('real-screenshots', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  for (const [name, url] of sites) {
    console.log('capturing', name, url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `real-screenshots/${name}.png`, fullPage: false });
  }
  await browser.close();
})();
```

Captured PNGs are for local study only: same no-lifting rule applies.
