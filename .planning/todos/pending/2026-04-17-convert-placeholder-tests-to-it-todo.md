---
created: 2026-04-17T00:45:00.000Z
title: Convert placeholder tests (`expect(true).toBe(true)`) to `it.todo(...)`
area: testing
files:
  - test/backend/auth/auth-security.test.ts
  - test/backend/auth/auth-views.test.ts
  - test/backend/auth/ban-admin.test.ts
  - test/backend/auth/server-link-provider.test.ts
  - test/backend/brackets/bracket-advancement.test.ts
  - test/backend/match-results/rating-admin.test.ts
---

## Problem

Six test files contain placeholder tests that assert `expect(true).toBe(true)` — they pass vitest's runner but provide zero regression value. The pattern is inherited from Phase 15.2 / earlier where tests documented expected view behavior that the harness couldn't actually exercise (SpacetimeDB views don't generate typed client bindings, so the tests stand as "intended behavior" markers).

Running `grep -rl "expect(true).toBe(true)" test/backend/` finds at minimum:
- `test/backend/auth/auth-security.test.ts`
- `test/backend/auth/auth-views.test.ts`
- `test/backend/auth/ban-admin.test.ts`
- `test/backend/auth/server-link-provider.test.ts`
- `test/backend/brackets/bracket-advancement.test.ts`
- `test/backend/match-results/rating-admin.test.ts`

The problem: `expect(true).toBe(true)` shows as a green passing test in CI, which inflates pass counts and hides the fact that real coverage is missing. A reader of the test report cannot distinguish "this tested X and it worked" from "this asserts nothing meaningful."

Surfaced during Phase 15.5 code review (IN-02 in `.planning/phases/15.5-auth-gated-user-subscription/15.5-REVIEW.md`).

## Solution

Convert each `expect(true).toBe(true)` test to `it.todo('test name', ...)`. Vitest treats `it.todo` as "pending" — it shows in the runner output as a todo, doesn't count toward passes, and preserves the descriptive test name + body comment as documentation.

Mechanical transform:
```ts
// Before
it('SOME-ID: description', () => {
  // ...comment...
  expect(true).toBe(true);
});

// After
it.todo('SOME-ID: description');
// ...comment preserved above or inline...
```

For tests that use `it.skipIf(...)` with `expect(true).toBe(true)`, replace the whole block with `it.todo(...)` unconditionally — the skipIf was only gating a no-op assertion anyway.

Verify after conversion:
- `grep -c "expect(true).toBe(true)" test/backend/` returns 0 (or only legitimate cases outside this scope)
- `npm run test:phase test/backend/auth` (and other touched directories) still pass; affected test counts drop, todo counts rise
- No file adds or removes real assertions — this is a pure annotation cleanup

Scope note: this is a cross-cutting testing cleanup, not a feature phase. Could be handled as a single small PR or as a one-shot inline batch. NOT appropriate to bundle into Phase 15.3 (audit-spread refactor — different concern) or any feature-driven phase.
