---
name: test-suite-developer
description: "Builds a comprehensive, outcome-driven test suite — maps every behavior, contract, and invariant, then writes and runs the tests until green. (Served live via the BuildsByAlex MCP — `skill_test_suite_developer`.)"
---

> **Live skill — thin pointer, not the skill itself.** The real, always-current
> instructions for `test-suite-developer` live on the BuildsByAlex brain and update in real
> time. This repo is never re-vendored when the skill changes; the live body is
> loaded fresh on every run.

When this skill is invoked:

1. Load the live skill by calling the MCP tool `skill_test_suite_developer` (BuildsByAlex server) and
   follow exactly what it returns — that is the source of truth. If it names
   supporting files, fetch them with `get_skill_resource` (skill: `test-suite-developer`).
2. If the BuildsByAlex MCP is not connected — `skill_test_suite_developer` is unavailable or the call
   fails — STOP and tell the user to connect the BuildsByAlex MCP token
   (https://buildsbyalex.com/mcp). Do not improvise a local substitute.

Never paraphrase or cache the body here; always load it fresh so improvements on
the brain take effect immediately.
