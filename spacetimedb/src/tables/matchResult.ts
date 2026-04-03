import { table, t } from 'spacetimedb/server';
import { MatchResultStatus, MatchType, MatchOutcome, ConcedeTrigger } from '../types/enums';

export const matchResultColumns = {
    id: t.u32().primaryKey().autoInc(),
    bracketMatchId: t.u32().optional(),
    lobbyId: t.u32(),
    isTournamentControlled: t.bool(),
    status: MatchResultStatus,
    winnerUserId: t.u32().optional(),
    mmrProcessedAt: t.timestamp().optional(),
    refereeUserId: t.u32().optional(),
    disputedByUserId: t.u32().optional(),
    disputeReason: t.string().optional(),
    tournamentId: t.u32().optional(),
    blueConfirmed: t.bool(),
    redConfirmed: t.bool(),
    refereeFullControl: t.bool(),
    matchType: MatchType,
    matchOutcome: MatchOutcome.optional(),
    concedeTrigger: ConcedeTrigger.optional(),
    concedeSummary: t.string().optional(),
    concedeAtStage: t.string().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const MatchResultRecord = table({
    name: 'match_result_record',
    public: true,
    indexes: [
        { accessor: 'lobby_id', algorithm: 'btree', columns: ['lobbyId'] },
        { accessor: 'tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
    ],
}, matchResultColumns);
