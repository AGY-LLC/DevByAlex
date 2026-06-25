---
name: prose-check
description: "Strips AI tells from user-facing prose and repo docs — throat-clearing, false contrasts, passive voice, em dashes, vague declaratives. (Served live via the BuildsByAlex MCP — `skill_prose_check`.)"
---

> **Live skill — thin pointer, not the skill itself.** The real, always-current
> instructions for `prose-check` live on the BuildsByAlex brain and update in real
> time. This repo is never re-vendored when the skill changes; the live body is
> loaded fresh on every run.

When this skill is invoked:

1. Load the live skill by calling the MCP tool `skill_prose_check` (BuildsByAlex server) and
   follow exactly what it returns — that is the source of truth. If it names
   supporting files, fetch them with `get_skill_resource` (skill: `prose-check`).
2. If the BuildsByAlex MCP is not connected — `skill_prose_check` is unavailable or the call
   fails — STOP and tell the user to connect the BuildsByAlex MCP token
   (https://buildsbyalex.com/mcp). Do not improvise a local substitute.

Never paraphrase or cache the body here; always load it fresh so improvements on
the brain take effect immediately.
