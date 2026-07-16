---
id: workflow-doc-maintenance
title: "Doc maintenance policy"
---

# Doc maintenance policy

**Objective: keep a deliberately doc-heavy system lean enough to stay true.**
The workflow runs on its docs: they are the memory of an autonomous pipeline,
so the doc set is naturally heavy and that is by design. What is not tolerated
is excess. Every line an agent must read costs context on every future run,
and stale or duplicated content actively misleads the loop. Docs hold
**current state and governing decisions**: everything else is removed the
moment it stops earning its place. Git is the archive; the docs are the
working set.

## 1. Core principle

A doc is working state, not a record of effort. Write for the next reader, an
agent deciding what to do, not for posterity. Commits, diffs, and test output
already record what happened; the doc records only what holds **now**. The
test for any line: *does it change what the next reader does?* If not, it
does not belong.

## 2. The canonical set is closed

The workflow's `docs/` artifacts are a fixed set, each with one owner:

| Doc | Owned by | Holds |
|-----|----------|-------|
| `STATUS.md` | every skill (last write) | stage, gates, feature table, next action, blockers, short log |
| `SPEC.md` | `plan-spec` | what the app is and is not |
| `BRAND.md` | `marketer-brand-generation` | positioning, voice, messaging |
| `IMPLEMENTATION_GUIDE.md` + `features/` | `plan-guide` | the ordered build plan + per-feature cards |
| `DESIGN.md` | `plan-design` / `uiux-redesign` | style pick, references, tokens |
| `wireframes/` + `design/RESOURCES.md` | `plan-wireframes` | per-feature frames, specced assets |
| `adr/` | `plan-guide` seed, `feature-loop` upkeep | what each feature has / deliberately lacks, and why |
| `DECISIONS.md` | any skill (append) | chronological cross-cutting decision log |
| `BUGS.md` / `TWEAKS.md` / `TODO.md` / `FEEDBACK.md` | the lanes | open work only |
| `ACCEPTANCE_TESTS.md` | `launch-acceptance` | staging scenario spec |
| `AI_WORKFLOW.md` | `init-ai` | the stamped map (this workflow) |
| `staging-smoke-test.md` | `staging-smoke-test` | the manual pre-prod walkthrough |

**Creating any other `docs/` file requires a recorded decision in
`DECISIONS.md`** naming why no existing doc can hold the content. The default
answer is no. Analysis notes, run summaries, investigation write-ups, and
"NOTES-for-later" files never land in `docs/`: they live in the scratchpad
and die with the run; anything worth keeping is distilled into the owner doc.

## 3. One home per fact

Every fact has exactly one home; every other doc links to it. Duplication is
a maintenance bug twice over: double read cost now, guaranteed drift later.
On finding the same content in two places, keep the owner's copy and replace
the other with a pointer (or delete it outright).

## 4. Never record what the repo already records

Not in docs: code-structure walkthroughs, per-commit narration, test
inventories, dependency lists, anything derivable by reading the code or
`git log`. Docs hold what **cannot** be derived: intent, approvals,
deliberate omissions, the reason behind a choice, what happens next.

## 5. Writing last means reconciling, not appending

Every skill reads STATUS first and writes it last, and that last write is a
**reconcile pass**, never a bare append: check off what the unit completed,
delete blockers it resolved, remove lane entries it drained, delete content
its work superseded, fix links its changes broke. Appending a log line above
stale state is a policy violation, not a style miss.

## 6. Append-heavy sections rotate

An append-only section nobody prunes eventually outweighs the content its doc
exists for. Caps (each pruned entry survives in git):

- **STATUS › Log**: keep the current stage's entries, max ~15 lines; prune
  the rest on stage transition.
- **STATUS › Blockers**: resolved blockers are deleted, not struck through.
- **BUGS / TWEAKS / TODO closed sections** (`Fixed` / `Done`): keep the
  current stage's entries, max ~20; each names its commit, so pruning loses
  nothing.
- **FEEDBACK**: a triaged item keeps one routing line; delete it once the
  routed entry itself is closed.
- **DECISIONS.md** is the one append-forever file: entries stay, but each is
  a few lines, never an essay (detail belongs in the relevant ADR).

## 7. Supersession replaces, it never accumulates

A restyle rewrites `DESIGN.md`'s tokens; a spec change rewrites the section.
Superseded content is **removed**, leaving only the one-line supersession
record where a contract requires one (an ADR entry flips to `superseded` with
date + pointer; `DECISIONS.md` gets a line). Never keep an "old version below
for reference"; the reference is git.

## 8. Doc bloat is a finding

The no-orphans invariant covers docs, and so do the validators and `scout`:
duplicated content, drained-but-present lane entries, superseded sections,
process narration, and dead links are filed in the normal findings queue
(tagged `doc-bloat`) exactly like dead code, and fixed through the same loop.
`init-ai`'s integration inventory includes the existing docs: bloat found on
integration is queued, not adopted.

## 9. What pruning never touches

Gate states and approvals; `active` ADR decisions, deliberate omissions, and
supersession one-liners; open lane entries; legal/compliance records;
anything explicitly recorded as kept. Pruning removes the derived, the
duplicated, and the done, never the governing record. When it's unclear
whether content governs or narrates, it goes to Alex as a keep-or-remove
question, same as a substantial code orphan; a "keep" is recorded so the next
sweep doesn't re-flag it.

## 10. Style floor

- Bullets over paragraphs; a table where the shape repeats.
- Absolute dates only.
- No process narration ("first we tried…"), no throat-clearing, no restating
  the template's own guidance inside filled entries.
- Detail flows **down** the hierarchy: STATUS gets one line, the feature card
  or ADR gets the detail, the code is the truth.
- A doc that has grown well past its template's shape without proportional
  new scope is presumptively bloated: reconcile it before adding more.

**The one-paragraph policy:** the doc set is closed and every fact has one
home; docs hold current state and governing decisions, never what code or git
already records; every skill's final doc write is a reconcile pass that
prunes what its work completed or superseded; append-heavy sections rotate on
hard caps; supersession replaces rather than accumulates; doc bloat is a
review finding like dead code; and pruning never touches gates, active ADRs,
open lane entries, or compliance records.
