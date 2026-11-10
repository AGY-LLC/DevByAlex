---
name: launch-store-assets
description: "Generates store-listing assets for both the App Store and Google Play. Use when the user says 'generate store assets', 'make the App Store / Play listing', 'app icon and screenshots', 'ASO copy', 'store metadata' or 'prep the store listing'. Produces icons, device screenshots from the running app, the Android feature graphic and listing copy to each store's field limits, under store/ios/ and store/android/ with a manifest. Checks metadata with ios-audit. Needs docs/BRAND.md. Does not upload (launch-submit does)."
argument-hint: "[optional: store, ios | android | both (default both); or a specific asset, icon | screenshots | copy]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-store-assets: Generate the listing for Apple and Google

## Goal

Both store listings, App Store Connect and Google Play, are ready to upload:
icons, screenshots of the real running app and listing copy, each in the exact
image specs and field limits its store enforces, with no metadata that would
bounce in review. This generates; `launch-submit` uploads.

Before starting: the app builds and runs, and `docs/BRAND.md` exists (else
stop and route to `/marketer-brand-generation`). Read it with `docs/SPEC.md`,
the feature cards, `docs/STATUS.md` and the app config (`app.json` /
`app.config.*`, `Info.plist`, `AndroidManifest.xml`) for the name, bundle or
package id and version. An argument narrows scope by store (`ios`, `android`,
`both`, default both) or asset (`icon`, `screenshots`, `copy`).

## Done when

- **Icons:** iOS 1024x1024 (no alpha, no baked-in corners) plus the in-app set
  or the asset-catalog source; Android 512x512 plus adaptive foreground and
  background layers where the project uses them. An existing brand mark is
  rendered, not redesigned.
- **Screenshots** of 3 to 6 hero features, captured from the running app with
  `create-demo`'s Maestro capture on seed data: iOS 6.9" iPhone (6.5" if no
  6.9" set) plus 13" iPad for universal apps; Android phone at Play's accepted
  ratios, tablet sets if supported, and the 1024x500 feature graphic. Short
  benefit-led captions in the brand voice, the core value in the first 2 or 3,
  and light and dark variants when the app ships both and the category
  benefits.
- **Copy** (`marketer-copywriting`) within each store's limits: App Store name
  and subtitle 30, promotional text 170, description 4000, keywords 100
  (comma-separated, no spaces, no competitor trademarks), what's new,
  support and marketing URLs, categories; Play title 30, short description 80,
  full description 4000, what's new 500. One primary locale, with a note on
  locales worth adding.
- **Compliance:** `ios-audit` ran over the copy and the app (accurate metadata
  with no undelivered claims, age and content rating answers that match real
  content such as UGC, AI and data use, privacy and data-safety disclosures
  consistent with the listing) and its findings are folded in or listed as
  `[manual]` decisions for Alex.
- **Layout:** `store/ios/` and `store/android/` each hold `icon/`,
  `screenshots/<size>/`, per-field `copy.md` and a `metadata.json` that
  `launch-submit` or Fastlane `deliver`/`supply` can consume (plus
  `feature-graphic.png` for Android), and `store/README.md` maps each file to
  its place in App Store Connect or Play Console.
- STATUS has **Launch → Store listing assets generated** checked for the
  in-scope stores with a log line, `## Next action` is `/launch-submit`, and
  any `[manual]` decisions are noted for Alex.

## Decisions (and why)

- **Both stores by default, each to its own specs.** Why: wrong dimensions or
  over-limit copy is a guaranteed bounce, and the two stores differ.
- **Real screens, real claims.** Why: mockups passed as real and undelivered
  features are review rejections (Apple 2.3) as well as bad ASO.
- **Brand from `docs/BRAND.md` and the repo.** Why: the listing is the first
  impression of an identity that already exists.
- **Reuse `create-demo`, `marketer-copywriting` and `ios-audit`.** Why: one
  owner per check keeps them from drifting apart.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Generate, never upload or submit.
- Seed or test data only in every screenshot: no real user data, secrets or
  placeholder text.
