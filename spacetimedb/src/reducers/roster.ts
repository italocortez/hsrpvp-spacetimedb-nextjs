import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { ensureVerifiedUser } from '../helpers/ensurePermissions';
import { auditInsert, auditUpdate } from '../helpers/auditColumns';
import { validateUid, deriveRegion, recalcDuplicateUid } from '../helpers/rosterHelpers';
import { updateAccountRating } from '../helpers/accountRating';

// ─── create_hsr_account ───────────────────────────────────────────────────────
// Creates a new HSR account entry for the authenticated user.
// Validates UID format, derives region, enforces 5-account cap,
// auto-defaults label, and auto-activates if it is the user's first account.

export const create_hsr_account = spacetimedb.reducer(
    { uid: t.string(), displayLabel: t.string() },
    (ctx, { uid, displayLabel }) => {
        const user = ensureVerifiedUser(ctx);

        validateUid(uid);
        const region = deriveRegion(uid);

        const existing = [...ctx.db.HsrAccount.user_id.filter(user.id)];
        if (existing.length >= 5) {
            throw new SenderError('Maximum 5 HSR accounts per user');
        }

        const label = displayLabel.trim() || 'Account ' + (existing.length + 1);
        const isFirst = existing.length === 0;

        ctx.db.HsrAccount.insert({
            id: 0,
            userId: user.id,
            uid,
            region,
            displayLabel: label,
            isActive: isFirst,
            isRosterPublic: false,
            isRatingPublic: false,
            isDuplicateUid: false,
            ...auditInsert(ctx, user.id),
        } as any);

        recalcDuplicateUid(ctx, uid, user.id);
    }
);

// ─── update_hsr_account ───────────────────────────────────────────────────────
// Updates display label and visibility toggles.
// UID and region are immutable — this reducer does NOT accept them.

export const update_hsr_account = spacetimedb.reducer(
    { hsrAccountId: t.u32(), displayLabel: t.string(), isRosterPublic: t.bool(), isRatingPublic: t.bool() },
    (ctx, { hsrAccountId, displayLabel, isRosterPublic, isRatingPublic }) => {
        const user = ensureVerifiedUser(ctx);

        const account = ctx.db.HsrAccount.id.find(hsrAccountId);
        if (!account) throw new SenderError('HSR account not found');
        if (account.userId !== user.id) throw new SenderError('Not your account');

        const trimmed = displayLabel.trim();
        if (!trimmed) throw new SenderError('Display label cannot be empty');

        ctx.db.HsrAccount.id.update({
            ...account,
            displayLabel: trimmed,
            isRosterPublic,
            isRatingPublic,
            ...auditUpdate(ctx, account, user.id),
        });
    }
);

// ─── set_active_hsr_account ───────────────────────────────────────────────────
// Sets the specified account as the active one, deactivating all others.

export const set_active_hsr_account = spacetimedb.reducer(
    { hsrAccountId: t.u32() },
    (ctx, { hsrAccountId }) => {
        const user = ensureVerifiedUser(ctx);

        const account = ctx.db.HsrAccount.id.find(hsrAccountId);
        if (!account) throw new SenderError('HSR account not found');
        if (account.userId !== user.id) throw new SenderError('Not your account');

        // No-op if already active
        if (account.isActive) return;

        const allAccounts = [...ctx.db.HsrAccount.user_id.filter(user.id)];
        for (const acc of allAccounts) {
            if (acc.isActive && acc.id !== hsrAccountId) {
                ctx.db.HsrAccount.id.update({ ...acc, isActive: false, ...auditUpdate(ctx, acc, user.id) });
            }
        }

        ctx.db.HsrAccount.id.update({ ...account, isActive: true, ...auditUpdate(ctx, account, user.id) });
    }
);

// ─── delete_hsr_account ───────────────────────────────────────────────────────
// Deletes an HSR account with cascade to characters.
// If the deleted account was active, auto-activates the oldest remaining.

