---
name: ios-audit
description: Audits a mobile app codebase against Apple App Store Review Guidelines and Google Play policy to predict and prevent store-review rejections before submission. Checks the high-rejection areas — app completeness and demo-account/reviewer notes (2.1), accurate metadata and age rating (2.3), privacy manifest and required-reason APIs (2.5), in-app purchase and subscription disclosures (3.1.1/3.1.2), minimum functionality (4.2), Sign in with Apple alongside social login (4.8), privacy policy + in-app account deletion (5.1.1), third-party and AI data-sharing consent (5.1.2 incl. the Nov 2025 AI rule), App Tracking Transparency, user-generated/AI content moderation with report+block+filter+EULA (1.2), kids/COPPA handling (5.1.4), and the Google Play parallels (Data safety form, web deletion URL, target API level, Play Billing, Families). Emits a prioritized, IDed IOS-xxx fix queue with file:line evidence, ready for fix-errors. Use when the user asks for an App Store review audit, an iOS/Play submission readiness check, "will this get rejected?", a pre-submission compliance pass, or App Review guideline conformance review. Read-only — produces a report, does not fix.
---

# iOS / App Store Review Audit

You are auditing a mobile app codebase to **predict and prevent App Store and
Google Play review rejections** before submission. Output is a prioritized,
IDed findings queue another agent (or `fix-errors`) can work through — not a
set of edits. **Do not modify code.**

Apple rejects ~25% of submissions, overwhelmingly for preventable reasons:
crashes/incompleteness, privacy gaps, payment/subscription mistakes, missing
account deletion, missing Sign in with Apple, and unmoderated user/AI content.
This skill walks the codebase against each high-rejection guideline.

## Operating principles

- **Read before judging.** Inspect actual code, config, and store metadata.
  Never infer behavior from names alone — open the file and confirm.
- **Evidence over assertion.** Every finding cites `file:line` or a concrete
  observation (a missing config key, an absent flow). No hand-waving.
- **Verdict per check: PRESENT / MISSING / PARTIAL / N/A.** "N/A" only with a
  stated reason (e.g. "no accounts, so 5.1.1 deletion does not apply").
- **Severity-ranked.** Blocker (will be rejected) / High (likely) / Medium
  (possible / depends on reviewer) / Low (polish). Lead with blockers.
- **Actionable.** Each finding states the fix and the guideline number.
- **No false confidence.** If something can't be verified from the code (e.g.
  the App Store Connect metadata fields, the privacy nutrition label answers),
  say so explicitly and add it as a manual-verification item.
- **Both stores.** Default to Apple (stricter) and call out Google Play
  divergences. Skip a platform only if that target clearly doesn't exist.

## Process

1. **Detect the stack & targets.** Is this iOS native (Swift/SwiftUI/UIKit),
   Android native (Kotlin/Java), React Native, Expo, Flutter, Capacitor/
   Cordova, or a hybrid? Find the manifest(s): `Info.plist`,
   `*.xcodeproj`/`project.pbxproj`, `AndroidManifest.xml`, `app.json` /
   `app.config.(js|ts)` (Expo), `Podfile`, `build.gradle`, `pubspec.yaml`.
   Identify which stores it ships to.
2. **Build the integration inventory.** List third-party SDKs (analytics,
   crash, ads, auth, payments, AI) from the dependency manifests — these drive
   privacy-manifest, ATT, data-disclosure, and IAP checks.
3. **Run every audit dimension below**, one at a time, searching for the
   patterns listed and recording PRESENT/MISSING/PARTIAL with evidence.
4. **Synthesize** the IOS-xxx queue and a go/no-go verdict.

For React Native/Expo/Flutter, remember native config may live in `app.json` /
`app.config.ts`, plugin configs, or generated native projects rather than a
hand-edited `Info.plist`.

## Audit dimensions

For each: confirm whether the requirement applies, then verify the
implementation in code/config. Cite evidence.

### 1.2 — User-generated / AI-generated content moderation (Safety)

Applies if users can post, share, publish, or discover content, OR the app
surfaces AI-generated content/chat. If so, **all** must be PRESENT:
- **Pre-publish filtering / moderation** of content before it's visible.
  Search: `moderat`, `filter`, `flag`, `preModerate`, profanity/safety calls.
- **Report content** flow. Search: `report`, `Report`, `/report`, abuse.
- **Block user** flow. Search: `block`, `/block`, `mute`.
- **Published contact info** for support (in-app and/or listing).
- **EULA / terms with a zero-tolerance clause** the user accepts before
  contributing. Search: `terms`, `eula`, `community-guidelines`, `agree`.
