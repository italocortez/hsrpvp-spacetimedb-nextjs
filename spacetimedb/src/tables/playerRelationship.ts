import { table, t } from 'spacetimedb/server';
import { GameMode, DraftMode } from '../types/enums';

export const playerRelationshipColumns = {
    userId: t.u32(),
    otherUserId: t.u32(),
    gameMode: GameMode,
    draftMode: DraftMode,
    matchesAsAlly: t.u32(),
    winsAsAlly: t.u32(),
    matchesAsOpponent: t.u32(),
    winsAsOpponent: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const PlayerRelationship = table({
    name: 'player_relationship',
    public: true,
    primaryKey: ['userId', 'otherUserId', 'gameMode', 'draftMode'],
    indexes: [
        { accessor: 'by_user', algorithm: 'btree', columns: ['userId'] },
        { accessor: 'by_user_and_other_mode_draft', algorithm: 'btree', columns: ['userId', 'otherUserId', 'gameMode', 'draftMode'] },
    ],
}, playerRelationshipColumns);