export const delete_hsr_account = spacetimedb.reducer(
    { hsrAccountId: t.u32() },
    (ctx, { hsrAccountId }) => {
        const user = ensureVerifiedUser(ctx);

        const account = ctx.db.HsrAccount.id.find(hsrAccountId);
        if (!account) throw new SenderError('HSR account not found');
        if (account.userId !== user.id) throw new SenderError('Not your account');

        // D-24: Block deletion if account is currently selected in an active lobby
        const activeLma = [...ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)];
        if (activeLma.length > 0) {
            throw new SenderError('Cannot delete an account that is selected in an active lobby. Leave the lobby first.');
        }

        // D-24: Block if account is locked in an active tournament
        const tpaEntries = [...ctx.db.TournamentPlayerAccount.by_user.filter(user.id)]
            .filter((e: any) => e.hsrAccountId === hsrAccountId);
        for (const tpa of tpaEntries) {
            const tournament = ctx.db.Tournament.id.find(tpa.tournamentId);
            if (tournament && tournament.stage.tag !== 'Completed' && tournament.stage.tag !== 'Cancelled') {
                throw new SenderError('Cannot delete an account locked in an active tournament. Wait for the tournament to complete or be cancelled.');
            }
        }

        const uid = account.uid;

        // Cascade: delete all characters for this account
        const characters = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)];
        for (const char of characters) {
            ctx.db.HsrAccountCharacter.delete(char);
        }

        ctx.db.HsrAccount.id.delete(hsrAccountId);

        // Auto-activate oldest remaining if this was the active account
        if (account.isActive) {
            const remaining = [...ctx.db.HsrAccount.user_id.filter(user.id)];
            if (remaining.length > 0) {
                remaining.sort((a: any, b: any) =>
                    Number(a.createdDate.microsSinceUnixEpoch - b.createdDate.microsSinceUnixEpoch)
                );
                ctx.db.HsrAccount.id.update({
                    ...remaining[0],
                    isActive: true,
                    ...auditUpdate(ctx, remaining[0], user.id),
                });
            }
        }

        recalcDuplicateUid(ctx, uid, user.id);
    }
);

// ─── batch_upsert_characters ──────────────────────────────────────────────────
// Atomically upserts multiple characters on an account.
// Phase 1 validates ALL items before Phase 2 writes ANY — all-or-nothing.

export const batch_upsert_characters = spacetimedb.reducer(
    { hsrAccountId: t.u32(), charactersJson: t.string() },
    (ctx, { hsrAccountId, charactersJson }) => {
        const user = ensureVerifiedUser(ctx);

        const account = ctx.db.HsrAccount.id.find(hsrAccountId);
        if (!account) throw new SenderError('HSR account not found');
        if (account.userId !== user.id) throw new SenderError('Not your account');

        const items: Array<{ characterName: string; eidolonLevel: number }> = JSON.parse(charactersJson);
        if (!Array.isArray(items) || items.length === 0) {
            throw new SenderError('charactersJson must be a non-empty JSON array');
        }

        // Phase 1 — Validate ALL before writing ANY
        for (const item of items) {
            if (!ctx.db.HsrCharacter.name.find(item.characterName)) {
                throw new SenderError(`Invalid character: "${item.characterName}"`);
            }
            if (item.eidolonLevel === undefined || item.eidolonLevel < 0 || item.eidolonLevel > 6) {
                throw new SenderError(`Invalid eidolon level for "${item.characterName}": must be 0-6`);
            }
        }

        // Phase 2 — Upsert all (composite PK: delete then insert)
        for (const item of items) {
            const existing = [...ctx.db.HsrAccountCharacter.by_account_and_character.filter([hsrAccountId, item.characterName])][0] ?? null;
            if (existing) {
                ctx.db.HsrAccountCharacter.delete(existing);
            }
            ctx.db.HsrAccountCharacter.insert({
                hsrAccountId,
                characterName: item.characterName,
                eidolonLevel: item.eidolonLevel,
                ...(existing ? auditUpdate(ctx, existing, user.id) : auditInsert(ctx, user.id)),
            } as any);
        }

        updateAccountRating(ctx, hsrAccountId, user.id);
    }
);

