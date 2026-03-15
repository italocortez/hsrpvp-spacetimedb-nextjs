import { t } from 'spacetimedb/server';
import {
    DraftMode,
    BanMode,
    ActionType,
    TeamLabel
} from './enums';

// -------------------- STRUCTS --------------------

export const LobbyConfig = t.object('LobbyConfig', {
    teamSize: t.u8(),               // 1, 2, or 3
    draftMode: DraftMode,
    banMode: BanMode,
    standardTurnSeconds: t.u32(),
    reserveBankSeconds: t.u32(),
    auctionBudget: t.f32().optional(),

    // Balance Math
    rosterDiffAdvantage: t.f32(),
    rosterThreshold: t.f32(),
    underThresholdAdvantage: t.f32(),
    aboveThresholdPenalty: t.f32(),
    deathPenalty: t.f32(),
});

export const PlayerSnapshot = t.object('PlayerSnapshot', {
    userId: t.u32(),
    displayName: t.string(),
    avatarUrl: t.string(),
});

export const TimerState = t.object('TimerState', {
    turnStartAt: t.timestamp(),
    teamBlueReserveMs: t.u32(),
    teamRedReserveMs: t.u32(),
    isPaused: t.bool(),
    accumulatedPauseMs: t.u32(),
});

export const DraftStep = t.object('DraftStep', {
    actionRequired: ActionType,
    teamTurn: TeamLabel,
});

export const EidolonCost = t.object('EidolonCost', {
    e0: t.f32(),
    e1: t.f32(),
    e2: t.f32(),
    e3: t.f32(),
    e4: t.f32(),
    e5: t.f32(),
    e6: t.f32(),
});

export const SuperimpositionCost = t.object('SuperimpositionCost', {
    s1: t.f32(),
    s2: t.f32(),
    s3: t.f32(),
    s4: t.f32(),
    s5: t.f32(),
});

// -------------------- ACTION PAYLOADS --------------------
// Instead of a raw JSON string, we define a Sum Type (Tagged Union).
// This replaces the "JSON" column with a type-safe structure.

export const PickPayload = t.object('PickPayload', {
    characterName: t.string(),
    eidolon: t.u8(),
    costPaid: t.f32(),
});

export const BanPayload = t.object('BanPayload', {
    characterName: t.string(),
});

export const BidPayload = t.object('BidPayload', {
    amount: t.f32(),
    targetCharacter: t.string(),
});

export const AuctionSoldPayload = t.object('AuctionSoldPayload', {
    characterName: t.string(),
    winningAmount: t.f32(),
    winningTeam: TeamLabel,    // Who actually got it
    eidolon: t.u8(),
});

export const NominatePayload = t.object('NominatePayload', {
    characterName: t.string(),
    eidolon: t.u8(),
});

export const UndoPayload = t.object('UndoPayload', {
    originalSequenceId: t.u32(), // The ID of the step we are reverting
});

export const PausePayload = t.object('PausePayload', {
    timeRemainingMs: t.u32(),        // Snapshot of the clock when paused
    isAutoPause: t.bool(),           // True if system paused (disconnect), False if manual
});

// The "Polymorphic" Enum containing the specific payloads
export const StepPayload = t.enum('StepPayload', {
    Pick: PickPayload,
    Ban: BanPayload,
    Bid: BidPayload,
    AuctionSold: AuctionSoldPayload,
    Nominate: NominatePayload,
    Undo: UndoPayload,
    Pause: PausePayload,
});
