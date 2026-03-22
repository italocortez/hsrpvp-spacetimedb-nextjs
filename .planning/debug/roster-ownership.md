---
status: investigating
trigger: "Investigate why Phase 2 roster integration tests fail with 'Not your account' and related ownership errors"
created: 2026-03-18T00:00:00Z
updated: 2026-03-18T00:00:00Z
---

## Current Focus

hypothesis: All failures trace to a single shared-state contamination: the test DB is not isolated between runs. The `subscribeToAllTables()` call causes the test harness to see ALL HsrAccount rows in the database — not just those belonging to the current test session's user. This means `[...h.conn.db.HsrAccount.iter()]` returns accounts owned by previous test users, and the test code picks those up and tries to update/activate/delete them under the current user's identity, causing "Not your account".
test: Trace through each failing test to verify whether the account chosen by the test actually belongs to the test user, or might belong to a prior user.
expecting: Every failure can be explained by `iter()` returning stale rows from prior test runs that belong to a different userId.
next_action: Document each failure's root cause and classify it.

## Symptoms

expected: All roster CRUD tests pass — create, update, set-active, delete operations succeed for the verified test user.
actual: Multiple tests fail with "Not your account" SenderError or incorrect values; one test fails with `undefined` vs `null`.
errors: |
  - "auto-labels when displayLabel is empty" → expected `Account \d+` got `Char Test Account`
  - "enforces maximum 5 accounts per user" → expected reducer to fail but succeeded
  - "updates label and visibility" → SenderError "Not your account"
  - "rejects empty display label" → "Not your account" instead of "cannot be empty"
  - "activates target and deactivates others" → expected false got true
  - "is a no-op on already-active account" → related
  - "deletes account and cascades character rows" → expected undefined got null
reproduction: Run `vitest roster-accounts.test.ts` against a live DB that has accumulated HsrAccount rows from prior test sessions.
started: Phase 2 UAT integration testing.

## Eliminated

- hypothesis: The reducer ownership check logic is wrong
  evidence: roster.ts lines 56, 81, 108 — `account.userId !== user.id` is correct ownership check. The reducers are correct.
  timestamp: 2026-03-18T00:00:00Z

- hypothesis: ensureVerifiedUser does not correctly identify the test user as verified
  evidence: connection.ts shows `verifyUserViaServerConnection` is called, which calls `server_link_discord`, which sets `isGuest: false`. This part is correct. If verification failed the tests would throw "Roster management requires a verified account", not "Not your account".
  timestamp: 2026-03-18T00:00:00Z

- hypothesis: The second `loginAsGuest` call in connection.ts resets the user back to guest
  evidence: auth.ts login_as_guest: if mapping already exists, it only updates `lastLoginAt` and `isOnline`. It does NOT touch `isGuest`. So re-login does not revert verified status.
  timestamp: 2026-03-18T00:00:00Z

## Evidence

- timestamp: 2026-03-18T00:00:00Z
  checked: connection.ts createHarnessInternal — subscribeToAllTables()
  found: The test harness calls `connInner.subscriptionBuilder().subscribeToAllTables()`. This means the client's in-memory cache (h.conn.db.HsrAccount) contains ALL rows from the HsrAccount table — not filtered by userId.
  implication: Every call to `[...h.conn.db.HsrAccount.iter()]` in the test returns accounts belonging to ALL users in the database, including those created in prior test runs.

- timestamp: 2026-03-18T00:00:00Z
  checked: roster-accounts.test.ts line 81 — "enforces maximum 5 accounts per user"
  found: `const currentCount = [...h.conn.db.HsrAccount.iter()].length`. This counts ALL accounts in the DB, not just the current user's. If prior runs left N accounts from other users, `currentCount` is already ≥ 5, so the loop `for (let i = currentCount; i < 5; i++)` never runs. The test then calls createHsrAccount a 6th time expecting failure — but because the current user only has 1 account (the one created in the first describe block), the backend enforces the limit per-user and succeeds. The test expected a failure, got success.
  implication: Failure #2 ("enforces maximum 5 accounts per user") is caused by the test counting cross-user accounts from subscribeToAllTables.

- timestamp: 2026-03-18T00:00:00Z
  checked: roster-accounts.test.ts line 99 — "updates label and visibility fields"
  found: `const target = [...h.conn.db.HsrAccount.iter()][0]`. This picks the FIRST account from the full in-memory cache — which, if the DB has accounts from prior test sessions, will belong to a DIFFERENT user. The test then calls updateHsrAccount with that account's id. The reducer check `account.userId !== user.id` fires because the chosen account is not owned by the current test user.
  implication: Failures #3 and #4 ("updates label and visibility" and "rejects empty display label") both use `iter()[0]` to pick a target account. If prior-user accounts sort first, both tests get "Not your account" from the reducer.

