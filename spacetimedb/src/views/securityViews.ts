import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { User } from '../tables/user';
import { UserIdentity } from '../tables/userIdentity';
import { Lobby } from '../tables/lobby';

// ---------------------------------------------------------------------------
// 1. Lobby Browser (anonymous view) — all public lobbies, no passwordHash
//    Since passwordHash is now in a separate private table (LobbyPassword),
//    the full Lobby rowType is safe to broadcast.
// ---------------------------------------------------------------------------
spacetimedb.anonymousView(
    { name: 'view_lobby_browser', public: true },
    t.array(Lobby.rowType),
    (ctx) => ctx.from.Lobby
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