- For AI output: evidence the app prevents on-demand objectionable generation.
- **1.2.1 age restriction** for content exceeding the app's age rating, if a
  creator/feed app.
Missing report **or** block **or** filter on a public-UGC app = Blocker.

### 2.1 — App completeness (Performance)

- **No placeholder content** shipping: search `lorem`, `ipsum`, `TODO`,
  `FIXME`, `coming soon`, `placeholder`, `test@`, dummy URLs, `localhost`,
  `127.0.0.1`, `http://` (non-TLS), hardcoded staging endpoints.
- **No dead/empty links** in user-facing surfaces.
- **Crash risk / unfinished flows** behind login or paywall.
- **Demo account + reviewer notes**: there is no code artifact, so flag as a
  **manual-verification item** — the submitter must provide demo credentials
  (and enable the backend) or an approved demo mode, plus review notes for any
  gated feature. Missing this is a top rejection cause.
- All referenced **IAP products** must be submitted with the build (manual).

### 2.3 — Accurate metadata & age rating (Performance)

- Screenshots/preview reflect real UI (manual-verification item).
- App name/subtitle/keywords/description accurate, no keyword stuffing (manual).
- **Age rating** must reflect actual content — UGC, AI output, mature themes
  raise it. Flag if the app has UGC/AI but you can infer a too-low rating.

### 2.5 — Software requirements & privacy manifest (Performance)

- **`PrivacyInfo.xcprivacy` present** (app target) and for each bundled SDK on
  Apple's required-manifest list. Search the repo for `PrivacyInfo.xcprivacy`.
  Absent on iOS = Blocker (auto-rejection since May 2024).
- **Required-reason APIs** declared: UserDefaults, file timestamps, disk space,
  system boot time, active keyboard. Search: `UserDefaults`, `NSFileManager`/
  `FileManager` attributes, `systemUptime`.
- **Tracking domains** listed in the manifest if any SDK tracks.
- **No remote code execution** that changes app purpose (JS-bundle hot updates
  changing features, `eval`, dynamic native loading).
- **Public APIs only**; no private API symbols.
- **2.5.14**: explicit consent + visible indicator when recording camera/mic/
  screen. Search: `AVCaptureSession`, `ReplayKit`, `screen record`, `microphone`.

### 3.1.1 — In-app purchase routing (Business)

- Any unlock of digital features/content on **iOS must use Apple IAP**; on
  Android, **Google Play Billing**. Search for off-platform payment paths
  reachable from the app: `stripe`, `checkout`, `paypal`, `braintree`,
  external `Linking.openURL(...checkout...)`, web-payment buttons.
- A reachable Stripe/web checkout from inside the iOS app = Blocker.
- License keys / QR / crypto to unlock = Blocker.

### 3.1.2 — Subscription disclosures (Business)

On the **purchase screen itself**, verify all are PRESENT:
- **Price + billing period** per plan.
- **Auto-renew disclosure** ("renews until cancelled", how to cancel).
- **Functional Terms of Use (EULA) link** AND **functional Privacy Policy
  link** (tappable, open real docs). Search the paywall component for `terms`,
  `privacy`, `Linking.openURL`, `<a href`.
- **Restore Purchases** action. Search: `restore`, `restorePurchases`,
  `restoreCompletedTransactions`.
- These links must also exist in store metadata (manual-verification item).
Any of price/auto-renew/Terms/Privacy/Restore missing on a subscription
paywall = Blocker.

### 4.2 — Minimum functionality (Design)

- Flag pure webview wrappers with no native value: a single `WebView`/
  `react-native-webview` as the whole app, link-list apps, marketing-only apps.

### 4.8 — Login services (Design)

- If **any** third-party/social login exists (Google, Facebook, X, LinkedIn,
  Amazon, WeChat), **Sign in with Apple must also be offered** on iOS. Search:
  `GoogleSignIn`, `FacebookLogin`, `signInWithOAuth`, `expo-auth-session`,
  then confirm `AppleAuthentication` / `SignInWithApple` /
  `expo-apple-authentication` exists too.
- Social login without Apple = Blocker (iOS). N/A if only first-party accounts
  or only education/enterprise/government identity.

### 5.1.1 — Privacy policy & account deletion (Legal)

- **Privacy policy link** reachable in-app (and in metadata — manual). Search:
  `/privacy`, `privacy-policy`, `Privacy Policy`.
