/**
 * Validates that the user owns the specified character on their active HSR account.
 * Returns { valid: true } if owned or if ownership check is disabled.
 * For tournament matches, checks against TournamentPlayerAccount locked accounts.
 */
export function validateCharacterOwnership(
    ctx: any,
    userId: number,
    characterName: string,
    lobbyId: number
): { valid: boolean; reason?: string } {
    // Look up the Lobby
    const lobby = ctx.db.Lobby.id.find(lobbyId);
    if (!lobby || !lobby.requireOwnership) {
        // Ownership check disabled or lobby not found
        return { valid: true };
    }

    // Tournament path: check against locked TournamentPlayerAccount entries
    if (lobby.isTournamentControlled && lobby.tournamentId) {
        const lockedAccounts = [...ctx.db.TournamentPlayerAccount.by_tournament_and_user.filter([lobby.tournamentId, userId])];
        for (const account of lockedAccounts) {
            // Multi-column btree index exists on HsrAccountCharacter
            const character = [...ctx.db.HsrAccountCharacter.by_account_and_character.filter([account.hsrAccountId, characterName])][0];
            if (character) {
                return { valid: true };
            }
        }
        return { valid: false, reason: 'You do not own this character on any registered tournament account.' };
    }

    // Non-tournament path: check user's active HSR account
    const activeAccount = [...ctx.db.HsrAccount.user_id.filter(userId)].find((a: any) => a.isActive);
    if (!activeAccount) {
        return { valid: false, reason: 'No active HSR account found.' };
    }

    const character = [...ctx.db.HsrAccountCharacter.by_account_and_character.filter([activeAccount.id, characterName])][0];
    if (character) {
        return { valid: true };
    }

    return { valid: false, reason: 'You do not own this character.' };
}
