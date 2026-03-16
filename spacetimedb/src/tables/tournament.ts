import { table, t } from 'spacetimedb/server';
import { TournamentFormat, TournamentStage, GameMode, DisconnectPolicy, GroupAssignmentMode } from '../types/enums';

export const tournamentColumns = {
    id: t.u32().primaryKey().autoInc(),
    name: t.string(),
    description: t.string(),
    organizerId: t.u32(),
    format: TournamentFormat,
    stage: TournamentStage,
    defaultGameMode: GameMode,
    maxParticipants: t.u32(),
    isAnonymousDefault: t.bool(),
    isAnonymousSpectators: t.bool(),
    isOpenRoster: t.bool(),
    disconnectPolicy: DisconnectPolicy,
    checkInEnabled: t.bool(),
    checkInPerRound: t.bool(),
    autoForfeitEnabled: t.bool(),
    autoForfeitMinutes: t.u32(),
    bracketRevealAt: t.timestamp().optional(),
    grandFinalsAdvantage: t.bool(),
    groupAssignmentMode: GroupAssignmentMode,
    groupAdvanceCount: t.u8(),
    seasonId: t.u32().optional(),
    countTowardsMmr: t.bool(),
    defaultBestOf: t.u8(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const Tournament = table({
    name: 'tournament',
    public: true,
    indexes: [
        { name: 'tournament_organizer', accessor: 'tournament_organizer', algorithm: 'btree', columns: ['organizerId'] },
        { name: 'tournament_stage', accessor: 'tournament_stage', algorithm: 'btree', columns: ['stage'] },
    ],
}, tournamentColumns);
