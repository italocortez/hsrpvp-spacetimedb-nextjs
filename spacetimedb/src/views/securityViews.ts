import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { User } from '../tables/user';
import { UserIdentity } from '../tables/userIdentity';
import { Lobby } from '../tables/lobby';
import { CostSet } from '../tables/costSet';
import { Tournament } from '../tables/tournament';
import { GameMode, DraftMode, MatchType, LobbyStage } from '../types/enums';
import { CostSetDraftCharacter } from '../tables/costSetDraftCharacter';
import { CostSetDraftLightcone } from '../tables/costSetDraftLightcone';
import { CostSetDraftSynergy } from '../tables/costSetDraftSynergy';
import { PlayerStat } from '../tables/playerStats';
import { PlayerCharacterStat } from '../tables/characterStats';
import { PlayerRelationship } from '../tables/playerRelationship';
import { LobbyMember } from '../tables/lobbyMember';
import { HsrAccount } from '../tables/hsrAccount';
import { HsrAccountCharacter } from '../tables/hsrAccountCharacter';

// ---------------------------------------------------------------------------
// 1. Lobby Browser (anonymous view) — projected subset of lobby columns
//    D-05: Excludes config details (timers, budgets, penalties, disconnect, audit).
//    D-06: Tournament name and cost set name resolved via PK lookup server-side.
//    D-08: Finished lobbies excluded — only Waiting, Drafting, Equipping, Scoring shown.
// ---------------------------------------------------------------------------
const LobbyBrowserRow = t.object('LobbyBrowserRow', {
    id: t.u32(),
    joinCode: t.string(),
    gameMode: GameMode,
    draftMode: DraftMode,
    matchType: MatchType,
    currentPlayerCount: t.u8(),
    isTournamentControlled: t.bool(),
    isAnonymousPlayers: t.bool(),
    stage: LobbyStage,
    isPublic: t.bool(),
    teamSize: t.u8(),
    tournamentName: t.string().optional(),
    costSetName: t.string().optional(),
});

spacetimedb.anonymousView(
    { name: 'view_lobby_browser', public: true },
    t.array(LobbyBrowserRow),
    (ctx) => {
        const lobbies: any[] = [];

        // D-08: Only Waiting, Drafting, Equipping, Scoring — exclude Finished.
        // Use the stage btree index to avoid scanning Finished lobbies.
        const activeStages: any[] = [
            { tag: 'Waiting', value: {} },
            { tag: 'Drafting', value: {} },
            { tag: 'Equipping', value: {} },
            { tag: 'Scoring', value: {} },
        ];
        const activeLobbyRows: any[] = [];
        for (const stageVal of activeStages) {
            for (const lobby of ctx.db.Lobby.stage.filter(stageVal)) {
                activeLobbyRows.push(lobby);
            }
        }

        for (const lobby of activeLobbyRows) {

            // D-06: Resolve tournament name via PK lookup
            let tournamentName: string | undefined;
            if (lobby.tournamentId) {
                const tournament = ctx.db.Tournament.id.find(lobby.tournamentId);
                if (tournament) tournamentName = tournament.name;
            }

            // D-06: Resolve cost set name via PK lookup (costSetId=0 = default, no name)
            let costSetName: string | undefined;
            if (lobby.costSetId > 0) {
                const costSet = ctx.db.CostSet.id.find(lobby.costSetId);
                if (costSet) costSetName = costSet.name;
            }

            lobbies.push({
                id: lobby.id,
                joinCode: lobby.joinCode,
                gameMode: lobby.gameMode,
                draftMode: lobby.draftMode,
                matchType: lobby.matchType,
                currentPlayerCount: lobby.currentPlayerCount,
                isTournamentControlled: lobby.isTournamentControlled,
                isAnonymousPlayers: lobby.isAnonymousPlayers,
                stage: lobby.stage,
                isPublic: lobby.isPublic,
                teamSize: lobby.teamSize,
                tournamentName,
                costSetName,
            });
        }
        return lobbies;
    }
);

// ---------------------------------------------------------------------------
// 2. My Lobbies (per-user view) — lobbies where the caller is a member
//    Resolves ctx.sender → userId via UserIdentity, then looks up LobbyMember
//    rows by userId index, then fetches each Lobby by PK.
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_lobbies', public: true },
    t.array(Lobby.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];

        // Look up lobby memberships via btree index on userId
        const memberships = [...ctx.db.LobbyMember.user_id.filter(mapping.userId)];

        // Fetch each lobby by PK (users are in at most 1-2 lobbies)
        const lobbies = [];
        for (const membership of memberships) {
            const lobby = ctx.db.Lobby.id.find(membership.lobbyId);
            if (lobby) {
                lobbies.push(lobby);
            }
        }
        return lobbies;
    }
);

