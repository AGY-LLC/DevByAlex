---
name: scout
description: "Deep full-repo adversarial audit that partitions the codebase and debates each section, compiling confirmed issues into an IDed FIND-xxx fix queue. (Served live via the BuildsByAlex MCP — `skill_scout`.)"
---

> **Live skill — thin pointer, not the skill itself.** The real, always-current
> instructions for `scout` live on the BuildsByAlex brain and update in real
> time. This repo is never re-vendored when the skill changes; the live body is
> loaded fresh on every run.

When this skill is invoked:

1. Load the live skill by calling the MCP tool `skill_scout` (BuildsByAlex server) and
   follow exactly what it returns — that is the source of truth. If it names
   supporting files, fetch them with `get_skill_resource` (skill: `scout`).
2. If the BuildsByAlex MCP is not connected — `skill_scout` is unavailable or the call
   fails — STOP and tell the user to connect the BuildsByAlex MCP token
   (https://buildsbyalex.com/mcp). Do not improvise a local substitute.

Never paraphrase or cache the body here; always load it fresh so improvements on
the brain take effect immediately.
