import { table, t } from 'spacetimedb/server';
import { GameMode, MatchResultStatus, BracketSide } from '../types/enums';

export const bracketMatchColumns = {
    id: t.u32().primaryKey().autoInc(),
    tournamentId: t.u32(),
    roundNumber: t.u32(),
    matchNumber: t.u32(),
    bracketSide: BracketSide,
    groupId: t.u32().optional(),
    team1Id: t.u32().optional(),
    team2Id: t.u32().optional(),
    nextWinnerMatchId: t.u32().optional(),
    nextLoserMatchId: t.u32().optional(),
    bestOf: t.u8(),
    gameMode: GameMode,
    winnerAdvantage: t.u8(),
    scheduledAt: t.timestamp().optional(),
    lobbyId: t.u32().optional(),
    checkInRequired: t.bool(),
    winnerTeamId: t.u32().optional(),
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
        { accessor: 'tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
        { accessor: 'lobby_id', algorithm: 'btree', columns: ['lobbyId'] },
    ],
}, bracketMatchColumns);
