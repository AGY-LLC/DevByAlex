---
name: ios-audit
description: "App Store and Google Play review audit. Use when the user asks 'will this get rejected?', for an App Store review audit, an iOS or Play submission readiness check, or a pre-submission compliance pass. Checks the high-rejection areas (completeness and reviewer notes, metadata and age rating, privacy manifest, IAP disclosures, minimum functionality, Sign in with Apple, account deletion, data-sharing and AI consent, ATT, UGC moderation, kids) plus the Google Play parallels. Read-only: emits an IDed IOS-xxx fix queue with file:line evidence for fix-errors."
---

# iOS / App Store review audit

## Goal

Predict and prevent App Store and Google Play rejections before submission:
an `IOS-xxx` queue `fix-errors` can work, and a list of what only a person can
confirm in the store consoles. Apple is the default bar (stricter); Play
divergences are called out. A platform is skipped only when that target
clearly doesn't exist.

## Done when

- **Stack and targets are known:** native iOS, native Android, React Native,
  Expo, Flutter or Capacitor; the manifests (`Info.plist`, `project.pbxproj`,
  `AndroidManifest.xml`, `app.json` or `app.config.*`, `Podfile`,
  `build.gradle`, `pubspec.yaml`); the stores it ships to; and the third-party
  SDKs (analytics, crash, ads, auth, payments, AI) that drive the privacy,
  ATT, disclosure and IAP checks. For Expo and other cross-platform apps,
  native config is read from `app.json`, plugin config or generated projects.
- **Every check below has a verdict,** PRESENT, MISSING, PARTIAL or N/A (N/A
  only with a reason, e.g. "no accounts, so 5.1.1 deletion does not apply"),
  with evidence from the opened file:
  - *1.2 UGC and AI content* (users post, share or discover content, or the
    app shows AI output): pre-publish filtering, a report flow, a block flow,
    published support contact, terms with a zero-tolerance clause accepted
    before contributing, guards against on-demand objectionable AI output,
    and in creator or feed apps 1.2.1 age gating for content above the app's
    rating. Missing report, block or filtering on a public-UGC app is a
    Blocker.
  - *2.1 Completeness:* no shipped placeholders (`lorem`, `TODO`, `FIXME`,
    `coming soon`, `test@`, `localhost`, `127.0.0.1`, `http://`, staging
    hosts), no dead links, no crash-prone or unfinished flows behind login or
    paywall.
  - *2.3 Metadata and age rating:* the rating reflects real content; UGC, AI
    output or mature themes with an apparently low rating is flagged. Listing
    copy in the repo (`store/ios/`, `store/android/`) claims only shipped
    features and fits the rating; with none in the repo it is a manual item.
  - *2.5 Software requirements:* built with Xcode 26 and the iOS 26 SDK
    (required since 2026-04-28; check the EAS image or CI Xcode);
    `PrivacyInfo.xcprivacy` in the app target and for each bundled SDK on
    Apple's list (absent is a Blocker); required-reason APIs declared
    (UserDefaults, file timestamps, disk space, boot time, active keyboard);
    tracking domains listed when an SDK tracks; no remote code that changes
    the app's purpose (`eval`, feature-changing bundle updates, dynamic native
    loading); public APIs only; 2.5.14 consent and a visible indicator when
    recording camera, mic or screen.
  - *3.1.1 Payments:* digital unlocks use Apple IAP on iOS and Play Billing on
    Android. A Stripe or web checkout reachable from the iOS app, or unlocking
    by license key, QR or crypto, is a Blocker.
  - *3.1.2 Subscriptions:* the purchase screen itself shows price and period
    per plan, the auto-renew terms and how to cancel, working Terms (EULA)
    and Privacy links, and Restore Purchases. Any one missing is a Blocker.
  - *4.2 Minimum functionality:* not a bare webview wrapper, link list or
    marketing-only app.
  - *4.8 Login services:* any third-party login (Google, Facebook, X,
    LinkedIn, Amazon, WeChat) is matched by Sign in with Apple on iOS, else a
    Blocker; N/A for first-party accounts only or education, enterprise or
    government identity.
  - *5.1.1 Privacy and accounts:* a privacy policy link in the app; for apps
    with account creation, an in-app flow that deletes (not deactivates) the
    account and its data, a web link only alongside an in-app start, no
    needless friction, and, when auto-renewing subscriptions exist, a warning
    that Apple keeps billing (missing deletion is a Blocker); a specific,
    non-empty purpose string for every requested permission (empty or
    generic is High); no declared but unused permissions (High); no forced
    account when core features don't need one (Medium).
  - *5.1.2 Data use:* third-party sharing (analytics, ads, crash) disclosed
    and consented; personal data sent to a third-party AI only after a
    consent surface naming the provider (5.1.2(i), High or Blocker by data
    sensitivity); no feature gated on enabling push, location or tracking.
  - *ATT:* any cross-app tracking (ad SDKs, IDFA, attribution) waits for the
    `requestTrackingAuthorization` prompt, with
    `NSUserTrackingUsageDescription`; a tracking SDK with no prompt, or a
    privacy label that disagrees with the code, is flagged.
  - *5.1.4 Kids:* an app directed at children or collecting a child's name,
    age or birth date carries COPPA and GDPR-K obligations; any third-party
    analytics or ad SDK in such an app is flagged, and a Kids-category app
    also gates links out and purchases.
  - *Google Play:* in-app deletion plus a web deletion URL declared in Play
    Console; `targetSdkVersion` at Play's floor (API 36 for new apps and
    updates since 2026-08-31); Play Billing for digital goods; sensitive
    permissions justified and high-risk ones declared.
- **The report** opens with a one-line verdict (ready or not, the Blocker
  count, the single biggest risk), then the stack, stores and key SDKs, then
  the queue as a table ordered Blocker, High, Medium, Low with stable ids
  (`IOS-001` …), each row giving the guideline (`4.8`, `Play Billing`), the
  verdict, the finding with `file:line` evidence and the concrete fix. Then
  manual-verification items as a checklist, a short list of what already
  complies, and an offer to run `fix-errors` on the code-fixable items.

## Decisions (and why)

- **Severity is the rejection odds:** Blocker (will be rejected), High
  (likely), Medium (depends on the reviewer), Low (polish). Why: the user
  needs to know what stops submission first.
- **Store-side facts are manual-verification items, never silent passes:**
  the demo account and enabled backend (or an approved demo mode), reviewer
  notes for gated features, IAP products submitted with the build,
  screenshots and preview showing real UI, an accurate name, subtitle,
  keywords and description with no keyword stuffing, Terms and Privacy links
  in the listing, the privacy nutrition label and tracking answers, a Play
  Data safety form matching real collection and sharing, the web deletion
  URL, and Families or IARC ratings for child-appealing apps. Why: a missing
  demo account and reviewer notes are among the top rejection causes and the
  repo can't show them.
- **Thresholds drift:** when a current requirement is uncertain (the Xcode
  SDK floor, Play's target API level), state it and flag it for the user to
  confirm against the live docs. Why: a stale floor reads as a pass.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Read-only: the audit never edits code or config.
- Behavior is confirmed in the file, never inferred from a name, and every
  finding cites `file:line` or a concrete absence (a missing key or flow).
