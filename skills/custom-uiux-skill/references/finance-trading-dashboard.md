# Reference direction: Finance / Trading Dashboard

High-density, live-data UIs for traders, treasurers, ops teams, and
finance professionals. Every pixel earns its keep. Decisions are made in
seconds and money is on the line; the UI must read fast and not lie.

## When to use it

- Trading and portfolio surfaces.
- Treasury, accounting, billing ops consoles.
- BI and live KPI dashboards for finance roles.
- Risk and compliance monitoring tools.

## When not to use it

- Consumer banking apps (use a friendlier variant).
- Anything where the user is an *occasional* not professional viewer.
- Marketing surfaces for the same product (those need to *signal*
  density, not impose it).

## What it should feel like

Calm under load. Dense without being chaotic. The screen looks like a
trader could read it from their peripheral vision and act.

## Layout traits

- Grid of live tiles; resizable and persistable per user.
- Multi-pane: positions, ticker, depth, news, alerts.
- Sticky headers, frozen first columns in tables.
- Dense rows (28–32px) with tabular numerics.
- Right-side detail drawer when a row is selected (don't navigate away).

## Color tendencies

- Dark mode default. Light mode supported but secondary.
- Functional semantic colors: green up, red down, amber risk. Do **not**
  decorate with these colors. Reserve them for meaning.
- Single brand accent for selection and primary actions; everything else
  is neutral.
- Avoid gradients entirely on data surfaces: they shift perceived value.

## Typography tendencies

- Mono *only* for numbers (tabular-figures Inter or a dedicated mono).
- Sans for labels and UI.
- Small body sizes (12–14px).
- No italics for emphasis: change weight or color.

## Component patterns

- Spark-lines and miniature charts inline in cells.
- Order entry forms with keyboard shortcut hints next to each field.
- Live-blinking ticks that obey reduced motion (use a 1px border pulse
  instead of a full flash).
- Saved views, named filters, persistent column layouts.
- Audit-log / activity trails on every important action.
- Confirmation modals on destructive or high-value actions, always with
  the affected number echoed back.

## Navigation patterns

- Top app bar shows account, role, environment (sandbox vs prod) loudly.
- Left rail for navigation; lots of keyboard shortcuts.
- Tabs within a view for symbol / instrument / asset switching.
- Breadcrumbs reflect the entity hierarchy precisely.

## Motion / interaction style

- Snap. No bounces. 80–150ms.
- Tick animations are subtle and reduced-motion-aware.
- Hover reveals are precise; never block the cell underneath.
- Loading states are stripe-shimmer placeholders, not spinners that
  block the whole table.

## Good inspiration categories

- Pro trading terminals (category-level).
- Modern observability dashboards (some pattern overlap).
- High-end portfolio management apps.

## Anti-patterns to avoid

- "Modern finance" pastel candy palettes on data screens: they hide
  the meaning of green/red.
- Hover-only critical info.
- Spinners on individual cells in a table: use the row shimmer.
- Big iconography. Numbers are the icon.
- Confirmation modals without showing the exact value being changed.
- Centered hero on a dashboard. There is no hero on a dashboard.
- AI gradient backgrounds. Not the product.

## Example suitable products

- A live equities or crypto trading dashboard.
- A treasury ops console.
- A risk and exposure monitoring tool.
- A real-time billing/revenue ops dashboard.
- A live KPI war-room for finance ops.

## Example unsuitable products

- A consumer budgeting app for first-time users.
- A children's allowance tracker.
- A wellness app.
- A reading product.
- A B2C social app.
