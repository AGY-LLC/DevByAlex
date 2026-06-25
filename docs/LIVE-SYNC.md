# Live sync: hosting DevByAlex inside the BuildsByAlex brain

> Writeup for the question: *what's the best way to adjust BBA as needed so it
> adjusts live — and can DBA just live in BBA?* Short answer: **yes, and it's the
> natural end state.** This doc explains how BBA serves content today, what
> "DBA lives in BBA" means concretely, and the exact pipeline to adjust it live.

DBA = **DevByAlex** (this repo, `AGY-LLC/DevByAlex`).
BBA = **BuildsByAlex** (`AGY-LLC/BuildsByAlex`), Alex's personal-brain MCP server.

---

## 1. The problem, restated

Every onboarded app gets a **copy** of the workflow's skills in `.claude/skills/`.
Improve a skill and every repo is stale until re-vendored. We already fixed this
for the 11 reused skills the brain serves: they install as **thin stubs**
(`live-stubs/`) that load the live body from BBA on each run. See
[live-stubs/README.md](../live-stubs/README.md).

What's left are the skills you actually edit *here* — the **native** workflow
skills (`init-ai`, `plan-*`, `dev-*`, `launch-*`) and the 5 agents. They aren't
on the brain, so they still ship as copies. The question is how to make those
live too — and the cleanest answer is to give them the same home the reused
skills already have: BBA.

---

## 2. How BBA serves content today (the model to extend)

BBA is a TypeScript/Node MCP server (ADR-0001) backed by **two committed git
sources**, indexed and served over MCP:

```
AGY-LLC/BuildsByAlex ── brain/        ──► context + best practices
                                          (brain:// resources, get_best_practice,
                                           search_brain, start_here)

AGY-LLC/skills       ── skill defs     ──► the skill_<slug> tools + get_skill_resource
                        (SKILL.md +         (scout, fix-errors, launch-readiness,
                         resources/)         … the 11 we already stub to)
```

Two facts that decide everything below:

