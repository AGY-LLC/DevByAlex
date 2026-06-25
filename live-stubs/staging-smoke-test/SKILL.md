---
name: staging-smoke-test
description: "Generates a human-walkable manual smoke-test checklist covering every surface, integration, and config path before promoting staging to prod. (Served live via the BuildsByAlex MCP — `skill_staging_smoke_test`.)"
---

> **Live skill — thin pointer, not the skill itself.** The real, always-current
> instructions for `staging-smoke-test` live on the BuildsByAlex brain and update in real
> time. This repo is never re-vendored when the skill changes; the live body is
> loaded fresh on every run.

When this skill is invoked:

1. Load the live skill by calling the MCP tool `skill_staging_smoke_test` (BuildsByAlex server) and
   follow exactly what it returns — that is the source of truth. If it names
   supporting files, fetch them with `get_skill_resource` (skill: `staging-smoke-test`).
2. If the BuildsByAlex MCP is not connected — `skill_staging_smoke_test` is unavailable or the call
   fails — STOP and tell the user to connect the BuildsByAlex MCP token
   (https://buildsbyalex.com/mcp). Do not improvise a local substitute.

Never paraphrase or cache the body here; always load it fresh so improvements on
the brain take effect immediately.
