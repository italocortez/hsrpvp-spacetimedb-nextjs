import { table, t } from 'spacetimedb/server';
import { GameMode, ValidationStatus } from '../types/enums';

export const matchResultGameColumns = {
    matchResultId: t.u32(),
    gameNumber: t.u8(),
    gameMode: GameMode,
    player1ScreenshotUrl: t.string().optional(),
    player2ScreenshotUrl: t.string().optional(),
    player1CyclesUsed: t.u32().optional(),
    player2CyclesUsed: t.u32().optional(),
    player1Score: t.u64().optional(),
    player2Score: t.u64().optional(),
    player1Boss1Score: t.u64().optional(),
    player1Boss2Score: t.u64().optional(),
    player2Boss1Score: t.u64().optional(),
    player2Boss2Score: t.u64().optional(),
    winnerId: t.u32().optional(),
    validationStatus: ValidationStatus,
    validatedById: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const MatchResultGame = table({
    name: 'match_result_game',
    public: true,
    primaryKey: ['matchResultId', 'gameNumber'],
    indexes: [
        { name: 'mrg_match_result', accessor: 'mrg_match_result', algorithm: 'btree', columns: ['matchResultId'] },
    ],
}, matchResultGameColumns);