1. **Skills and methodology live in different sources on purpose.** `brain/` is
   the *methodology* engine (how Alex builds — auth, data-modeling, testing
   playbooks). The **skills source is the canonical home for executable skill
   definitions** (`brain://workflows/agent-skills`: "treat `AGY-LLC/skills` as
   the canonical home for skill definitions"). The two were deliberately split
   and kept split across ADR-0003/0005/0006/0007.
2. **Writes are reviewed, committed to `main` via a GitHub App, and audited**
   (ADR-0001; `get_audit_log`). Over HTTP the server is **read-only**; the
   audited write tools are only on the trusted local stdio channel. So
   "adjusting BBA" is never a live poke at a running server — it's a reviewed
   commit to a git source the server re-indexes.

That second fact is the good news: **"adjust live" already exists.** Editing a
reused skill on the brain's skills source updates every onboarded repo on its
next run, with zero re-vendoring. We just need DBA's native skills to sit in that
same serving layer.

> Precedent worth noting: ADR-0007 *removed* the `marketer-*` skills from BBA.
> That's the same lever in reverse — and it's exactly why `marketer-brand-generation`
> and `marketer-copywriting` are the two skills DBA still vendors. Membership in
> BBA is the on/off switch for "served live."

---

## 3. What "DBA lives in BBA" means concretely

Move the native skill **bodies** into the skills source BBA indexes, so each
becomes a `skill_<slug>` tool that updates live — exactly like `scout`. The DBA
repo stops shipping heavy copies and ships **stubs** instead (the mechanism is
already built).

```
            BEFORE                                AFTER
  ┌────────────────────────┐          ┌────────────────────────────┐
  │ AGY-LLC/DevByAlex      │          │ AGY-LLC/DevByAlex (thin)    │
  │  skills/  (14 full)    │          │  live-stubs/ (14+11 stubs)  │
  │  agents/  (5 full)     │          │  agents/  (5, or stubs)     │
  │  templates/, docs/     │          │  templates/, docs/          │
  │  install.sh            │          │  install.sh, sync/          │
  └────────────────────────┘          └────────────────────────────┘
        every edit = re-vendor               edit once in BBA, every
        across every onboarded repo          repo current next run
                                       ┌────────────────────────────┐
                                       │ BBA skills source           │
                                       │  devbyalex/init-ai/         │
                                       │  devbyalex/dev-autopilot/   │
                                       │  … served as skill_<slug>   │
                                       └────────────────────────────┘
```

The DBA repo becomes an **installer + stub manifest + templates + workflow docs**.
The real skill bodies live in BBA, edited in one place, served live everywhere.

---

## 4. Where exactly the content goes — options

| Option | Placement | Verdict |
|---|---|---|
| **A. Into the skills source under a `devbyalex/` namespace** | The repo BBA already indexes for `skill_<slug>` | ✅ **Recommended** — least new infra; BBA already treats it as canonical; reuses the exact path the 11 live skills take. |
| B. A new BBA-indexed source repo (`AGY-LLC/devbyalex-skills`) | A second skills source the MCP indexes | Cleaner separation/versioning, but new wiring in BBA's indexer and another repo to run. Only worth it if DBA's skills should release on a different cadence than the reused ones. |
| C. Into `brain/` | Alongside best practices | ❌ Avoid. `brain/` is methodology; skills are executable workflows. The ADRs deliberately keep these apart — folding skills into `brain/` re-tangles what ADR-0003/0005/0006 untangled. |

**Recommendation: A.** Namespace the skills (`devbyalex/<name>/SKILL.md`) so the
slugs are unmistakable and collision-proof — `skill_init_ai`, `skill_dev_autopilot`,
`skill_feature_loop`, `skill_plan_spec`, `skill_launch_compliance`, etc. (slug =
name with `-`→`_`, same convention the brain already uses).

---

## 5. The "adjust live" pipeline

Authoring stays in git (reviewable, versioned, rollback-able). BBA is the serving
layer. The loop:

```
  edit skill in BBA skills source ─► PR + review ─► merge to main (GitHub App, audited)
        │                                                      │
        │                                              MCP re-indexes
        ▼                                                      ▼
  get_audit_log shows the write              next skill_<slug> call serves new body
                                                      │
                                             every onboarded repo current
                                             on its next run — no re-vendor
```

Concretely, to adjust a workflow skill from now on:

1. Edit `devbyalex/<name>/SKILL.md` in the BBA skills source (locally, via the
   trusted stdio write channel, or a normal PR).
2. Merge to `main`. The GitHub App commit is audit-logged.
3. Done. No DBA release, no `install.sh` re-run, no per-repo update. The next run
   in any repo loads the new body via `skill_<name>`.

The DBA repo only changes when the **stub manifest** changes (a skill added or
removed), not when a skill's *content* changes.

---

## 6. The pieces that need a decision

### 6a. Agents
BBA serves *skills* (`skill_<slug>`), not subagents. Two routes:

- **Keep the 5 agents vendored (recommended short-term).** They're small, stable
  orchestration wrappers that change far less than skill bodies. Leaving them as
  local `.claude/agents/*.md` copies costs little and avoids inventing an
  agent-serving path BBA doesn't have.
- **Agent-stubs (later).** Publish each agent's prompt as a skill resource and
  have a thin local agent file pull it via `get_skill_resource`. Same pattern as
  skill stubs; only worth it once agent churn justifies it.

### 6b. Versioning / reproducibility
Serving from `main` gives you history and rollback for free (revert the commit).
The tension is the same one from the earlier decision: **real-time vs pinned**. A
mid-build skill change could shift behavior non-reproducibly. If that ever
matters, add a **version pin** — have the stub request a tag/SHA and teach BBA to
serve a pinned read (it doesn't expose versioned reads today). Default to live;
pin only the cases that need release-locked behavior.

### 6c. Token / offline
Stubs need the BBA MCP token on the runner. That's already the one dependency
`/dev-schedule` wires into cloud/CI, so attended and scheduled runs have it. A
stub with no brain connection **stops and asks** rather than silently no-op'ing.
Anything not yet on BBA (today: `marketer-*`) stays vendored until it is.

---

## 7. Migration sequence

1. **Publish** the 14 native skills (and optionally the agent prompts) into the
   BBA skills source under `devbyalex/`. Reviewed PR → merge to `main`.
2. **Verify** `list_skills` returns them (`skill_init_ai`, `skill_dev_autopilot`,
   …) and each `skill_<slug>` serves the body.
3. **Flip them to stubs in DBA:** add the native names to the live registry in
   [`sync/gen-live-stubs.sh`](../sync/gen-live-stubs.sh), regenerate `live-stubs/`,
   and remove the now-duplicated heavy copies from `skills/`. (`install.sh`'s
   native-skill loop reads `skills/*`, so it should consult the live registry the
   same way the reused-skill loop does — a small, additive change.)
4. **Migrate existing repos** with one command per repo:
   `./install.sh <app> --migrate` — it swaps heavy copies for stubs idempotently
   and leaves `docs/` and anything not-yet-on-BBA untouched.

After this, the only full copies left in an onboarded repo are the agents (by
choice) and any skill BBA doesn't serve yet.

---

## 8. Recommendation

**Make BBA the single live serving layer for every agent capability — reused and
workflow alike — by hosting DBA's native skills in the skills source under a
`devbyalex/` namespace (Option A).** Keep `brain/` for methodology only, keep the
5 agents vendored for now, and add version-pinning only if release reproducibility
becomes a real need.

The payoff: **one place to edit, everything updates live.** The DBA repo collapses
to an installer + stub manifest + templates + docs, the re-vendor treadmill
disappears entirely, and "adjusting BBA as needed" becomes a normal reviewed,
audited commit — the same safe write path the brain already uses.
