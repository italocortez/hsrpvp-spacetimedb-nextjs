import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { ensureAdmin } from '../helpers/ensurePermissions';
import { Path, Element, CharRole, GameMode, Role } from '../types/enums';
import { hsrCharacterColumns } from '../tables/hsrCharacter';
import { hsrLightconeColumns } from '../tables/hsrLightcone';
import { hsrCharacterCostColumns } from '../tables/hsrCharacterCost';
import { hsrLightconeCostColumns } from '../tables/hsrLightconeCost';
import { hsrSynergyCostUpsertKeys } from '../tables/hsrSynergyCost';

// ─── Strict enum validator ───────────────────────────────────────────────────
// Enum values must match exactly (case-sensitive). No coercion.

const ENUM_VARIANTS: Record<string, string[]> = {
    path: Object.keys(Path.variants),
    element: Object.keys(Element.variants),
    role: Object.keys(CharRole.variants),
    gameMode: Object.keys(GameMode.variants),
    userRole: Object.keys(Role.variants),
};

function validateEnum(field: string, value: string, ctx: any, tableName: string): void {
    const variants = ENUM_VARIANTS[field];
    if (!variants) return;
    if (!variants.includes(value)) {
        const errorMsg = `Invalid ${field}: "${value}". Must be exactly one of: ${variants.join(', ')}`;
        console.error(`[ADMIN] Bulk upsert REJECTED for table "${tableName}" by ${ctx.sender.toHexString()}: ${errorMsg}`);
        throw new SenderError(errorMsg);
    }
}

// ─── Strict key validator ────────────────────────────────────────────────────
// Every row must have exactly the expected keys — no more, no less.

const EXPECTED_KEYS: Record<string, string[]> = {
    HsrCharacter: Object.keys(hsrCharacterColumns),
    HsrLightcone: Object.keys(hsrLightconeColumns),
    HsrCharacterCost: Object.keys(hsrCharacterCostColumns),
    HsrLightconeCost: Object.keys(hsrLightconeCostColumns),
    HsrSynergyCost: hsrSynergyCostUpsertKeys,
};

function validateKeys(rows: any[], tableName: string, ctx: any): void {
    const expected = EXPECTED_KEYS[tableName];
    if (!expected) return;
    const expectedSet = new Set(expected);
    const expectedSorted = [...expected].sort().join(',');

    for (let i = 0; i < rows.length; i++) {
        const actualKeys = Object.keys(rows[i]).sort();
        if (actualKeys.join(',') !== expectedSorted) {
            const actualSet = new Set(actualKeys);
            const missing = expected.filter(k => !actualSet.has(k));
            const extra = actualKeys.filter(k => !expectedSet.has(k));
            const parts: string[] = [];
            if (missing.length) parts.push(`missing: [${missing.join(', ')}]`);
            if (extra.length) parts.push(`unexpected: [${extra.join(', ')}]`);
            const errorMsg = `Row ${i} key mismatch: ${parts.join(', ')}. Expected exactly: [${expected.join(', ')}]`;
            console.error(`[ADMIN] Bulk upsert REJECTED for table "${tableName}" by ${ctx.sender.toHexString()}: ${errorMsg}`);
            throw new SenderError(errorMsg);
        }
    }
}

// ─── Generic row delete (works for any public table) ─────────────────────────

