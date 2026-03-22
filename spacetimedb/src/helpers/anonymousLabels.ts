/**
 * Computes anonymous label for a lobby member based on team side and join order.
 * Labels: "Blue-1", "Blue-2", "Red-1", "Red-2", "Spectator-1", "Coach-Blue", "Coach-Red"
 * Deterministic: same LobbyMember data always produces same label.
 */
export function computeAnonymousLabel(ctx: any, lobbyId: number, userId: number): string {
    // Look up the target member
    const member = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, userId])][0];
    if (!member) return 'Unknown';

    // Coaches get a special label: "Coach-Blue", "Coach-Red"
    if (member.isCoach) {
        return `Coach-${member.teamSlot.tag}`;
    }

    // Get all non-coach members on the same team in this lobby
    const sameTeamMembers = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)]
        .filter((m: any) => m.teamSlot.tag === member.teamSlot.tag && !m.isCoach);

    // Sort by createdDate ascending (join order -- earlier = lower number)
    sameTeamMembers.sort((a: any, b: any) => {
        return Number(a.createdDate.microsSinceUnixEpoch / 1000n) - Number(b.createdDate.microsSinceUnixEpoch / 1000n);
    });

    // Find the index of the target userId in the sorted list
    const index = sameTeamMembers.findIndex((m: any) => m.userId === userId);

    return `${member.teamSlot.tag}-${index + 1}`;
}
