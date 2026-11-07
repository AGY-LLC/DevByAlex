---
id: stack-react-native
title: "React Native"
summary: "Default for mobile: Expo (SDK 58, New Architecture only) under app/ in the monorepo, consuming web/'s API."
tags: ["stack", "react-native"]
updated: 2026-11-05
---
# React Native

**Default for mobile: Expo, iOS + Android from one codebase.** The app lives under `app/` and consumes `web/`'s API (`app.{{domain}}/api`), per `dev-scaffold`. Bare React Native only when Expo hits a specific wall; Flutter or native Swift/Kotlin when performance is the product (heavy animation, AR, game-adjacent).

## Version (Expo SDK 58, React Native 0.88)

- Target the current Expo SDK. The legacy architecture is gone (SDK 55+ is New Architecture only), so pick libraries that support it.
- Expo Go runs only the latest SDK and is a learning tool: develop and test on **development builds** (`expo-dev-client`).
- Expo Router no longer depends on React Navigation (SDK 56+): don't import `@react-navigation/*` in a Router app; migrate with `npx expo-codemod sdk-56-expo-router-react-navigation-replace <src>`.
- SDK 58 turns on strict TypeScript types and Android R8 by default: fix the type errors and check release builds for stripped code, don't switch either off.
- Budget time for each SDK upgrade; they break things.

## Rules

- OTA updates don't bypass store review for native code changes.
- Test deep links on physical devices, not just simulators.
- Auth over deep links follows RFC 8252: the redirect carries a single-use exchange code (never a token or PKCE verifier), redeemed over HTTPS; prefer App Links / Universal Links over custom schemes and use `expo-web-browser` (system browser), never a WebView. Details in `../checklists/auth-setup.md`.
- Test both platforms before submitting.
- Web is primary: when web and mobile patterns conflict, the mobile app adapts.
- API contract drift is the main risk: a changed response shape may silently feed `app/` wrong data. Keep the contract explicit (shared types) and test both consumers when a backend shape changes.
- No web-only patterns (DOM APIs, web-specific CSS-in-JS props) in the Expo app.

## Preferences

- Expo Router for navigation.
- Zustand for client state, React Query for server state.
- Platform code in `*.ios.ts` / `*.android.ts`, not big `Platform.select` blocks.
- A shared types package (or directory) for types used by web and mobile.