export const admin_delete_row = spacetimedb.reducer(
    { tableName: t.string(), primaryKeyJson: t.string() },
    (ctx, { tableName, primaryKeyJson }) => {
        ensureAdmin(ctx);

        switch (tableName) {
            case 'User': {
                const id = Number(primaryKeyJson);
                if (!ctx.db.User.id.find(id)) throw new SenderError('Row not found');

                // Block deletion if user is hosting an active lobby
                for (const lobby of ctx.db.Lobby.iter()) {
                    if (lobby.hostUserId === id) {
                        throw new SenderError(
                            `Cannot delete user #${id}: they are hosting lobby "${lobby.joinCode}". Remove the lobby first.`
                        );
                    }
                }

                // Block deletion if user is a member of an active lobby
                for (const member of ctx.db.LobbyMember.iter()) {
                    if (member.userId === id) {
                        throw new SenderError(
                            `Cannot delete user #${id}: they are in active lobby #${member.lobbyId}. Remove them from the lobby first.`
                        );
                    }
                }

                // Block deletion if user is in an active match step
                for (const step of ctx.db.MatchSessionStep.iter()) {
                    if (step.actorUserId === id) {
                        throw new SenderError(
                            `Cannot delete user #${id}: they have actions in active match (lobby #${step.lobbyId}). End the match first.`
                        );
                    }
                }

                // Cascade: delete all UserIdentity rows for this user
                const identitiesToDelete = [];
                for (const ui of ctx.db.UserIdentity.iter()) {
                    if (ui.userId === id) {
                        identitiesToDelete.push(ui.identity);
                    }
                }
                for (const identity of identitiesToDelete) {
                    ctx.db.UserIdentity.identity.delete(identity);
                }

                // Safe to delete the user (history tables are preserved)
                ctx.db.User.id.delete(id);
                break;
            }
            case 'UserIdentity': {
                // Identity PKs are hex strings — find via iter
                let found = false;
                for (const row of ctx.db.UserIdentity.iter()) {
                    if (row.identity.toHexString() === primaryKeyJson) {
                        ctx.db.UserIdentity.identity.delete(row.identity);
                        found = true;
                        break;
                    }
                }
                if (!found) throw new SenderError('Row not found');
                break;
            }
            case 'HsrCharacter': {
                if (!ctx.db.HsrCharacter.name.find(primaryKeyJson)) throw new SenderError('Row not found');
                ctx.db.HsrCharacter.name.delete(primaryKeyJson);
                break;
            }
            case 'HsrLightcone': {
                if (!ctx.db.HsrLightcone.name.find(primaryKeyJson)) throw new SenderError('Row not found');
                ctx.db.HsrLightcone.name.delete(primaryKeyJson);
                break;
            }
            case 'HsrCharacterCost': {
                const key = JSON.parse(primaryKeyJson);
                let found = false;
                for (const row of ctx.db.HsrCharacterCost.iter()) {
                    if (row.characterName === key.characterName && row.gameMode.tag === key.gameModeTag) {
                        ctx.db.HsrCharacterCost.delete(row);
                        found = true;
                        break;
                    }
                }
                if (!found) throw new SenderError('Row not found');
                break;
            }
            case 'HsrLightconeCost': {
                if (!ctx.db.HsrLightconeCost.lightconeName.find(primaryKeyJson)) throw new SenderError('Row not found');
                ctx.db.HsrLightconeCost.lightconeName.delete(primaryKeyJson);
                break;
            }
            case 'HsrSynergyCost': {
                const id = Number(primaryKeyJson);
                if (!ctx.db.HsrSynergyCost.id.find(id)) throw new SenderError('Row not found');
                ctx.db.HsrSynergyCost.id.delete(id);
                break;
            }
            case 'Lobby': {
                const id = Number(primaryKeyJson);
                if (!ctx.db.Lobby.id.find(id)) throw new SenderError('Row not found');
                ctx.db.Lobby.id.delete(id);
                break;
            }
            case 'LobbyMember': {
                const key = JSON.parse(primaryKeyJson);
                let found = false;
                for (const row of ctx.db.LobbyMember.iter()) {
                    if (row.lobbyId === key.lobbyId && row.userId === key.userId) {
                        ctx.db.LobbyMember.delete(row);
                        found = true;
                        break;
                    }
                }
                if (!found) throw new SenderError('Row not found');
                break;
            }
            case 'MatchSession': {
                const id = Number(primaryKeyJson);
                if (!ctx.db.MatchSession.lobbyId.find(id)) throw new SenderError('Row not found');
                ctx.db.MatchSession.lobbyId.delete(id);
                break;
            }
            case 'MatchSessionStep': {
                const id = Number(primaryKeyJson);
                if (!ctx.db.MatchSessionStep.id.find(id)) throw new SenderError('Row not found');
                ctx.db.MatchSessionStep.id.delete(id);
                break;
            }
            case 'MatchSessionHistory': {
                if (!ctx.db.MatchSessionHistory.id.find(primaryKeyJson)) throw new SenderError('Row not found');
                ctx.db.MatchSessionHistory.id.delete(primaryKeyJson);
                break;
            }
            case 'MatchSessionStepHistory': {
                if (!ctx.db.MatchSessionStepHistory.matchId.find(primaryKeyJson)) throw new SenderError('Row not found');
                ctx.db.MatchSessionStepHistory.matchId.delete(primaryKeyJson);
                break;
            }
            default:
                throw new SenderError(`Unknown table: ${tableName}`);
        }
    }
);

// ─── Bulk upsert for game data tables ────────────────────────────────────────