- **In-app account deletion** if the app supports account creation:
  - Must be an **in-app flow** that **deletes** (not just deactivates) the
    account + personal data. Search: `delete account`, `deleteAccount`,
    `/account/delete`, `DELETE /users`, "danger zone".
  - A web link is acceptable only if deletion also starts in-app.
  - Confirmation/reauth steps OK; must not be unnecessarily hard.
  - If auto-renew subs exist, the flow should warn billing continues via Apple.
- Missing account deletion on an account-based app = Blocker.
- **Permission purpose strings**: every requested permission has a **specific,
  non-empty** usage description. Search `Info.plist` / `app.json` infoPlist for
  `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
  `NSLocationWhenInUseUsageDescription`, `NSMicrophoneUsageDescription`,
  `NSUserTrackingUsageDescription`, etc. Empty/generic strings = High.
- **Unused permissions** declared but not used = High (remove them).
- **Account creation forced** when core features don't need it = Medium.

### 5.1.2 — Data use, sharing & third-party AI (Legal)

- **Third-party data sharing** disclosed + consented (analytics/ads/crash).
- **AI data-sharing rule (Nov 13 2025, 5.1.2(i))**: if personal data is sent
  to a third-party AI (OpenAI, Anthropic, Gemini, etc.), there must be a
  **consent surface naming the provider** before data is sent. Search the AI
  call sites (`openai`, `anthropic`, `gemini`, model endpoints) and check for a
  disclosure/consent gate. Missing = High/Blocker depending on data sensitivity.
- App must not gate functionality on enabling push/location/tracking.

### App Tracking Transparency (5.1.1 / privacy label)

- If any SDK tracks across apps/sites (ad SDKs, IDFA, attribution), the **ATT
  prompt** must fire before tracking. Search: `AppTrackingTransparency`,
  `requestTrackingAuthorization`, `NSUserTrackingUsageDescription`, `IDFA`,
  `AdSupport`.
- The **mismatch trap**: privacy label says tracking but no prompt, or a
  tracking SDK is present while the app claims no tracking. Flag inconsistency
  and add the nutrition-label answer as a manual-verification item.

### 5.1.4 — Kids & COPPA (Legal)

- If the app is directed to children, or collects a child's name/age/DOB:
  flag COPPA/GDPR-K obligations. Search: `child`, `kid`, `age`, `birth`,
  `parent`, `coppa`, `family`.
- Kids-Category apps: **no third-party analytics or ads**; parental gates for
  links-out/purchases. Flag any analytics/ad SDK in a kids-targeted app.

### Google Play parallels

- **Data safety form** matches real collection/sharing (manual-verification).
- **Account deletion**: in-app path **plus a web-accessible deletion URL**
  declared in Play Console (manual). Note both are required.
- **Target API level** recent enough (check `targetSdkVersion`/`compileSdk` in
  `build.gradle` / `app.json` against Play's current floor).
- **Play Billing** for digital goods (same as 3.1.1).
- **Sensitive permissions** justified; high-risk ones declared.
- **Families policy / IARC content rating** if child-appealing (manual).

## Output format

Produce a report:

1. **Verdict** — one line: ready / not ready, with the Blocker count and the
   single biggest risk.
2. **Context** — detected stack, target stores, key SDKs.
3. **Findings queue** — a table, severity-ordered (Blocker → High → Medium →
   Low), each row:
   - **ID**: `IOS-001`, `IOS-002`, …
   - **Guideline**: e.g. `4.8` / `Play Billing`.
   - **Verdict**: MISSING / PARTIAL / etc.
   - **Finding**: what's wrong, with `file:line` evidence.
   - **Fix**: the concrete change required.
4. **Manual-verification items** — things not checkable from code (demo
   account, reviewer notes, screenshots, nutrition label / Data safety answers,
   ASC metadata links, web deletion URL). List as a checklist.
5. **What's already compliant** — brief, so the user sees covered ground.

Keep IDs stable and sequential so `fix-errors` can consume the queue. End by
offering to run `fix-errors` against the actionable (code-fixable) IOS-xxx
items.

## Scope notes

- Read-only audit. Do not edit code.
- Store-side configuration (App Store Connect / Play Console fields, nutrition
  label, Data safety form, demo account, screenshots) cannot be verified from
  the repo — always surface these as explicit manual-verification items rather
  than passing them silently.
- Guidelines change; when uncertain about a current threshold (e.g. Play's
  target API level this year), state the requirement and flag it for the user
  to confirm against the live docs.