// ─── batch_remove_characters ──────────────────────────────────────────────────
// Atomically removes multiple characters from an account.
// Validates ALL names exist before deleting ANY — all-or-nothing.

export const batch_remove_characters = spacetimedb.reducer(
    { hsrAccountId: t.u32(), characterNamesJson: t.string() },
    (ctx, { hsrAccountId, characterNamesJson }) => {
        const user = ensureVerifiedUser(ctx);

        const account = ctx.db.HsrAccount.id.find(hsrAccountId);
        if (!account) throw new SenderError('HSR account not found');
        if (account.userId !== user.id) throw new SenderError('Not your account');

        const names: string[] = JSON.parse(characterNamesJson);
        if (!Array.isArray(names) || names.length === 0) {
            throw new SenderError('characterNamesJson must be a non-empty JSON array');
        }

        // Composite PK lookup: filter by indexed hsrAccountId, then match characterName
        const accountChars = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)];

        // Validate ALL names exist before deleting ANY
        for (const name of names) {
            const existing = accountChars.find(row => row.characterName === name) ?? null;
            if (!existing) {
                throw new SenderError(`Character "${name}" not found on this account`);
            }
        }

        // All validated — now delete
        for (const name of names) {
            const row = accountChars.find(row => row.characterName === name)!;
            ctx.db.HsrAccountCharacter.delete(row);
        }

        updateAccountRating(ctx, hsrAccountId, user.id);
    }
);

// ─── migrate_roster ───────────────────────────────────────────────────────────
// Migrates characters from one account to another.
// copy mode: upserts source characters into target (preserves source).
// move mode: same as copy, then deletes all source characters.

export const migrate_roster = spacetimedb.reducer(
    { sourceAccountId: t.u32(), targetAccountId: t.u32(), mode: t.string() },
    (ctx, { sourceAccountId, targetAccountId, mode }) => {
        const user = ensureVerifiedUser(ctx);

        if (mode !== 'copy' && mode !== 'move') {
            throw new SenderError('Mode must be "copy" or "move"');
        }

        const sourceAccount = ctx.db.HsrAccount.id.find(sourceAccountId);
        if (!sourceAccount) throw new SenderError('Source HSR account not found');
        if (sourceAccount.userId !== user.id) throw new SenderError('Not your account');

        const targetAccount = ctx.db.HsrAccount.id.find(targetAccountId);
        if (!targetAccount) throw new SenderError('Target HSR account not found');
        if (targetAccount.userId !== user.id) throw new SenderError('Not your account');

        if (sourceAccountId === targetAccountId) {
            throw new SenderError('Source and target cannot be the same account');
        }

        const sourceChars = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(sourceAccountId)];

        // Copy/upsert source characters into target
        for (const char of sourceChars) {
            const existingInTarget = [...ctx.db.HsrAccountCharacter.by_account_and_character.filter([targetAccountId, char.characterName])][0] ?? null;
            if (existingInTarget) {
                ctx.db.HsrAccountCharacter.delete(existingInTarget);
            }
            ctx.db.HsrAccountCharacter.insert({
                hsrAccountId: targetAccountId,
                characterName: char.characterName,
                eidolonLevel: char.eidolonLevel,
                ...(existingInTarget
                    ? auditUpdate(ctx, existingInTarget, user.id)
                    : auditInsert(ctx, user.id)),
            } as any);
        }

        // Move mode: delete source characters after copying
        if (mode === 'move') {
            for (const char of sourceChars) {
                ctx.db.HsrAccountCharacter.delete(char);
            }
        }
    }
);