export const admin_bulk_upsert = spacetimedb.reducer(
    { tableName: t.string(), jsonData: t.string() },
    (ctx, { tableName, jsonData }) => {
        ensureAdmin(ctx);

        const rows: any[] = JSON.parse(jsonData);
        if (!Array.isArray(rows)) throw new SenderError('jsonData must be a JSON array');

        validateKeys(rows, tableName, ctx);

        switch (tableName) {
            case 'HsrCharacter': {
                for (const r of rows) {
                    validateEnum('path', r.path, ctx, tableName);
                    validateEnum('element', r.element, ctx, tableName);
                    validateEnum('role', r.role, ctx, tableName);
                    const existing = ctx.db.HsrCharacter.name.find(r.name);
                    const row = {
                        name: r.name,
                        displayName: r.displayName,
                        aliases: r.aliases || [],
                        rarity: r.rarity,
                        path: { tag: r.path, value: {} },
                        element: { tag: r.element, value: {} },
                        role: { tag: r.role, value: {} },
                        imageUrl: r.imageUrl || '',
                    };
                    if (existing) {
                        ctx.db.HsrCharacter.name.update({ ...existing, ...row } as any);
                    } else {
                        ctx.db.HsrCharacter.insert(row as any);
                    }
                }
                break;
            }
            case 'HsrLightcone': {
                for (const r of rows) {
                    validateEnum('path', r.path, ctx, tableName);
                    const existing = ctx.db.HsrLightcone.name.find(r.name);
                    const row = {
                        name: r.name,
                        displayName: r.displayName,
                        aliases: r.aliases || [],
                        path: { tag: r.path, value: {} },
                        rarity: r.rarity,
                        imageUrl: r.imageUrl || '',
                        posX: r.posX || 0,
                        posY: r.posY || 0,
                        width: r.width || 0,
                    };
                    if (existing) {
                        ctx.db.HsrLightcone.name.update({ ...existing, ...row } as any);
                    } else {
                        ctx.db.HsrLightcone.insert(row as any);
                    }
                }
                break;
            }
            case 'HsrCharacterCost': {
                for (const r of rows) {
                    validateEnum('gameMode', r.gameMode, ctx, tableName);
                    const gameMode = { tag: r.gameMode, value: {} };
                    const row = {
                        characterName: r.characterName,
                        gameMode,
                        classicCosts: r.classicCosts,
                        auctionBaseBid: r.auctionBaseBid,
                    };
                    let existing = null;
                    for (const e of ctx.db.HsrCharacterCost.iter()) {
                        if (e.characterName === r.characterName && e.gameMode.tag === r.gameMode) {
                            existing = e;
                            break;
                        }
                    }
                    if (existing) {
                        ctx.db.HsrCharacterCost.delete(existing);
                    }
                    ctx.db.HsrCharacterCost.insert(row as any);
                }
                break;
            }
            case 'HsrLightconeCost': {
                for (const r of rows) {
                    const existing = ctx.db.HsrLightconeCost.lightconeName.find(r.lightconeName);
                    const row = {
                        lightconeName: r.lightconeName,
                        classicCosts: r.classicCosts,
                        auctionBaseBid: r.auctionBaseBid,
                    };
                    if (existing) {
                        ctx.db.HsrLightconeCost.lightconeName.update({ ...existing, ...row });
                    } else {
                        ctx.db.HsrLightconeCost.insert(row as any);
                    }
                }
                break;
            }
            case 'HsrSynergyCost': {
                for (const r of rows) {
                    validateEnum('gameMode', r.gameMode, ctx, tableName);
                    const gameMode = { tag: r.gameMode, value: {} };
                    const row = {
                        id: 0,
                        sourceName: r.sourceName,
                        targetName: r.targetName,
                        gameMode,
                        costModifier: r.costModifier,
                    };
                    let existing = null;
                    for (const e of ctx.db.HsrSynergyCost.iter()) {
                        if (e.sourceName === r.sourceName && e.targetName === r.targetName && e.gameMode.tag === r.gameMode) {
                            existing = e;
                            break;
                        }
                    }
                    if (existing) {
                        ctx.db.HsrSynergyCost.id.update({ ...existing, costModifier: r.costModifier });
                    } else {
                        ctx.db.HsrSynergyCost.insert(row as any);
                    }
                }
                break;
            }
            default:
                throw new SenderError(`Bulk upsert not supported for table: ${tableName}`);
        }
    }
);

// ─── Update user (inline edit from admin panel) ──────────────────────────────

export const admin_update_user = spacetimedb.reducer(
    { userId: t.u32(), displayName: t.string(), username: t.string(), roleTag: t.string() },
    (ctx, { userId, displayName, username, roleTag }) => {
        ensureAdmin(ctx);

        const user = ctx.db.User.id.find(userId);
        if (!user) throw new SenderError('User not found');

        // Validate role tag
        validateEnum('userRole', roleTag, ctx, 'User');

        // Check username uniqueness if changed
        if (username !== user.username) {
            const existing = ctx.db.User.username.find(username);
            if (existing) throw new SenderError(`Username "${username}" is already taken`);
        }

        ctx.db.User.id.update({
            ...user,
            displayName,
            username,
            role: { tag: roleTag, value: {} } as any,
        });
    }
);