- timestamp: 2026-03-18T00:00:00Z
  checked: roster-accounts.test.ts line 134 — "activates target and deactivates others"
  found: `const accounts = [...h.conn.db.HsrAccount.iter()]`. Again the full cross-user list. `accounts.find((a) => !a.isActive)` will find ANY inactive account in the DB — likely one belonging to a prior user. The test then calls setActiveHsrAccount with that foreign account id, which triggers "Not your account". The test then checks `refreshed?.isActive` — but because the reducer threw, the account was never updated; the condition is unmet; the subsequent loop over all accounts finds some are still active from before, causing the `expect(acc.isActive).toBe(false)` assertion to fail on those foreign-user accounts.
  implication: Failures #5 and #6 ("activates target and deactivates others" and "is a no-op on already-active account") share the same iter() cross-user contamination root cause.

- timestamp: 2026-03-18T00:00:00Z
  checked: roster-accounts.test.ts line 65-73 — "auto-labels when displayLabel is empty"
  found: `const uid = nextUid()` generates uid `800000001` (counter=1 after resetUidCounter). The test creates the account and expects displayLabel to match `/^Account \d+$/`. The label is set by the reducer as `'Account ' + (existing.length + 1)` where `existing` is `ctx.db.HsrAccount.user_id.filter(user.id)`. BUT the test observes `'Char Test Account'` instead. This points to a prior account already existing for this user in the DB from a prior test run that was never cleaned up — so the counter value produced by the reducer is different OR the account found in the iter() cache is from a prior run and already has a different label. More precisely: if a prior test run already created an account with UID `800000001` for the SAME user identity (because the server token/identity persists across runs), the `createHsrAccount` reducer would attempt to insert another row; OR the test finds a pre-existing account from the prior session with label 'Char Test Account' (a seeded/test label from seed data or prior run).
  implication: The label mismatch "Char Test Account" indicates either (a) a pre-existing account in the DB has displayLabel 'Char Test Account', and iter() + find() is returning THAT row instead of the newly created one because the UID `800000001` already existed, or (b) the newly created account's label was set differently because the user already had other accounts. The literal string "Char Test Account" is suspiciously similar to seed/fixture data. Either way, the root cause is shared mutable DB state from prior test runs.

- timestamp: 2026-03-18T00:00:00Z
  checked: roster-accounts.test.ts line 182 — "deletes account and cascades character rows"
  found: `expect(deleted).toBeUndefined()`. After `deleteHsrAccount`, `h.conn.db.HsrAccount.id.find(account.id)` returns `null` instead of `undefined`. This is likely an SDK/binding type mismatch: the SpacetimeDB client SDK returns `null` for "not found" on a PK lookup, while the test expects `undefined`. This failure is independent of the ownership contamination.
  implication: Failure #7 ("deletes account and cascades") — the delete itself likely succeeded, but `find()` returns `null` not `undefined` when a row is absent. The test expectation `toBeUndefined()` is wrong; it should be `toBeNull()` or `toBeFalsy()`. This is a test-expectation mismatch against the SDK's actual behavior.

- timestamp: 2026-03-18T00:00:00Z
  checked: server.ts server_link_discord and connection.ts verifyUserViaServerConnection
  found: The test generates a new random Discord ID every run (`test_${Date.now()}_${randomString}`). Each test run creates a brand new Discord-linked user. But the SpacetimeDB IDENTITY is determined by the client's connection — and SpacetimeDB assigns a persistent identity to reconnecting clients if they reuse a token. The test does NOT pass a token on connect, so each run gets a fresh anonymous identity. This means each run creates a new User record. OLD accounts from prior users remain in the DB and pollute the iter() results.
  implication: Confirms the contamination source: the DB accumulates user + account rows from every test run. subscribeToAllTables makes all of them visible to the new test user.

- timestamp: 2026-03-18T00:00:00Z
  checked: roster.ts create_hsr_account line 25 — label auto-generation
  found: `const label = displayLabel.trim() || 'Account ' + (existing.length + 1)`. The `existing` variable is `ctx.db.HsrAccount.user_id.filter(user.id)` — this is server-side, filtered by the current user. This is correct. The label value "Char Test Account" seen in failure #1 must come from the row that `.find((a) => a.uid === uid)` returns — which could be a pre-existing row in the client-side cache that was created by a prior test run's user IF that prior user happened to create an account with the same UID and label.
  implication: Reinforces the accumulated-state hypothesis. The UID `800000001` (counter=1, padded) was already used in a prior run; the client-side cache has a match for that UID but from a prior user with a different label.

## Resolution

