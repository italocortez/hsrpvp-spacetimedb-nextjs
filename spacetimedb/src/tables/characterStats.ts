import { table, t } from 'spacetimedb/server';
import { GameMode, DraftMode } from '../types/enums';

export const playerCharacterStatColumns = {
    userId: t.u32(),
    characterName: t.string(),
    gameMode: GameMode,
    draftMode: DraftMode,
    wins: t.u32(),
    losses: t.u32(),
    matchesPlayed: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const PlayerCharacterStat = table({
    name: 'player_character_stat',
    public: true,
    primaryKey: ['userId', 'characterName', 'gameMode', 'draftMode'],
    indexes: [
        { accessor: 'by_user', algorithm: 'btree', columns: ['userId'] },
        { accessor: 'by_user_and_character_mode_draft', algorithm: 'btree', columns: ['userId', 'characterName', 'gameMode', 'draftMode'] },
    ],
}, playerCharacterStatColumns);
