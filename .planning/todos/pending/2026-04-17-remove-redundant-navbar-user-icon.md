---
created: 2026-04-17T00:18:45.370Z
title: Remove redundant NavBar user icon
area: frontend
files:
  - components/globals/layout/NavBar.tsx
---

## Problem

NavBar renders a user icon next to the gear/settings wheel when the user is authenticated. Clicking the user's display name already navigates to the profile page, so the icon is visually redundant — it adds clutter without a distinct function. Noticed during Phase 15.5 UAT (Scenario 2 — returning-user reconnect) when the icon "appeared out of nowhere" as `currentUser` resolved. The abrupt appearance further reinforces that the icon is unnecessary.

## Solution

Remove the user icon element from the authenticated block in `NavBar.tsx`. Keep:
- Display name (clickable → profile)
- Gear/settings wheel
- Admin/mod affordances (if role-gated)
- Logout button

Verify after removal:
- Clicking the display name still navigates to the profile page
- Role-gated admin/mod UI still renders correctly
- The gear wheel's click target isn't affected
- No CSS gaps or layout shift introduced
- Unused imports (icon component, icon CSS class) removed

Scope: single file, `components/globals/layout/NavBar.tsx`. Optional companion: delete the now-unused icon asset if no other component references it.
