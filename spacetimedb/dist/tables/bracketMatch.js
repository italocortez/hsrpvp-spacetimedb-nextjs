import { table, t } from 'spacetimedb/server';
import { GameMode, MatchResultStatus } from '../types/enums';
export const bracketMatchColumns = {
    id: t.u32().primaryKey().autoInc(),
    tournamentId: t.u32(),
    roundNumber: t.u32(),
    matchNumber: t.u32(),
    isLosersBracket: t.bool(),
    groupId: t.u32().optional(),
    participant1Id: t.u32().optional(),
    participant2Id: t.u32().optional(),
    nextWinnerMatchId: t.u32().optional(),
    nextLoserMatchId: t.u32().optional(),
    bestOf: t.u8(),
    gameMode: GameMode,
    winnerAdvantage: t.u8(),
    scheduledAt: t.timestamp().optional(),
    lobbyId: t.u32().optional(),
    checkInRequired: t.bool(),
    winnerId: t.u32().optional(),
    resultStatus: MatchResultStatus,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
export const BracketMatch = table({
    name: 'bracket_match',
    public: true,
    indexes: [
        { name: 'bm_tournament', accessor: 'bm_tournament', algorithm: 'btree', columns: ['tournamentId'] },
        { name: 'bm_lobby', accessor: 'bm_lobby', algorithm: 'btree', columns: ['lobbyId'] },
    ],
}, bracketMatchColumns);
