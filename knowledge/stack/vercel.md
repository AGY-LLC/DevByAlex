---
id: stack-vercel
title: "Vercel"
summary: "My default deployment platform for Next.js projects. It's genuinely excellent for most use cases. I've also hit its limits."
tags: ["stack", "vercel"]
updated: 2026-05-28
---
# Vercel

My default deployment platform for Next.js projects. It's genuinely excellent for most use cases. I've also hit its limits.

---

## What it does well

- Zero-config Next.js deploys — push to main, it's live
- Preview deployments per PR are a superpower for review workflows
- Edge network is fast
- Environment variable management is clean
- Automatic HTTPS + domain management
- OG image generation, image optimization built in

## Limits I've hit

- **Log retention** — short by default. Pay for longer persistence.

## When Vercel is the right call

- Next.js projects (obviously)
- Projects where fast deployment feedback loops matter
- Teams that don't want to manage infrastructure
- When preview deploys would improve the review process (almost always yes)

## When to look elsewhere

- Long-running compute (background jobs, video processing, heavy AI pipelines)
- Projects needing custom server configuration
- Serious cost sensitivity at scale — Vercel pricing can surprise you
- When you need persistent WebSocket connections

## Alternatives

- **AWS (EC2 / ECS / Lambda)** — more control, more setup, scales to anything. I haven't built an app where I need to do this yet. Likely will never need to.

---

## Rules

- Don't store secrets in code or commit them to git — use Vercel environment variables
- Set up production environment variables separately from preview — don't share prod secrets with preview environments

## Preferences

- Use Vercel preview URLs in PR descriptions for visual review
- Set up branch-based environment variables (preview vs production configs)

## AI notes

AI can help generate Vercel config (`vercel.json`) and GitHub Actions workflows for Vercel deployments. Generally reliable.

Watch for outdated suggestions around `vercel.json` — the schema has evolved and some options are deprecated.
