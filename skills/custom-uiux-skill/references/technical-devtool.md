# Reference direction: Technical Devtool

For products engineers and technical operators use daily. Terminal-
adjacent aesthetics, keyboard-first interaction, density that rewards
expertise. Reads as serious infrastructure, not a SaaS demo.

## When to use it

- Developer tools, CLIs with web companions, dashboards for engineers.
- Internal infra consoles, observability, logs, traces, metrics.
- API documentation surfaces and admin panels.
- Anything used heads-down by a small audience of power users.

## When not to use it

- Consumer apps. Density and monospace read as cold.
- Onboarding-heavy products targeting non-engineers.
- Marketing surfaces for the same product (these usually need a softer
  variant: the marketing site should *signal* devtool, not *be* one).

## What it should feel like

Sharp, fast, no nonsense. The UI is dense without being noisy. The user
feels like they are working with tools, not browsing a brochure.

## Layout traits

- Multi-pane layouts: tree on left, content center, inspector right.
- Dense tables. Sticky headers. Resizable columns and panels.
- Keyboard shortcuts visible, with a `?` overlay.
- Command palette (Ctrl/Cmd-K) is non-negotiable.
- Tabs and breadcrumbs for deep navigation.

## Color tendencies

- Dark mode default; light mode often dimmer than typical web (#fafaf9-
  ish, not pure white).
- Functional color: green pass, red fail, amber warn, blue info. Tuned
  for high contrast on dark.
- Saturated accent (single) for primary actions and selection.
- Backgrounds in two tones (surface and elevated surface), visible
  but quiet.

## Typography tendencies

- Mono for code, IDs, timestamps, IPs, hashes (JetBrains Mono, Berkeley
  Mono, IBM Plex Mono, Geist Mono).
- Sans for body and UI (Inter, Geist, IBM Plex Sans).
- Smaller body size than consumer (13–14px).
- Tight line-height in dense regions; relaxed in docs.

## Component patterns

- Command palette with fuzzy search and recent items.
- Resource list pages with filter chips, column toggles, saved views.
- Inline copy-to-clipboard on every ID and code block.
- Status pills with consistent shape (small radius, bold label).
- Empty states that *teach*: show the CLI command or API call that
  would create this resource.
- Diff views for config and resource changes.

## Navigation patterns

- Persistent left sidebar with grouped sections and collapsible groups.
- Top bar shows org/project/environment selector + user.
- Deep linking everywhere; URLs encode state.
- "Back" should work even after AJAX navigation.

## Motion / interaction style

- Snappy. 100–150ms.
- No bounces. No spring physics.
- Hover affordances precise. Focus rings prominent (engineers tab).
- Toasts are short and stack from a corner; no full-screen modals
  except destructive confirms.

## Good inspiration categories

- Cloud consoles (category-level, observability, db, infra).
- CI/CD dashboards.
- Modern devtool product pages (read the *patterns*, not the brand).
- Terminal multiplexers, modal editors.

## Anti-patterns to avoid

- Marketing-style hero on the dashboard ("Welcome back, [Name] 🎉").
- Rounded-card-on-rounded-card visual padding inflation.
- Gradient backgrounds anywhere in the app surface.
- Cute illustrations in empty states. Show the command instead.
- Hidden destructive actions behind hover-only menus.
- Animated number counters; treat live numbers as live.

## Example suitable products

- A logs / traces explorer.
- A feature-flag console.
- A queueing or job scheduling dashboard.
- A database client / SQL editor.
- A CI/CD pipeline visualizer.
- A self-hosted admin panel.

## Example unsuitable products

- A consumer fitness app.
- A children's product.
- A wedding-planning tool.
- A meditation app.
- An ecommerce storefront.
