---
id: stack-jest
title: "Jest"
summary: "Unit and integration testing for JavaScript/TypeScript. The standard for a reason."
tags: ["stack", "jest"]
updated: 2026-05-28
---
# Jest

Unit and integration testing for JavaScript/TypeScript. The standard for a reason.

This doc is the *mechanics* (setup, mocking, patterns). For *what* to test and *why*, the outcomes-driven philosophy, what to enumerate, and which kind of test to reach for, see [Testing Strategy](../checklists/testing-strategy.md).

---

## Setup (Next.js)

```ts
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

```ts
// jest.setup.ts
import '@testing-library/jest-dom'
```

## Mocking external dependencies

```ts
// Mock Stripe in tests
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    },
  }))
})
```

## Testing API routes (Next.js App Router)

For server actions and route handlers, I test the underlying service functions rather than the route layer. The route layer is mostly plumbing.

```ts
// services/user.test.ts
import { getUserById } from './user'
import { prisma } from '../lib/prisma'

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

describe('getUserById', () => {
  it('returns user when found', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const result = await getUserById('1')
    expect(result).toEqual(mockUser)
  })

  it('returns null when user not found', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getUserById('1')
    expect(result).toBeNull()
  })
})
```

---

## Rules

- Mock external services (Prisma, Stripe, Firebase) in unit tests: don't hit real services
- Don't test implementation details: test behavior and outcomes
- A test that never fails is not a test; verify your mocks are actually being called

## Preferences

- `describe` blocks for grouping, `it` for individual cases
- Test file colocated with source: `user.test.ts` next to `user.ts`
- Keep tests fast: slow tests don't get run
- Use `jest.spyOn` over manual mocks when you want to preserve the original implementation partially

## AI notes

AI generates Jest tests quickly. Common issues with generated tests:
- Mocks that don't properly mirror the real module structure
- Tests that pass trivially (no actual assertion about the important behavior)
- Missing `async/await` on async test cases

Review generated tests: does this test actually catch a real bug, or just hit the code path?
