---
name: ios-audit
description: "Audits a mobile app against Apple App Store Review Guidelines and Google Play policy, emitting an IDed IOS-xxx fix queue with file:line evidence. (Served live via the BuildsByAlex MCP — `skill_ios_audit`.)"
---

> **Live skill — thin pointer, not the skill itself.** The real, always-current
> instructions for `ios-audit` live on the BuildsByAlex brain and update in real
> time. This repo is never re-vendored when the skill changes; the live body is
> loaded fresh on every run.

When this skill is invoked:

1. Load the live skill by calling the MCP tool `skill_ios_audit` (BuildsByAlex server) and
   follow exactly what it returns — that is the source of truth. If it names
   supporting files, fetch them with `get_skill_resource` (skill: `ios-audit`).
2. If the BuildsByAlex MCP is not connected — `skill_ios_audit` is unavailable or the call
   fails — STOP and tell the user to connect the BuildsByAlex MCP token
   (https://buildsbyalex.com/mcp). Do not improvise a local substitute.

Never paraphrase or cache the body here; always load it fresh so improvements on
the brain take effect immediately.
