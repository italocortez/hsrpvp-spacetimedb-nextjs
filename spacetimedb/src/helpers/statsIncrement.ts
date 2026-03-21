// ─── Player Stat & Relationship Increment Helpers ───────────────────────────
// Composite PK delete+insert upsert pattern for PlayerStat and PlayerRelationship.

import { auditInsert, auditUpdate } from './auditColumns';

/**
 * Increments PlayerStat for a participant after match finalization.
 * Creates a new row if none exists for this (userId, gameMode, draftMode) tuple.
 */
export function incrementPlayerStat(
    ctx: any,
    userId: number,
    gameMode: any,
    draftMode: any,
    isWin: boolean,
    isDraw: boolean,
    actingUserId: number
): void {
    const existing = [...ctx.db.PlayerStat.by_user_mode_draft.filter([userId, gameMode, draftMode])][0];

    if (existing) {
        ctx.db.PlayerStat.delete(existing);
        ctx.db.PlayerStat.insert({
            userId,
            gameMode,
            draftMode,
            matchesPlayed: existing.matchesPlayed + 1,
            wins: existing.wins + (isWin ? 1 : 0),
            losses: existing.losses + (!isWin && !isDraw ? 1 : 0),
            draws: existing.draws + (isDraw ? 1 : 0),
            matchesSpectated: existing.matchesSpectated,
            ...auditUpdate(ctx, existing, actingUserId),
        } as any);
    } else {
        ctx.db.PlayerStat.insert({
            userId,
            gameMode,
            draftMode,
            matchesPlayed: 1,
            wins: isWin ? 1 : 0,
            losses: !isWin && !isDraw ? 1 : 0,
            draws: isDraw ? 1 : 0,
            matchesSpectated: 0,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }
}

/**
 * Increments PlayerRelationship for a directional pair after match finalization.
 * Creates a new row if none exists. Caller must invoke TWICE for bidirectional tracking
 * (once for A->B and once for B->A).
 */
export function incrementPlayerRelationship(
    ctx: any,
    userId: number,
    otherUserId: number,
    gameMode: any,
    draftMode: any,
    isAlly: boolean,
    didWin: boolean,
    actingUserId: number
): void {
    const existing = [...ctx.db.PlayerRelationship.by_user_and_other_mode_draft.filter([userId, otherUserId, gameMode, draftMode])][0];

    if (existing) {
        ctx.db.PlayerRelationship.delete(existing);
        ctx.db.PlayerRelationship.insert({
            userId,
            otherUserId,
            gameMode,
            draftMode,
            matchesAsAlly: existing.matchesAsAlly + (isAlly ? 1 : 0),
            winsAsAlly: existing.winsAsAlly + (isAlly && didWin ? 1 : 0),
            matchesAsOpponent: existing.matchesAsOpponent + (!isAlly ? 1 : 0),
            winsAsOpponent: existing.winsAsOpponent + (!isAlly && didWin ? 1 : 0),
            ...auditUpdate(ctx, existing, actingUserId),
        } as any);
    } else {
        ctx.db.PlayerRelationship.insert({
            userId,
            otherUserId,
            gameMode,
            draftMode,
            matchesAsAlly: isAlly ? 1 : 0,
            winsAsAlly: isAlly && didWin ? 1 : 0,
            matchesAsOpponent: !isAlly ? 1 : 0,
            winsAsOpponent: !isAlly && didWin ? 1 : 0,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }
}
