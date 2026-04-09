# Views -- Architecture

Last updated: 2026-04-09

## Overview

Views are server-side read reducers that return filtered data to authenticated or anonymous callers. They enforce access control (visibility rules, anonymous play masking, private table access) that cannot be expressed via raw table subscriptions. All views in this project are defined in `spacetimedb/src/views/securityViews.ts` and `spacetimedb/src/views/anonymousViews.ts`. Authenticated views use `spacetimedb.view()` and require a connected identity; anonymous views use `spacetimedb.anonymousView()` and are callable without authentication. The anonymous play enforcement pattern (D-92) applies in views 10-20: real `userId` values are replaced with `0` and `anonymousLabel` is used when the lobby has `isAnonymousPlayers=true` or `isAnonymousSpectators=true`.

## View Definitions

### Security Views (securityViews.ts)

#### view_my_profile
- **Auth:** Authenticated (`getAuthenticatedUser`)
- **Returns:** `User` row for the caller
- **Purpose:** Caller reads their own profile (role, username, display name)

#### view_my_identity
- **Auth:** Authenticated
- **Returns:** `UserIdentity[]` rows for the caller
- **Purpose:** Caller reads their linked provider identities (Discord, guest)

#### view_admin_user_private
- **Auth:** Admin only (`ensureAdmin`)
- **Returns:** `UserPrivate` row for a target userId
- **Purpose:** Admin access to private user data (email, provider tokens)

#### view_user_directory
- **Auth:** Authenticated
- **Returns:** `User[]` filtered by search query (username prefix)
- **Purpose:** User search for invites, team requests, etc.

#### view_my_roster
- **Auth:** Authenticated
- **Returns:** `{ accounts: HsrAccount[], characters: HsrAccountCharacter[] }` for the caller
- **Purpose:** Caller manages their own private roster

#### view_public_accounts
- **Auth:** Anonymous (`anonymousView`)
- **Returns:** `HsrAccount[]` where `isRosterPublic=true` for a target userId
- **Purpose:** Public profile browsing

#### view_tournament_registrant_accounts
- **Auth:** Authenticated; TO/Assistant/Mod+ for the tournament
- **Returns:** `TournamentPlayerAccount[]` + associated `HsrAccount` rows for a tournament
- **Purpose:** Tournament organizer views locked player account selections

#### view_my_roster_visibility
- **Auth:** Authenticated
- **Returns:** Opponent/ally `HsrAccount[]` + `HsrAccountCharacter[]` based on visibility rules
- **Visibility logic:**
  - Admin: always sees all
  - TO: sees participant rosters for their active tournament
  - Lobby member: sees co-members' rosters if `Lobby.isOpenRoster=true` or `isRosterPublic=true`
  - Everyone else: only `isRosterPublic=true` accounts
- **Purpose:** Draft preparation -- see which characters opponents own

#### view_my_cost_sets
- **Auth:** Authenticated
- **Returns:** `CostSet[]` owned by the caller (via `creator_id` index)
- **Purpose:** Tournament host manages their draft cost configurations

#### view_my_draft_character_costs
- **Auth:** Authenticated
- **Returns:** `CostSetDraftCharacter[]` for all cost sets owned by the caller
- **Purpose:** Edit character costs in draft cost sets

#### view_my_draft_lightcone_costs
- **Auth:** Authenticated
- **Returns:** `CostSetDraftLightcone[]` for all cost sets owned by the caller
- **Purpose:** Edit lightcone costs in draft cost sets

#### view_my_draft_synergy_costs
- **Auth:** Authenticated
- **Returns:** `CostSetDraftSynergy[]` for all cost sets owned by the caller
- **Purpose:** Edit synergy cost modifiers in draft cost sets

### Anonymous Views (anonymousViews.ts)

Views 10-20 apply anonymous enforcement (D-92): when `lobby.isAnonymousPlayers=true` or `isAnonymousSpectators=true`, the `userId` field is replaced with `0` and `anonymousLabel` is used.

#### view_my_lobby_chat
- **Auth:** LobbyMember for the caller
- **Returns:** `ChatMessage[]` for a lobby, with anonymous masking applied
- **Purpose:** Chat display -- hides real sender identity when lobby is anonymous

#### view_my_lobby_members
- **Auth:** LobbyMember for the caller
- **Returns:** `LobbyMember[]` for a lobby, with anonymous masking applied
- **Purpose:** Show who is in the lobby without revealing identities in anonymous mode

#### view_my_match_steps
- **Auth:** LobbyMember for the caller
- **Returns:** `MatchSessionStep[]` for a lobby, with `actorUserId` masked to `0` when anonymous
- **Purpose:** Real-time draft action feed with anonymous enforcement

#### view_my_match_participants
- **Auth:** LobbyMember for the caller
- **Returns:** `MatchResultParticipant[]` for the current match, with userId masked when anonymous
- **Purpose:** Show participant list during scoring without revealing identities

#### view_match_history
- **Auth:** Authenticated
- **Returns:** `MatchResultRecord[]` for a target userId (their match history)
- **Purpose:** Player profile match history display

#### view_match_participant_history
- **Auth:** Authenticated
- **Returns:** `MatchParticipantHistory[]` for a target matchResultId
- **Purpose:** View detailed participant data for a historical match

#### view_match_step_history
- **Auth:** Authenticated
- **Returns:** `MatchSessionStepHistory[]` for a target matchResultId
- **Purpose:** Replay draft actions for a historical match

#### view_my_calendar_events
- **Auth:** Authenticated
- **Returns:** `CalendarEvent[]` organized by the caller + `CalendarEventInvite[]` where caller is invitee
- **Purpose:** Caller's full calendar view

#### view_saved_calendar_slots
- **Auth:** Authenticated
- **Returns:** `AvailabilitySlot[]` for all users the caller has saved in `SavedCalendar` (where `isVisible=true`)
- **Purpose:** Common availability computation across saved calendars

#### view_admin_ban_records
- **Auth:** Admin only
- **Returns:** `BanRecord[]` -- all active bans
- **Purpose:** Admin ban management

#### view_admin_lobby_bans
- **Auth:** Admin only (or lobby host)
- **Returns:** `LobbyBan[]` for a specific lobbyId
- **Purpose:** View and manage per-lobby bans

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Views use spacetimedb.view() for authenticated and spacetimedb.anonymousView() for unauthenticated callers | Phase 09 CONTEXT.md | 2026-03-28 |
| Anonymous enforcement in views (D-92): userId replaced with 0, anonymousLabel used when lobby is anonymous | Phase 09 CONTEXT.md | 2026-03-28 |
| HsrAccount and HsrAccountCharacter made private -- view_my_roster and view_public_accounts are the only client access paths (D-20) | Phase 10.4 execution | 2026-03-29 |
| view_my_roster_visibility: four-tier visibility (admin / TO / lobby member / public) | Phase 06 execution | 2026-02-28 |
| Cost set draft views (view_my_draft_*): resolve creatorId via iter() -- no cross-table index | Phase 03 execution | 2026-02-15 |
| view_match_history, view_match_participant_history, view_match_step_history: anonymous-safe historical access | Phase 09 execution | 2026-03-28 |
| view_my_calendar_events: combines organizer events + invitee events in one call | Phase 08 execution | 2026-03-28 |
| view_saved_calendar_slots: filters by isVisible=true on SavedCalendar | Phase 08 execution | 2026-03-28 |
| Normalized to standard template | Phase 13 normalization | 2026-04-09 |

---

*Last updated: 2026-04-09*
*Feature owner: Phase 03 / Phase 06 / Phase 08 / Phase 09 / Phase 10.4*

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