// ---------------------------------------------------------------------------
// 3. My Identity (per-user view) — only the caller's own identity mapping(s)
//    Uses ctx.sender directly on the PK (identity column).
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_identity', public: true },
    t.option(UserIdentity.rowType),
    (ctx) => {
        return ctx.db.UserIdentity.identity.find(ctx.sender) ?? undefined;
    }
);

// ---------------------------------------------------------------------------
// 4. Public User Directory (anonymous view) — safe subset for all clients
//    Returns full User rows. Sensitive fields (discordId, deletedAt, isGuest,
//    role, isPrivate) are included in the rowType but this is the stepping
//    stone — the table stays public for now. When the frontend migrates to
//    subscribe to this view instead, the User table can be made private.
// ---------------------------------------------------------------------------
spacetimedb.anonymousView(
    { name: 'view_user_directory', public: true },
    t.array(User.rowType),
    (ctx) => ctx.from.User
);

// ---------------------------------------------------------------------------
// 5. My Profile (per-user view) — full User row for the requesting user
//    Resolves ctx.sender → userId, then returns the single User row.
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_profile', public: true },
    t.option(User.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return undefined;
        return ctx.db.User.id.find(mapping.userId) ?? undefined;
    }
);

// ---------------------------------------------------------------------------
// 6. My Cost Sets (per-user view) — CostSet rows owned by the requesting user
//    Used by TOs to manage their own cost sets in the draft/publish workflow.
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_cost_sets', public: true },
    t.array(CostSet.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const user = ctx.db.User.id.find(mapping.userId);
        if (!user) return [];
        return [...ctx.db.CostSet.creator_id.filter(user.id)];
    }
);

// ---------------------------------------------------------------------------
// 7. My Draft Character Costs (per-user view) — CostSetDraftCharacter rows
//    for all cost sets owned by the requesting user. Draft tables are private
//    (not broadcast to clients), so this view is the only way to read them.
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_draft_character_costs', public: true },
    t.array(CostSetDraftCharacter.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const user = ctx.db.User.id.find(mapping.userId);
        if (!user) return [];
        // Collect all cost set ids owned by this user, then use cost_set_id index on each
        const mySets = [...ctx.db.CostSet.creator_id.filter(user.id)];
        const results: any[] = [];
        for (const set of mySets) {
            for (const row of ctx.db.CostSetDraftCharacter.cost_set_id.filter(set.id)) {
                results.push(row);
            }
        }
        return results;
    }
);

// ---------------------------------------------------------------------------
// 8. My Draft Lightcone Costs (per-user view) — CostSetDraftLightcone rows
//    for all cost sets owned by the requesting user.
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_draft_lightcone_costs', public: true },
    t.array(CostSetDraftLightcone.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const user = ctx.db.User.id.find(mapping.userId);
        if (!user) return [];
        const mySets = [...ctx.db.CostSet.creator_id.filter(user.id)];
        const results: any[] = [];
        for (const set of mySets) {
            for (const row of ctx.db.CostSetDraftLightcone.cost_set_id.filter(set.id)) {
                results.push(row);
            }
        }
        return results;
    }
);

// ---------------------------------------------------------------------------
// 9. My Draft Synergy Costs (per-user view) — CostSetDraftSynergy rows
//    for all cost sets owned by the requesting user.
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_draft_synergy_costs', public: true },
    t.array(CostSetDraftSynergy.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const user = ctx.db.User.id.find(mapping.userId);
        if (!user) return [];
        const mySets = [...ctx.db.CostSet.creator_id.filter(user.id)];
        const results: any[] = [];
        for (const set of mySets) {
            for (const row of ctx.db.CostSetDraftSynergy.cost_set_id.filter(set.id)) {
                results.push(row);
            }
        }
        return results;
    }
);

// ---------------------------------------------------------------------------
// 10. My Player Stats (per-user view) — returns caller's own PlayerStat rows.
//     PlayerStat is private (public: false), so this view is the only way
//     for clients to access their own stats. (D-33)
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_player_stats', public: true },
    t.array(PlayerStat.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        return [...ctx.db.PlayerStat.by_user.filter(mapping.userId)];
    }
);

