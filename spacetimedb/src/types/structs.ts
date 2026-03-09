import { t } from 'spacetimedb/server';
import {
    DraftMode,
    BanMode,
    ActionType,
    TeamLabel
} from './enums';

// -------------------- STRUCTS --------------------

export const LobbyConfig = t.object('LobbyConfig', {
    team_size: t.u8(),               // 1, 2, or 3
    draft_mode: DraftMode,
    ban_mode: BanMode,
    standard_turn_seconds: t.u32(),
    reserve_bank_seconds: t.u32(),
    auction_budget: t.f32().optional(),

    // Balance Math
    roster_diff_advantage: t.f32(),
    roster_threshold: t.f32(),
    under_threshold_advantage: t.f32(),
    above_threshold_penalty: t.f32(),
    death_penalty: t.f32(),
});

export const PlayerSnapshot = t.object('PlayerSnapshot', {
    userId: t.u32(),
    display_name: t.string(),
    avatar_url: t.string(),
});

export const TimerState = t.object('TimerState', {
    turn_start_at: t.timestamp(),
    team_blue_reserve_ms: t.u32(),
    team_red_reserve_ms: t.u32(),
    is_paused: t.bool(),
    accumulated_pause_ms: t.u32(),
});

export const DraftStep = t.object('DraftStep', {
    action_required: ActionType,
    team_turn: TeamLabel,
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
    character_name: t.string(),
    eidolon: t.u8(),
    cost_paid: t.f32(),
});

export const BanPayload = t.object('BanPayload', {
    character_name: t.string(),
});

export const BidPayload = t.object('BidPayload', {
    amount: t.f32(),
    target_character: t.string(),
});

export const AuctionSoldPayload = t.object('AuctionSoldPayload', {
    character_name: t.string(),
    winning_amount: t.f32(),
    winning_team: TeamLabel,    // Who actually got it
    eidolon: t.u8(),
});

export const NominatePayload = t.object('NominatePayload', {
    character_name: t.string(),
    eidolon: t.u8(),
});

export const UndoPayload = t.object('UndoPayload', {
    original_sequence_id: t.u32(), // The ID of the step we are reverting
});

export const PausePayload = t.object('PausePayload', {
    time_remaining_ms: t.u32(),        // Snapshot of the clock when paused
    is_auto_pause: t.bool(),           // True if system paused (disconnect), False if manual
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