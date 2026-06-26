---
id: stack-playwright
title: "Playwright"
summary: "End-to-end browser testing. It's heavier than unit tests, harder to maintain, and catches bugs nothing else will. Worth using for the paths that matter."
tags: ["stack", "playwright"]
updated: 2026-05-28
---
# Playwright

End-to-end browser testing. It's heavier than unit tests, harder to maintain, and catches bugs nothing else will. Worth using for the paths that matter.

For where E2E fits in the overall test strategy (the pyramid, what to cover vs. what to skip), see [Testing Strategy](../checklists/testing-strategy.md).

---

## When to use Playwright

- Sign up / login / auth flows
- Payment flows (Stripe Checkout redirect)
- Any flow where bugs have caused real issues before
- Multi-step processes where the integration matters

Not worth writing Playwright tests for: every page, simple forms, things that change constantly.

---

## Setup

```bash
npm init playwright@latest
```

This scaffolds `playwright.config.ts`, `tests/` directory, and example tests.

**Basic config:**
```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Example: Login flow test

```ts
import { test, expect } from '@playwright/test'

test('user can log in with email and password', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('TestPassword123!')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Welcome back')).toBeVisible()
})
```

## Handling auth in tests

Don't log in through the UI for every test — it's slow and fragile. Use storage state to reuse auth sessions:

```ts
// tests/auth.setup.ts
import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!)
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
  await page.context().storageState({ path: 'tests/.auth/user.json' })
})
```

Then reference `storageState` in tests that need auth.

---

## Rules

- Never run Playwright against production. Use a dedicated test environment or localhost.
- Keep E2E tests focused on user journeys, not implementation details
- Tests should clean up after themselves — don't leave test data in shared environments

## Preferences

- Use `page.getByRole()` and `page.getByLabel()` over CSS selectors — more resilient to UI changes
- Record with `npx playwright codegen` to scaffold tests quickly, then clean them up
- Run E2E tests in CI on PR but not on every push if they're slow

## AI notes

AI can generate Playwright tests reasonably well. Common issues:
- Using brittle CSS selectors instead of accessible roles/labels
- Missing `await` on assertions
- Not handling async navigation (missing `waitForURL`)

Useful prompt: *"Write a Playwright test for the [user journey] flow. Use accessible selectors (getByRole, getByLabel). Handle navigation waits."*
