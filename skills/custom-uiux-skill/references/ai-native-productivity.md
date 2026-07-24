# Reference direction: AI-Native Productivity

For products whose core interaction is conversational, generative, or
agent-driven, but which still need to feel like a *tool*, not a toy.
Think modern editors, agent IDEs, AI notes apps, AI sidecars.

## When to use it

- Apps where a chat / agent panel is a first-class UI primitive.
- Editors and canvases augmented by an AI sidebar or inline suggestions.
- Knowledge tools that read, write, and rewrite content on your behalf.
- Products where the user is in a loop with a model, not a form.

## When not to use it

- Products where AI is a feature, not the spine: use a different
  reference and add AI surfaces as overrides.
- Heavy data dashboards (use technical-devtool).
- Consumer mood apps (use playful or calm).

## What it should feel like

Quiet, intelligent, fast. The UI gets out of the way to let the model
speak. The model speaks well. The user feels collaborated-with, not
talked-at.

## Layout traits

- Editor + sidebar pattern. Sidebar collapses to icons on small screens.
- Inline chat surfaces (right rail, bottom drawer, or floating
  composer).
- Streaming output regions with reserved space (no layout shift when
  tokens arrive).
- Command palette for actions; slash-commands inside editors.
- Selection-aware action menus ("Ask AI about selection").

## Color tendencies

- Neutral first: paper or near-black surfaces.
- One signature accent for AI moments (a single mid-saturation hue),
  used on the streaming pulse, the composer focus ring, and important
  agent affordances.
- No rainbow gradients on "AI" features. The user already knows.
- Dark mode is a real first-class mode, not an inverted afterthought.

## Typography tendencies

- A clean humanist sans (Inter, Geist, IBM Plex Sans).
- A serif option for long-form writing surfaces.
- Mono for code blocks, citations, and tool-call traces.
- Sizes: editor 16–17px, chat 14–15px, dense lists 13–14px.

## Component patterns

- Streaming text region with a subtle ticking cursor.
- "Reasoning / sources / tool calls" disclosure under each message.
- Inline diff for edits the model proposes ("accept / reject" per hunk).
- Markdown rendered properly: code blocks, lists, tables, footnotes.
- Citations are first-class: hover for preview, click to jump.
- Empty states show 3–5 prompt examples relevant to the user's data.

## Navigation patterns

- Left sidebar lists workspaces, projects, threads.
- Right sidebar (when present) is contextual (suggestions, tools).
- Threads are like documents: named, dated, searchable, exportable.

## Motion / interaction style

- Tokens stream smoothly; no flicker.
- 100–200ms ease-out for everything else.
- The composer focus ring "breathes" subtly only while streaming.
- Reduced motion turns the breath off, but streaming stays: it's
  meaningful, not decorative.

## Good inspiration categories

- AI-first editor/IDE patterns (concept-level).
- Note-taking apps with AI sidecars (concept-level).
- Modern model-vendor consoles (read the patterns, not the brand).

## Anti-patterns to avoid

- Sparkle / magic-wand icons next to every feature.
- Rainbow / iridescent gradients to signify "AI."
- Excessive disclaimers in chat ("I am an AI, please verify…") shoved
  into the UI chrome instead of into the model's behavior.
- Pretending the model is a person with a name and an avatar, unless
  the brief explicitly asks for that persona.
- Confetti on generation completion.
- Hiding tool-call activity behind a curtain: show it, don't pretend
  it's magic.
- A "New Chat" button that throws away context with no confirmation.

## Example suitable products

- An AI notes / second-brain app.
- An agent IDE for code.
- An AI customer-support copilot.
- A generative writing studio.
- A research assistant with retrieval.

## Example unsuitable products

- A meditation app.
- A trading dashboard (use finance/technical instead).
- A photo-sharing app.
- An ecommerce storefront.
- A children's product.