root_cause: |
  There are TWO distinct root causes:

  ROOT CAUSE A — Cross-user table pollution via subscribeToAllTables (affects failures #1, #2, #3, #4, #5, #6):

  The test harness calls `subscribeToAllTables()`, which causes the client-side in-memory cache
  (h.conn.db.HsrAccount.iter()) to contain ALL HsrAccount rows across ALL users in the shared
  test database. The test database (`hsrpvp-spacetimedb-nextjs-test1`) is NOT wiped between test
  runs. Each test run creates a new random user identity + new User record, but the prior runs'
  HsrAccount rows persist indefinitely.

  The test code uses `[...h.conn.db.HsrAccount.iter()][0]` or `.find(...)` to locate target
  accounts for update/delete/activate operations. Because iter() returns ALL accounts (not just
  the current user's), these selectors pick accounts belonging to prior-run users. When the test
  calls update_hsr_account, set_active_hsr_account, or delete_hsr_account with a foreign account
  ID, the reducer's ownership check `account.userId !== user.id` fires and returns "Not your
  account".

  Additionally, the 5-account limit test fails because it counts `iter().length` (global count)
  instead of per-user count. With accumulated rows from prior runs, `currentCount` is already ≥ 5
  before any accounts are created in the current run, so the fill loop is skipped and the 6th
  create succeeds (current user has ≤ 5 accounts) instead of failing.

  ROOT CAUSE B — SDK `find()` returns `null` not `undefined` for missing rows (affects failure #7):

  The test expects `toBeUndefined()` after deleting an account and calling
  `h.conn.db.HsrAccount.id.find(account.id)`. The SpacetimeDB client SDK returns `null` (not
  `undefined`) when a PK lookup finds no matching row. The delete operation itself likely
  succeeded. The test expectation is wrong for the SDK's actual return type.

fix: Not applied (research-only mode). Recommended fixes below.
verification: N/A

files_changed: []

---

## Recommended Fix Directions (for implementation phase)

### Fix A: Scope all iter() calls to the current user's accounts

In `roster-accounts.test.ts`, replace ALL `[...h.conn.db.HsrAccount.iter()]` calls with a
filtered version that only includes accounts owned by the test user:

```typescript
// Instead of:
const accounts = [...h.conn.db.HsrAccount.iter()];

// Use (filter by the current user's identity via userId):
const myAccounts = [...h.conn.db.HsrAccount.iter()].filter(
  (a) => a.userId === /* current user's userId */
);
```

The challenge is that `h` exposes `identity` (the hex string of the SpacetimeDB identity) but not
the `userId` (the numeric User.id). To filter, the test needs access to the user's numeric ID.
Options:
1. Expose userId on TestHarness (look it up via UserIdentity after login)
2. Use the btree index if exposed by bindings: `h.conn.db.HsrAccount.user_id.filter(userId)`
3. Alternatively, refactor the test DB to be wiped between runs (see Fix B)

### Fix B: Wipe or isolate the test DB between runs

The cleanest solution is to run tests against a fresh database each time:
- Use `spacetime publish --clear-database` before each test run, OR
- Add a teardown reducer (`admin_clear_test_data`) that removes accounts created by test users, OR
- Use a different database name per test run (env var)

### Fix C: Fix the `find()` undefined vs null assertion

In the delete test, change:
```typescript
expect(deleted).toBeUndefined();
// → becomes:
expect(deleted).toBeNull();  // or: toBeFalsy()
```

Note: The rule is "do NOT modify test files." This fix requires test file changes and is blocked
by that constraint. It must be handled by whoever has authority to modify tests.

---

## Failure-by-Failure Classification

| # | Test | Root Cause | Type |
|---|------|-----------|------|
| 1 | auto-labels when displayLabel is empty → got "Char Test Account" | Root Cause A: `iter().find(a => a.uid === uid)` returns a pre-existing row from a prior user with that UID and label, not the newly-created row | Test setup issue (shared DB state) |
| 2 | enforces maximum 5 accounts per user → reducer succeeded when expected to fail | Root Cause A: `iter().length` counts all users' accounts; loop condition `i < 5` never triggers fills; current user has < 5 accounts so 6th create succeeds | Test setup issue (shared DB state) |
| 3 | updates label and visibility → "Not your account" | Root Cause A: `iter()[0]` picks a foreign-user account | Test setup issue (shared DB state) |
| 4 | rejects empty display label → "Not your account" instead of "cannot be empty" | Root Cause A: `iter()[0]` picks a foreign-user account; ownership check fires before label validation | Test setup issue (shared DB state) |
| 5 | activates target and deactivates others → expected false got true | Root Cause A: `iter().find(a => !a.isActive)` picks an inactive foreign-user account; ownership check fires or the subsequent assertion iterates all accounts including foreign ones | Test setup issue (shared DB state) |
| 6 | is a no-op on already-active account → related failure | Root Cause A: same contamination as #5, cascading effect | Test setup issue (shared DB state) |
| 7 | deletes account and cascades → expected undefined got null | Root Cause B: SDK `find()` returns `null` for absent rows, test expects `undefined` | Test expectation mismatch (SDK behavior) |

**No backend reducer bugs found.** The reducer logic in `roster.ts` and `ensurePermissions.ts` is
correct. All ownership checks, label auto-generation, region derivation, cascade delete, and
isActive toggling are implemented correctly.
