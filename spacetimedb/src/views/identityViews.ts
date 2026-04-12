// ─── Identity Views ───────────────────────────────────────────────────────────
// Views exposing user identity / profile data plus public roster account rows.
//
// 1. view_my_identity         — per-user, own UserIdentity mapping
// 2. view_my_profile          — per-user, User + UserPrivate merge (D-04)
// 3. view_user_directory      — anonymous, safe subset of all users
// 4. view_public_accounts     — anonymous, HsrAccount rows where isRosterPublic=true (D-22)
// 5. view_admin_user_private  — admin/mod view, full UserPrivate rows (D-05)

import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { UserIdentity } from '../tables/userIdentity';
import { UserPrivate } from '../tables/userPrivate';
import { isRoleAtLeast } from '../helpers/ensurePermissions';
import { Role } from '../types/enums';

// ---------------------------------------------------------------------------
// 1. My Identity (per-user view) — only the caller's own identity mapping(s)
//    Uses ctx.sender directly on the PK (identity column).
// ---------------------------------------------------------------------------
// Phase 15 D-01/D-02: moved from securityViews.ts
export const view_my_identity = spacetimedb.view(
    { name: 'view_my_identity', public: true },
    t.option(UserIdentity.rowType),
    (ctx) => {
        return ctx.db.UserIdentity.identity.find(ctx.sender) ?? undefined;
    }
);

// ---------------------------------------------------------------------------
// 2. Public User Directory (anonymous view) — safe subset for all clients.
//    Returns ONLY the D-16 field list: no auth IDs, no audit columns, no
//    sensitive timestamps. (D-16)
// ---------------------------------------------------------------------------
const UserDirectoryRow = t.object('UserDirectoryRow', {
    id: t.u32(),
    username: t.string(),
    displayName: t.string(),
    role: Role,
    avatarCharacterName: t.string(),
    isOnline: t.bool(),
    isGuest: t.bool(),
    hasDiscordLinked: t.bool(),
    displayedAchievementId: t.u32().optional(),
});

// Phase 15 D-01/D-02: moved from securityViews.ts
export const view_user_directory = spacetimedb.anonymousView(
    { name: 'view_user_directory', public: true },
    t.array(UserDirectoryRow),
    (ctx) => {
        return [...ctx.db.User.iter()]
            .filter(u => !u.deletedAt)
            .map(u => ({
                id: u.id,
                username: u.username,
                displayName: u.displayName,
                role: u.role,
                avatarCharacterName: u.avatarCharacterName,
                isOnline: u.isOnline,
                isGuest: u.isGuest,
                hasDiscordLinked: u.hasDiscordLinked,
                displayedAchievementId: u.displayedAchievementId,
            }));
    }
);

// ---------------------------------------------------------------------------
// 3. My Profile (per-user view) -- merged User + UserPrivate for the requesting
//    user. Returns full User fields plus private auth fields (discordId,
//    discordUsername, email) so the caller sees their own data in a single
//    subscription. (D-04)
// ---------------------------------------------------------------------------
const MyProfileRow = t.object('MyProfileRow', {
    // User fields
    id: t.u32(),
    username: t.string(),
    displayName: t.string(),
    isGuest: t.bool(),
    isOnline: t.bool(),
    isPrivate: t.bool(),
    lastLoginAt: t.timestamp(),
    role: Role,
    hasDiscordLinked: t.bool(),
    avatarCharacterName: t.string(),
    displayedAchievementId: t.u32().optional(),
    deletedAt: t.timestamp().optional(),
    // UserPrivate fields (only visible to the user themselves)
    discordId: t.string().optional(),
    discordUsername: t.string().optional(),
    email: t.string().optional(),
    // Audit from User
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
});

// Phase 15 D-01/D-02: moved from securityViews.ts
export const view_my_profile = spacetimedb.view(
    { name: 'view_my_profile', public: true },
    t.option(MyProfileRow),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return undefined;
        const user = ctx.db.User.id.find(mapping.userId);
        if (!user) return undefined;

        // Merge UserPrivate fields if they exist
        const priv = ctx.db.UserPrivate.userId.find(mapping.userId);

        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            isGuest: user.isGuest,
            isOnline: user.isOnline,
            isPrivate: user.isPrivate,
            lastLoginAt: user.lastLoginAt,
            role: user.role,
            hasDiscordLinked: user.hasDiscordLinked,
            avatarCharacterName: user.avatarCharacterName,
            displayedAchievementId: user.displayedAchievementId,
            deletedAt: user.deletedAt,
            discordId: priv?.discordId,
            discordUsername: priv?.discordUsername,
            email: priv?.email,
            createdById: user.createdById,
            createdDate: user.createdDate,
            lastModifiedById: user.lastModifiedById,
            lastModifiedDate: user.lastModifiedDate,
        };
    }
);

// ---------------------------------------------------------------------------
// 4. view_public_accounts — Anonymous view returning all HsrAccount rows where
//    isRosterPublic=true. For profile browsing. Characters included, rating
//    included if isRatingPublic=true. Replaces raw HsrAccount subscription (D-20,
//    D-22). Flat rows (one per character); accounts with no characters emit a
//    single row with characterName/eidolonLevel = undefined.
// ---------------------------------------------------------------------------
const PublicAccountRow = t.object('PublicAccountRow', {
    accountId: t.u32(),
    userId: t.u32(),
    uid: t.string(),
    region: t.string(),
    displayLabel: t.string(),
    accountRating: t.u32().optional(),
    characterName: t.string().optional(),
    eidolonLevel: t.u8().optional(),
});

// Phase 15 D-01/D-02: moved from anonymousViews.ts
export const view_public_accounts = spacetimedb.anonymousView(
    { name: 'view_public_accounts', public: true },
    t.array(PublicAccountRow),
    (ctx) => {
        const results: any[] = [];

        // HsrAccount has no isRosterPublic index — iter() acceptable at ~300 rows
        for (const account of ctx.db.HsrAccount.iter()) {
            if (!account.isRosterPublic) continue;

            const showRating = account.isRatingPublic;

            const characters = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(account.id)];
            if (characters.length === 0) {
                results.push({
                    accountId: account.id,
                    userId: account.userId,
                    uid: account.uid,
                    region: account.region,
                    displayLabel: account.displayLabel,
                    accountRating: showRating ? account.accountRating : undefined,
                    characterName: undefined,
                    eidolonLevel: undefined,
                });
            } else {
                for (const char of characters) {
                    results.push({
                        accountId: account.id,
                        userId: account.userId,
                        uid: account.uid,
                        region: account.region,
                        displayLabel: account.displayLabel,
                        accountRating: showRating ? account.accountRating : undefined,
                        characterName: char.characterName,
                        eidolonLevel: char.eidolonLevel,
                    });
                }
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 5. Admin User Private (admin/mod view) -- returns all UserPrivate rows
//    when caller has role >= Moderator (level 75). Enables admins and
//    moderators to look up discordUsername for moderation. (D-05)
// ---------------------------------------------------------------------------
// Phase 15 D-01/D-02: moved from securityViews.ts
export const view_admin_user_private = spacetimedb.view(
    { name: 'view_admin_user_private', public: true },
    t.array(UserPrivate.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const user = ctx.db.User.id.find(mapping.userId);
        if (!user) return [];
        if (!isRoleAtLeast(user.role, 'Moderator')) return [];
        // iter() acceptable: admin-only view, bounded by number of verified users
        return [...ctx.db.UserPrivate.iter()];
    }
);
