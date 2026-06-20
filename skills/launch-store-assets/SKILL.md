---
name: launch-store-assets
description: "Launch-readiness stage of the DevByAlex workflow — generate the store-listing assets for BOTH stores, the way a native builder's 'App Store tab' does, but doubled for Apple App Store Connect and Google Play Console. Produces the app icon (all required sizes), device-framed screenshot sets (iOS required display sizes + Android phone/tablet), the Android feature graphic, an optional preview-video cut, and the full listing copy — app name, subtitle/short description, keyword field, promotional text, full description, and what's-new — each written to the exact field shapes and character limits ASC and Play require, and laid out under store/ios/ and store/android/ with a manifest. Pulls real screens from the running app (reuses create-demo's Maestro capture) rather than mockups, writes the copy with marketer-copywriting, and runs the metadata past ios-audit so the listing won't trip App Review's accurate-metadata / age-rating rules (2.3) or Play's equivalents. Needs docs/BRAND.md for voice/positioning (routes to /marketer-brand-generation if missing). Produces assets + copy; it does not upload (that's launch-submit). Use when the user says 'generate store assets', 'make the App Store / Play listing', 'app icon and screenshots', 'ASO copy', 'store metadata', or 'prep the store listing'."
argument-hint: "[optional: store — ios | android | both (default both); or a specific asset — icon | screenshots | copy]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-store-assets — Generate the listing for Apple and Google

The "App Store tab," doubled. A native iOS builder generates your icon,
screenshots, and description for one store; this generates them for **both** —
App Store Connect and Google Play Console — from the **real running app**, in the
**exact field shapes and image specs each store demands**, so the listing is
ready to paste/upload and won't bounce on a metadata technicality.

It **produces assets and copy — it does not upload.** Uploading/submitting is
`launch-submit`. It reuses `create-demo` (real-screen capture via Maestro),
`marketer-copywriting` (listing copy), and `ios-audit` (metadata compliance).

## When to activate

- Features are built and the app runs; you're preparing the store presence.
- The user says "generate store assets," "make the App Store / Play listing,"
  "app icon and screenshots," "ASO copy," "store metadata," or "prep the store
  listing."
- Scope can be narrowed by store (`ios` / `android` / `both`) or by asset
  (`icon` / `screenshots` / `copy`).

## Prerequisites

- **`docs/BRAND.md`** — voice, positioning, audience, value prop drive the copy
  and the screenshot captions. If missing, **stop and route to
  `/marketer-brand-generation`**, then resume.
- The app builds/runs (for real screenshots). Read `app.json` / `app.config.*` /
  `Info.plist` / `AndroidManifest.xml` for the app name, bundle/package id, and
  current version.

## Workflow

### Step 1 — Read the product and brand
Read `docs/BRAND.md`, `docs/SPEC.md`, the feature cards, and `docs/STATUS.md`.
Identify: the positioning and primary value prop, the 3–6 hero features worth a
screenshot each, the target audience/locale(s), the category, and the age-rating-
relevant content (UGC, AI, data collection). This is the substance the copy and
screenshots must convey.

### Step 2 — App icon
Produce the app icon and export every required size:
- **iOS** — a 1024×1024 App Store icon plus the in-app set (or the single
  1024 source if the project uses an asset-catalog/`Contents.json` that generates
  the rest); no alpha/transparency, no rounded corners baked in.
- **Android** — the 512×512 Play Store icon plus adaptive-icon foreground/
  background layers where the project uses them.
If a brand mark already exists, *use it* — render at the required sizes; don't
invent a new identity. Only design one when none exists, and keep it on-brand.

### Step 3 — Screenshots (from the real app)
Use `create-demo`'s Maestro capture to drive the running app to each hero screen
and grab **real** screenshots (no fabricated UI). Then frame and caption:
- **iOS** — provide the required App Store display sizes: 6.9" (or current
  largest iPhone), 6.5", and 5.5" iPhone, plus 12.9"/13" iPad if the app is
  universal. Correct pixel dimensions per Apple's current spec.
- **Android** — phone screenshots at Play's accepted ratios, a 7"/10" tablet set
  if the app supports tablets, and the **1024×500 feature graphic**.
- Add short, benefit-led captions (from the brand voice) over device frames where
  that fits the category; keep the first 2–3 screenshots carrying the core value
  (most users never scroll further).
- Capture **light and dark** variants if the app ships both and the category
  benefits.
Seed/test data only — never real user data; no placeholder/lorem text in anything
a reviewer or user will see.

### Step 4 — Listing copy (both stores, exact shapes)
With `marketer-copywriting`, write copy to each store's fields and limits:
- **App Store Connect** — app name (≤30 chars), subtitle (≤30), promotional text
  (≤170), description (≤4000), keywords field (≤100, comma-separated, no spaces
  wasted, no competitor trademarks), what's-new, support/marketing URLs,
  primary/secondary category.
- **Google Play** — title (≤30), short description (≤80), full description
  (≤4000), what's-new (≤500).
Lead with the value prop, mirror real features (no claims the app doesn't
deliver — that's both an ASO and a review-rejection issue), and weave keywords
naturally. Provide one primary locale by default; note where additional locales
are worth adding.

### Step 5 — Metadata compliance check
Run `ios-audit` over the drafted metadata and the app to catch listing-level
rejection risks **before** they reach review: accurate metadata and no undelivered
claims (Apple 2.3 / Play equivalent), correct **age rating / content rating**
answers given the app's real content (UGC, AI-generated content, data use),
required privacy/data-safety disclosures consistent with the listing, and no
prohibited keyword/competitor-trademark usage. Fold any findings back into the
copy/metadata (or list them as `[manual]` decisions for Alex where they need a
human call, e.g. category choice).

### Step 6 — Lay out and manifest
Write everything in a paste-/upload-ready structure:
```
store/
  ios/      icon/  screenshots/<size>/  copy.md (per-field)  metadata.json
  android/  icon/  screenshots/<size>/  feature-graphic.png  copy.md  metadata.json
  README.md   ← what each file is, where it goes in ASC / Play Console
```
`metadata.json` holds the structured fields (name, subtitle, keywords, etc.) in a
shape `launch-submit` / Fastlane `deliver`/`supply` can later consume.

### Step 7 — Update STATUS and route
- Check **Launch → Store listing assets generated** when both stores' assets +
  copy exist (or the in-scope store, if narrowed).
- Recommend `launch-submit` as the next step (it uploads these), and note any
  `[manual]` metadata decisions for Alex.
- Add a log line; set `## Next action`.

## Rules

- **Both stores by default**, each to its **own exact field shapes and image
  specs** — wrong dimensions or over-limit copy is a guaranteed bounce.
- **Real screens, real claims.** Screenshots come from the running app; copy
  describes features the app actually has. No mockups passed as real, no
  undelivered promises (ASO *and* review risk).
- **Reuse the brand.** Voice, positioning, and any existing mark come from
  `docs/BRAND.md` and the repo — don't invent a new identity.
- **Generate, don't upload.** This skill stops at ready-to-submit assets;
  `launch-submit` does the upload.
- **No real user data or secrets** in any captured screenshot.
- Reuse `create-demo`, `marketer-copywriting`, and `ios-audit`; don't reimplement
  their work here.

## Output

A `store/` tree with iOS + Android icons, device-framed screenshot sets, the
Android feature graphic, per-field listing copy and a structured `metadata.json`
per store, a `README.md` mapping each asset to its ASC/Play destination, the
metadata compliance findings folded in, the Store-assets launch row in
`docs/STATUS.md` checked, and a pointer to `launch-submit`.