// ---------------------------------------------------------------------------
// 11. My Character Stats (per-user view) — returns caller's own
//     PlayerCharacterStat rows. Private table accessible via this view. (D-33)
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_character_stats', public: true },
    t.array(PlayerCharacterStat.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        return [...ctx.db.PlayerCharacterStat.by_user.filter(mapping.userId)];
    }
);

// ---------------------------------------------------------------------------
// 12. My Relationships (per-user view) — returns caller's own
//     PlayerRelationship rows. Private table accessible via this view. (D-33)
// ---------------------------------------------------------------------------
spacetimedb.view(
    { name: 'view_my_relationships', public: true },
    t.array(PlayerRelationship.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        return [...ctx.db.PlayerRelationship.by_user.filter(mapping.userId)];
    }
);

// ---------------------------------------------------------------------------
// 13. My Roster Visibility (per-user view) — returns HsrAccountCharacter rows
//     the calling user is allowed to see, based on their lobby memberships and
//     each lobby's rosterVisibility setting (D-10 through D-16, ANON-04).
//
//     Visibility rules:
//     - Referee: sees all rosters regardless of setting (D-14)
//     - Self + own team: always see full roster and rating
//     - OpenRoster: all rosters visible (D-11)
//     - ClosedWithRating: opponent roster hidden, rating visible (D-12)
//     - ClosedNoRating: opponent roster AND rating hidden (D-13)
//     - Spectators follow same rules as opponents (D-16)
// ---------------------------------------------------------------------------
const RosterVisibilityRow = t.object('RosterVisibilityRow', {
    lobbyId: t.u32(),
    memberUserId: t.u32(),
    hsrAccountId: t.u32(),
    characterName: t.string(),
    eidolonLevel: t.u8(),
    accountRating: t.u32().optional(),
});

spacetimedb.view(
    { name: 'view_my_roster_visibility', public: true },
    t.array(RosterVisibilityRow),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const myUserId = mapping.userId;

        // Get all lobbies the user is a member of
        const myMemberships = [...ctx.db.LobbyMember.user_id.filter(myUserId)];
        const results: any[] = [];

        for (const myMembership of myMemberships) {
            const lobby = ctx.db.Lobby.id.find(myMembership.lobbyId);
            if (!lobby) continue;

            const allMembers = [...ctx.db.LobbyMember.lobby_id.filter(lobby.id)];
            const myTeam = myMembership.teamSlot.tag;
            const isReferee = myMembership.isReferee;

            for (const member of allMembers) {
                const isOwnTeam = member.teamSlot.tag === myTeam;
                const isSelf = member.userId === myUserId;

                // Determine if we can see this member's roster
                let canSeeRoster = false;
                let canSeeRating = false;

                if (isReferee) {
                    // D-14: Referee sees all rosters regardless of setting
                    canSeeRoster = true;
                    canSeeRating = true;
                } else if (isSelf || isOwnTeam) {
                    // Own + allies' rosters always visible
                    canSeeRoster = true;
                    canSeeRating = true;
                } else {
                    // Opponent visibility depends on rosterVisibility setting
                    const vis = lobby.rosterVisibility.tag;
                    if (vis === 'OpenRoster') {
                        // D-11: All rosters visible
                        canSeeRoster = true;
                        canSeeRating = true;
                    } else if (vis === 'ClosedWithRating') {
                        // D-12: Opponent roster hidden, rating visible
                        canSeeRoster = false;
                        canSeeRating = true;
                    } else {
                        // ClosedNoRating (D-13): Opponent roster AND rating hidden
                        canSeeRoster = false;
                        canSeeRating = false;
                    }
                }

                if (!canSeeRoster && !canSeeRating) continue;

                // Get member's HSR accounts
                const memberAccounts = [...ctx.db.HsrAccount.user_id.filter(member.userId)];

                for (const account of memberAccounts) {
                    if (canSeeRoster) {
                        // Return full character roster
                        const characters = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(account.id)];
                        for (const char of characters) {
                            results.push({
                                lobbyId: lobby.id,
                                memberUserId: member.userId,
                                hsrAccountId: account.id,
                                characterName: char.characterName,
                                eidolonLevel: char.eidolonLevel,
                                accountRating: canSeeRating ? account.accountRating : undefined,
                            });
                        }
                    } else if (canSeeRating) {
                        // ClosedWithRating: no characters but include a sentinel row with rating
                        results.push({
                            lobbyId: lobby.id,
                            memberUserId: member.userId,
                            hsrAccountId: account.id,
                            characterName: '',  // Sentinel: no roster data, rating only
                            eidolonLevel: 0,
                            accountRating: account.accountRating,
                        });
                    }
                }
            }
        }

        return results;
    }
);
