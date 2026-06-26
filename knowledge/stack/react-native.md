---
id: stack-react-native
title: "React Native"
summary: "My go-to for mobile apps when I want to ship iOS and Android from a shared codebase. I use it with Expo almost always — bare React Native is for when Expo's limitations become real problems."
tags: ["stack", "react-native"]
updated: 2026-05-28
---
# React Native

My go-to for mobile apps when I want to ship iOS and Android from a shared codebase. I use it with Expo almost always — bare React Native is for when Expo's limitations become real problems.

Typical setup I use: the Expo app lives under `app/` alongside a Next.js web app under `server/` in the same repo, sharing types and an auth provider where it makes sense.

---

## Pros

- One codebase for iOS + Android is a genuine win on smaller teams
- Expo managed workflow makes setup and OTA updates painless
- Sharing business logic / types / utilities with a Next.js web app is very doable in a monorepo
- React mental model transfers directly if you already know React
- Expo Go makes early development fast
- Strong community, good third-party library coverage for most common needs

## Cons

- Native modules break the managed workflow — when you need one, you're usually in for a painful detour
- Bridge-based architecture (pre-New Architecture) has performance ceilings that matter in animation-heavy apps
- Debugging is harder than web. Remote JS debugger, Flipper, native crashes — it's messier
- App review cycles (especially iOS) are a slow feedback loop that doesn't exist in web
- Expo SDK upgrades can break things unexpectedly. Budget upgrade time into your roadmap.
- TypeScript + React Native navigation types are verbose and easy to get wrong

## Monorepo with web: lessons learned

A few things I've learned from running an Expo app and a Next.js web app in the same repo:

- **Web is primary.** When web and mobile patterns conflict, web wins. The mobile app adapts. This constraint sounds limiting but it actually reduces decision fatigue.
- **API contract drift is the main risk.** When you change an API response shape in `server/`, the `app/` consumer may not break immediately — it may just silently receive wrong data. Shared TypeScript types help, but they don't eliminate the problem.
- **Auth needs to work on both.** Pick an auth provider that has a clean story for both web sessions and mobile sessions without wildly different integration patterns per platform. Some providers (Stytch, Clerk) handle this well; others (Firebase Auth) are doable but require more per-platform wiring.
- **Don't mix web-only patterns into the Expo app.** It sounds obvious. It still happens when you're moving fast.

## When I'd use it again

- Consumer app that needs both iOS and Android
- Any project where sharing code with a web app is valuable
- Internal tools where native performance isn't a hard requirement
- Projects where the team already knows React

## When I'd avoid it

- App where native performance is critical (complex animation, game-adjacent, AR)
- Project where only one platform is needed — just use native or Flutter
- Team with no JavaScript/React background
- When budget is so tight that maintaining two separate apps is actually cheaper

## Alternatives

- **Flutter** — better performance, Dart is a learning curve, design system is different
- **Swift / Kotlin native** — right answer when you need full platform capability
- **Capacitor + Ionic** — web-first approach, works better if you have a web team and a simple app

## Current stance

**Default for mobile.** Expo managed workflow first, eject only when necessary. New Architecture adoption is progressing — keep an eye on it.

---

## Rules

- Never eject from Expo unless you've hit a specific wall that truly requires it
- OTA updates don't bypass app store review for native code changes — don't assume they do
- Deep link handling needs to be tested on physical devices, not just simulators
- Always test on both platforms before submitting — "it works on iOS" is not enough
- In a web+mobile monorepo: keep the API contract explicit and test both consumers when backend shapes change

## Preferences

- React Navigation over Expo Router for complex apps; Expo Router for simpler/newer projects
- Zustand for state, not Redux (too verbose, too much boilerplate for most apps)
- Prefer React Query for server state
- Keep platform-specific code in `*.ios.ts` / `*.android.ts` files rather than big `Platform.select` blocks
- Shared types package (or shared directory) for types used across web and mobile

## AI notes

AI is decent at generating React Native component boilerplate and navigation setup. It tends to confuse old React Navigation API with new. Always specify the version.

Watch out for AI suggesting patterns that work in web React but not React Native (e.g., DOM-specific things, CSS-in-JS via styled-components with web-specific props).

AI also doesn't automatically flag when a change in the web API will break the mobile client. That's a human concern.

Useful prompt: *"Using React Native with Expo SDK [version] and React Navigation v6, create a [thing]. Use TypeScript."*
