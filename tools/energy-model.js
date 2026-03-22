#!/usr/bin/env node
/**
 * SpacetimeDB Energy Budget Model
 *
 * Estimates monthly energy consumption based on table schemas,
 * user activity assumptions, and SpacetimeDB billing rates.
 *
 * Usage:
 *   node tools/energy-model.js
 *   node tools/energy-model.js --months 12 --users 150 --matches-per-day 20
 *   node tools/energy-model.js --scenario growth
 */

// ─── Energy Rates ────────────────────────────────────────────────────────────
const ENERGY = {
  PER_1M_REDUCER_CALLS: 840,
  PER_10GB_EGRESS: 2000,
  PER_1GB_STORAGE: 2592,
  MONTHLY_BUDGET: 40000,
};

// ─── Type Sizes (bytes) ─────────────────────────────────────────────────────
const TYPE_BYTES = {
  u8: 1, i8: 1, bool: 1,
  u16: 2, i16: 2,
  u32: 4, i32: 4, f32: 4,
  u64: 8, i64: 8, f64: 8,
  timestamp: 8,
  identity: 32,
  enum: 1, // all enums in this project are unit-variant (u8 tag)
  // Structs
  EidolonCost: 28,       // 7 × f32
  SuperimpositionCost: 20, // 5 × f32
  TimerState: 21,         // timestamp + u32 + u32 + bool + u32
  DraftStep: 2,           // 2 enum tags
  RecurrenceRule: 15,     // enum + u8 + optional u8 + optional u8 + optional timestamp
  LobbyConfigSnapshot: 36,
  PlayerSnapshot: 54,     // u32 + ~20 char string + ~30 char string (avg)
  StepPayload: 20,        // avg across variants (tag + variant data)
  GameScore: 8,           // u64
};

// Strings: 4-byte length prefix + avg content bytes
const STRING_OVERHEAD = 4;
const AVG_STRING_LENGTHS = {
  short: 15,    // join codes, UIDs, regions
  medium: 30,   // names, display names, labels
  long: 80,     // descriptions, aliases
  url: 100,     // screenshot URLs, image URLs
  json_small: 200,  // small JSON blobs
  json_large: 2000, // match step history, roster snapshots
};

function strBytes(category) {
  return STRING_OVERHEAD + (AVG_STRING_LENGTHS[category] || 30);
}

function optionalBytes(innerBytes) {
  return 1 + innerBytes; // 1 byte tag + value when present
}

// Audit columns overhead: createdById(u32) + createdDate(ts) + lastModifiedById(u32) + lastModifiedDate(ts)
const AUDIT_BYTES = 4 + 8 + 4 + 8; // 24 bytes

// ─── Table Definitions ──────────────────────────────────────────────────────
// Each table: { name, visibility, bytesPerRow, growthType, growthCategory }
// growthType: 'static' (fixed rows), 'bounded' (grows with users), 'unbounded' (grows over time)

const TABLES = [
  // --- Static / Near-Static ---
  { name: 'hsr_character', vis: 'public', bytes: strBytes('medium') + strBytes('medium') + 60 + 1 + 1 + 1 + 1 + strBytes('url') + AUDIT_BYTES, growth: 'static', category: 'game_data' },
  { name: 'hsr_lightcone', vis: 'public', bytes: strBytes('medium') + strBytes('medium') + 60 + 1 + 1 + strBytes('url') + 4 + 4 + 4 + AUDIT_BYTES, growth: 'static', category: 'game_data' },
  { name: 'archetype', vis: 'public', bytes: 4 + strBytes('medium') + strBytes('long') + AUDIT_BYTES, growth: 'static', category: 'game_data' },
  { name: 'hsr_character_archetype', vis: 'public', bytes: strBytes('medium') + 4 + AUDIT_BYTES, growth: 'static', category: 'game_data' },
  { name: 'achievement', vis: 'public', bytes: 4 + strBytes('medium') + strBytes('long') + 1 + 1 + 1 + optionalBytes(4) + optionalBytes(strBytes('medium')) + AUDIT_BYTES, growth: 'static', category: 'game_data' },

  // --- Cost Data (per cost set × per game mode × per character/lightcone) ---
  { name: 'hsr_character_cost', vis: 'public', bytes: strBytes('medium') + 1 + 28 + 28 + 4 + AUDIT_BYTES, growth: 'bounded', category: 'cost_data' },
  { name: 'hsr_lightcone_cost', vis: 'public', bytes: strBytes('medium') + 1 + 20 + 20 + 4 + AUDIT_BYTES, growth: 'bounded', category: 'cost_data' },
  { name: 'hsr_synergy_cost', vis: 'public', bytes: 4 + strBytes('medium') + strBytes('medium') + 1 + 4 + 4 + AUDIT_BYTES, growth: 'bounded', category: 'cost_data' },
  { name: 'cost_set', vis: 'public', bytes: 4 + strBytes('medium') + 4 + 1 + 1 + 1 + 1 + AUDIT_BYTES, growth: 'bounded', category: 'cost_data' },

  // --- Cost Drafts (private, transient) ---
  { name: 'cost_set_draft_character', vis: 'private', bytes: 4 + strBytes('medium') + 1 + 28 + 28 + AUDIT_BYTES, growth: 'transient', category: 'cost_drafts' },
  { name: 'cost_set_draft_lightcone', vis: 'private', bytes: 4 + strBytes('medium') + 1 + 20 + 20 + AUDIT_BYTES, growth: 'transient', category: 'cost_drafts' },
  { name: 'cost_set_draft_synergy', vis: 'private', bytes: 4 + strBytes('medium') + strBytes('medium') + 1 + 4 + AUDIT_BYTES, growth: 'transient', category: 'cost_drafts' },

  // --- User Data (bounded by user count) ---
  { name: 'user', vis: 'public', bytes: 4 + strBytes('medium') + strBytes('medium') + 1 + 1 + 1 + 8 + 1 + optionalBytes(strBytes('medium')) + strBytes('medium') + optionalBytes(4) + optionalBytes(8) + AUDIT_BYTES, growth: 'bounded', category: 'users' },
  { name: 'user_identity', vis: 'public', bytes: 32 + 4 + 8 + AUDIT_BYTES, growth: 'bounded', category: 'users' },
  { name: 'hsr_account', vis: 'public', bytes: 4 + 4 + strBytes('short') + strBytes('short') + strBytes('medium') + 1 + 1 + 1 + 1 + AUDIT_BYTES, growth: 'bounded', category: 'users' },
  { name: 'hsr_account_character', vis: 'public', bytes: 4 + strBytes('medium') + 1 + AUDIT_BYTES, growth: 'bounded', category: 'roster' },
  { name: 'hsr_account_lightcone', vis: 'public', bytes: 4 + strBytes('medium') + 1 + AUDIT_BYTES, growth: 'bounded', category: 'roster' },
  { name: 'player_stats', vis: 'public', bytes: 4 + 4 + 4 + 4 + 4 + 4 + optionalBytes(4) + optionalBytes(4) + AUDIT_BYTES, growth: 'bounded', category: 'users' },
  { name: 'character_stats', vis: 'public', bytes: 4 + strBytes('medium') + 4 + 4 + 4 + AUDIT_BYTES, growth: 'bounded', category: 'users' },
  { name: 'mmr_rating', vis: 'public', bytes: 4 + 1 + 4 + 4 + optionalBytes(4) + optionalBytes(4) + AUDIT_BYTES, growth: 'bounded', category: 'users' },
  { name: 'user_achievement', vis: 'public', bytes: 4 + 4 + 4 + 4 + 1 + AUDIT_BYTES, growth: 'bounded', category: 'users' },

  // --- Lobby (transient — cleaned up after match) ---
  { name: 'lobby', vis: 'public', bytes: 4 + strBytes('short') + 4 + strBytes('medium') + strBytes('medium') + 1 + 1 + 1 + 4 + 4 + optionalBytes(4) + 4 + 4 + 4 + 4 + 4 + optionalBytes(4) + optionalBytes(4) + 1 + 1 + 1 + 4 + 1 + 1 + optionalBytes(4) + optionalBytes(8) + 1 + optionalBytes(8) + 8 + 1 + AUDIT_BYTES, growth: 'transient', category: 'lobby' },
  { name: 'lobby_member', vis: 'public', bytes: 4 + 4 + 1 + 1 + 1 + 1 + 1 + AUDIT_BYTES, growth: 'transient', category: 'lobby' },
  { name: 'lobby_password', vis: 'private', bytes: 4 + strBytes('long') + AUDIT_BYTES, growth: 'transient', category: 'lobby' },
  { name: 'match_session', vis: 'public', bytes: 4 + 4 + 200 + 21 + 4 + 4 + AUDIT_BYTES, growth: 'transient', category: 'lobby' },
  { name: 'match_session_step', vis: 'public', bytes: 4 + 4 + 4 + 4 + 1 + 1 + 20 + 8 + AUDIT_BYTES, growth: 'transient', category: 'lobby' },
  { name: 'chat_message', vis: 'public', bytes: 4 + 4 + 4 + 1 + strBytes('long') + optionalBytes(strBytes('json_small')) + optionalBytes(strBytes('medium')) + AUDIT_BYTES, growth: 'transient', category: 'lobby' },

  // --- Match History (unbounded — grows forever) ---
  { name: 'match_session_history', vis: 'public', bytes: strBytes('long') + strBytes('short') + 8 + 1 + 1 + strBytes('medium') + strBytes('medium') + 300 + 300 + 36 + 1 + strBytes('json_large') + strBytes('json_large') + AUDIT_BYTES, growth: 'unbounded', category: 'match_history' },
  { name: 'match_session_step_history', vis: 'public', bytes: strBytes('long') + strBytes('json_large') + AUDIT_BYTES, growth: 'unbounded', category: 'match_history' },
  { name: 'match_result_record', vis: 'public', bytes: 4 + optionalBytes(4) + 4 + 4 + 4 + 1 + 1 + optionalBytes(4) + optionalBytes(8) + 1 + 1 + optionalBytes(4) + optionalBytes(4) + optionalBytes(strBytes('long')) + optionalBytes(4) + 1 + AUDIT_BYTES, growth: 'unbounded', category: 'match_history' },
  { name: 'match_result_game', vis: 'public', bytes: 4 + 1 + 1 + optionalBytes(strBytes('url')) + optionalBytes(strBytes('url')) + optionalBytes(4) + optionalBytes(4) + optionalBytes(8) + optionalBytes(8) + optionalBytes(8) + optionalBytes(8) + optionalBytes(8) + optionalBytes(8) + optionalBytes(4) + 1 + optionalBytes(4) + AUDIT_BYTES, growth: 'unbounded', category: 'match_history' },
  { name: 'mmr_history', vis: 'public', bytes: 4 + 4 + 1 + 4 + 4 + 4 + 4 + optionalBytes(4) + AUDIT_BYTES, growth: 'unbounded', category: 'match_history' },

  // --- Tournament Data (unbounded — grows per tournament) ---
  { name: 'tournament', vis: 'public', bytes: 4 + strBytes('medium') + strBytes('long') + 4 + 1 + 1 + 1 + 4 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 4 + optionalBytes(8) + 1 + 1 + 1 + 4 + optionalBytes(4) + 1 + 1 + 1 + 1 + optionalBytes(4) + 1 + 1 + optionalBytes(8) + optionalBytes(8) + AUDIT_BYTES, growth: 'unbounded', category: 'tournament' },
  { name: 'tournament_participant', vis: 'public', bytes: 4 + 4 + optionalBytes(4) + 1 + 1 + optionalBytes(4) + optionalBytes(strBytes('medium')) + 1 + optionalBytes(8) + optionalBytes(4) + AUDIT_BYTES, growth: 'unbounded', category: 'tournament' },
  { name: 'tournament_assistant', vis: 'public', bytes: 4 + 4 + 1 + 1 + 1 + 1 + 1 + AUDIT_BYTES, growth: 'unbounded', category: 'tournament' },
  { name: 'tournament_team', vis: 'public', bytes: 4 + 4 + strBytes('medium') + 4 + AUDIT_BYTES, growth: 'unbounded', category: 'tournament' },
  { name: 'tournament_team_request', vis: 'public', bytes: 4 + 4 + AUDIT_BYTES, growth: 'transient', category: 'tournament' },
  { name: 'bracket_match', vis: 'public', bytes: 4 + 4 + 4 + 4 + 1 + optionalBytes(4) + optionalBytes(4) + optionalBytes(4) + optionalBytes(4) + optionalBytes(4) + 1 + 1 + 1 + optionalBytes(8) + optionalBytes(4) + 1 + optionalBytes(4) + 1 + AUDIT_BYTES, growth: 'unbounded', category: 'tournament' },
  { name: 'group_standing', vis: 'public', bytes: 4 + 4 + 4 + 4 + 4 + 4 + 4 + AUDIT_BYTES, growth: 'unbounded', category: 'tournament' },

  // --- Calendar (bounded by users, slots grow slowly) ---
  { name: 'availability_slot', vis: 'public', bytes: 4 + 4 + 8 + 8 + 1 + 15 + 8 + AUDIT_BYTES, growth: 'bounded', category: 'calendar' },
  { name: 'saved_calendar', vis: 'public', bytes: 4 + 4 + 1 + AUDIT_BYTES, growth: 'bounded', category: 'calendar' },
  { name: 'calendar_event', vis: 'public', bytes: 4 + 4 + strBytes('medium') + 8 + 8 + optionalBytes(4) + AUDIT_BYTES, growth: 'unbounded', category: 'calendar' },
  { name: 'calendar_event_invite', vis: 'public', bytes: 4 + 4 + AUDIT_BYTES, growth: 'transient', category: 'calendar' },

  // --- Persistent Teams (OUT OF SCOPE but tables exist) ---
  { name: 'team', vis: 'public', bytes: 4 + strBytes('medium') + 4 + 1 + optionalBytes(4) + AUDIT_BYTES, growth: 'static', category: 'unused' },
  { name: 'team_member', vis: 'public', bytes: 4 + 4 + 1 + AUDIT_BYTES, growth: 'static', category: 'unused' },
  { name: 'team_invite', vis: 'public', bytes: 4 + 4 + 4 + 4 + 1 + AUDIT_BYTES, growth: 'static', category: 'unused' },

  // --- System ---
  { name: 'server_identity', vis: 'private', bytes: 32 + 8, growth: 'static', category: 'system' },
  { name: 'user_deletion_job', vis: 'private', bytes: 8 + 9 + 4 + AUDIT_BYTES, growth: 'transient', category: 'system' },
  { name: 'lobby_cursor_event', vis: 'public_event', bytes: 4 + 4 + 4 + 4 + 8 + AUDIT_BYTES, growth: 'transient', category: 'system' },
];

// ─── Scenarios ──────────────────────────────────────────────────────────────
const SCENARIOS = {
  current: {
    label: 'Current (baseline)',
    users: 100,
    concurrent: 20,
    matchesPerDay: 10,
    tournamentsPerMonth: 2,
    avgParticipantsPerTournament: 24,
    avgBracketMatchesPerTournament: 15,
    avgDraftStepsPerMatch: 30,
    avgChatMessagesPerMatch: 15,
    avgGamesPerMatch: 3,    // best-of-5 average
    costSetsCreated: 2,     // per month
    avgCursorEventsPerSecond: 5, // per active user in lobby
    avgLobbyDurationMinutes: 30,
    avgCalendarSlotsPerUser: 5,
    avgAchievementsPerUser: 3,
    charactersOwned: 50,    // avg per HSR account
    lightconesOwned: 40,    // avg per HSR account
  },
  growth: {
    label: 'Growth (3x baseline)',
    users: 300,
    concurrent: 60,
    matchesPerDay: 30,
    tournamentsPerMonth: 6,
    avgParticipantsPerTournament: 72,
    avgBracketMatchesPerTournament: 45,
    avgDraftStepsPerMatch: 30,
    avgChatMessagesPerMatch: 15,
    avgGamesPerMatch: 3,
    costSetsCreated: 6,
    avgCursorEventsPerSecond: 5,
    avgLobbyDurationMinutes: 30,
    avgCalendarSlotsPerUser: 5,
    avgAchievementsPerUser: 3,
    charactersOwned: 50,
    lightconesOwned: 40,
  },
  peak: {
    label: 'Peak (5x baseline)',
    users: 500,
    concurrent: 100,
    matchesPerDay: 50,
    tournamentsPerMonth: 10,
    avgParticipantsPerTournament: 120,
    avgBracketMatchesPerTournament: 75,
    avgDraftStepsPerMatch: 30,
    avgChatMessagesPerMatch: 15,
    avgGamesPerMatch: 3,
    costSetsCreated: 10,
    avgCursorEventsPerSecond: 5,
    avgLobbyDurationMinutes: 30,
    avgCalendarSlotsPerUser: 5,
    avgAchievementsPerUser: 3,
    charactersOwned: 50,
    lightconesOwned: 40,
  },
};

// ─── Row Count Estimator ────────────────────────────────────────────────────

function estimateRowCounts(s, months) {
  const matchesTotal = s.matchesPerDay * 30 * months;
  const tournamentsTotal = s.tournamentsPerMonth * months;
  const bracketMatchesTotal = tournamentsTotal * s.avgBracketMatchesPerTournament;
  const participantsTotal = tournamentsTotal * s.avgParticipantsPerTournament;
  const gameModes = 3;
  const characters = 82;
  const lightcones = 156;

  return {
    // Static
    hsr_character: characters,
    hsr_lightcone: lightcones,
    archetype: 15,
    hsr_character_archetype: characters * 2,  // avg 2 archetypes per character
    achievement: 30,

    // Cost data (default set + custom sets)
    hsr_character_cost: characters * gameModes * (1 + s.costSetsCreated * months),
    hsr_lightcone_cost: lightcones * gameModes * (1 + s.costSetsCreated * months),
    hsr_synergy_cost: 20 * gameModes * (1 + s.costSetsCreated * months),
    cost_set: 1 + s.costSetsCreated * months,

    // Draft tables (transient — avg 1 active at a time)
    cost_set_draft_character: characters * 1, // 1 draft at a time
    cost_set_draft_lightcone: lightcones * 1,
    cost_set_draft_synergy: 20,

    // Users
    user: s.users,
    user_identity: s.users,
    hsr_account: s.users * 1.2,  // some users have 2 accounts
    hsr_account_character: s.users * s.charactersOwned,
    hsr_account_lightcone: s.users * s.lightconesOwned,
    player_stats: s.users,
    character_stats: s.users * 20,  // avg 20 characters played per user
    mmr_rating: s.users * gameModes,
    user_achievement: s.users * s.avgAchievementsPerUser,

    // Lobby (transient — only concurrent lobbies exist at once)
    lobby: Math.ceil(s.concurrent / 4), // avg 4 people per lobby
    lobby_member: s.concurrent,
    lobby_password: Math.ceil(s.concurrent / 8), // ~50% of lobbies passworded
    match_session: Math.ceil(s.concurrent / 4),
    match_session_step: Math.ceil(s.concurrent / 4) * s.avgDraftStepsPerMatch,
    chat_message: Math.ceil(s.concurrent / 4) * s.avgChatMessagesPerMatch,

    // Match History (unbounded)
    match_session_history: matchesTotal,
    match_session_step_history: matchesTotal,
    match_result_record: matchesTotal,
    match_result_game: matchesTotal * s.avgGamesPerMatch,
    mmr_history: matchesTotal * 2 * gameModes * 0.6, // 60% are ranked, 2 players

    // Tournament (unbounded)
    tournament: tournamentsTotal,
    tournament_participant: participantsTotal,
    tournament_assistant: tournamentsTotal * 2, // avg 2 assistants
    tournament_team: tournamentsTotal * (s.avgParticipantsPerTournament / 4), // avg teams
    tournament_team_request: 0, // transient
    bracket_match: bracketMatchesTotal,
    group_standing: tournamentsTotal * s.avgParticipantsPerTournament * 0.3, // 30% have groups

    // Calendar
    availability_slot: s.users * s.avgCalendarSlotsPerUser,
    saved_calendar: s.users * 3, // avg 3 calendars saved
    calendar_event: tournamentsTotal * s.avgBracketMatchesPerTournament + months * 30, // tournament + ad-hoc
    calendar_event_invite: 0, // transient

    // Unused (empty or 1 row)
    team: 0,
    team_member: 0,
    team_invite: 0,

    // System
    server_identity: 1,
    user_deletion_job: 0,
    lobby_cursor_event: 0, // event table, never persisted
  };
}

// ─── Egress Estimator ───────────────────────────────────────────────────────

function estimateMonthlyEgress(s, rowCounts) {
  // Egress = initial subscription payloads + ongoing update broadcasts
  // For public tables: every subscriber gets every insert/update/delete
  // Key insight: egress scales with (subscribers × updates × row_size)

  let totalEgressBytes = 0;
  const details = {};

  // --- Initial subscription load per new connection ---
  // Each user connects once per session, subscribes to public tables
  const sessionsPerMonth = s.users * 30; // ~1 session per day per user
  let initialLoadBytes = 0;

  for (const t of TABLES) {
    if (t.vis === 'private' || t.vis === 'public_event' || t.category === 'unused') continue;
    const rows = rowCounts[t.name] || 0;
    initialLoadBytes += rows * t.bytes;
  }
  const initialLoadEgress = sessionsPerMonth * initialLoadBytes;
  details['Initial subscription load'] = initialLoadEgress;
  totalEgressBytes += initialLoadEgress;

  // --- Ongoing broadcasts for row changes ---
  const monthlyMatches = s.matchesPerDay * 30;

  // Cursor events (highest frequency): ~5/sec × concurrent users × lobby duration
  // Each event broadcast to all lobby members (~4-6 people)
  const cursorEventsPerMonth = s.concurrent * s.avgCursorEventsPerSecond * s.avgLobbyDurationMinutes * 60 * 30;
  // But only active during matches — scale by duty cycle (matches take ~20min, 24h in day)
  const cursorDutyCycle = Math.min(1, (monthlyMatches * s.avgLobbyDurationMinutes) / (30 * 24 * 60));
  const cursorBroadcasts = cursorEventsPerMonth * cursorDutyCycle * 5; // avg 5 recipients
  const cursorEventSize = 4 + 4 + 4 + 4 + 8; // lobbyId + userId + x + y + timestamp
  details['Cursor events'] = cursorBroadcasts * cursorEventSize;
  totalEgressBytes += cursorBroadcasts * cursorEventSize;

  // Draft steps: ~30 per match, broadcast to ~5 lobby members
  const draftBroadcasts = monthlyMatches * s.avgDraftStepsPerMatch * 5;
  details['Draft step broadcasts'] = draftBroadcasts * 70; // ~70 bytes per step
  totalEgressBytes += draftBroadcasts * 70;

  // Chat messages: broadcast to lobby members
  const chatBroadcasts = monthlyMatches * s.avgChatMessagesPerMatch * 5;
  details['Chat broadcasts'] = chatBroadcasts * strBytes('long');
  totalEgressBytes += chatBroadcasts * strBytes('long');

  // MatchSession updates (timer state changes): ~every 30 seconds during match
  const timerUpdates = monthlyMatches * (s.avgLobbyDurationMinutes * 2) * 5;
  const matchSessionSize = 250; // rough size of full MatchSession row
  details['Match session updates'] = timerUpdates * matchSessionSize;
  totalEgressBytes += timerUpdates * matchSessionSize;

  // User online/offline toggles: each connect/disconnect updates User.isOnline
  const userToggles = sessionsPerMonth * 2; // connect + disconnect
  const userRowSize = 150; // approximate
  const userToggleBroadcast = userToggles * s.concurrent * 0.5; // ~50% of concurrent users see it
  details['User online/offline'] = userToggleBroadcast * userRowSize;
  totalEgressBytes += userToggleBroadcast * userRowSize;

  // Tournament/match result updates (lower frequency)
  const tournamentUpdates = s.tournamentsPerMonth * s.avgBracketMatchesPerTournament * 3; // 3 updates per bracket match
  details['Tournament updates'] = tournamentUpdates * s.users * 100; // broadcast to all users
  totalEgressBytes += tournamentUpdates * s.users * 100;

  return { totalBytes: totalEgressBytes, details };
}

// ─── Reducer Call Estimator ─────────────────────────────────────────────────

function estimateMonthlyReducerCalls(s) {
  const details = {};
  let total = 0;

  const monthlyMatches = s.matchesPerDay * 30;

  // Login/profile: ~1 per user per day
  details['Auth (login/profile)'] = s.users * 30;
  total += s.users * 30;

  // Cursor broadcasts: highest volume
  const cursorDutyCycle = Math.min(1, (monthlyMatches * s.avgLobbyDurationMinutes) / (30 * 24 * 60));
  details['Cursor broadcasts'] = Math.round(s.concurrent * s.avgCursorEventsPerSecond * s.avgLobbyDurationMinutes * 60 * 30 * cursorDutyCycle);
  total += details['Cursor broadcasts'];

  // Draft actions: picks, bans, etc
  details['Draft actions'] = monthlyMatches * s.avgDraftStepsPerMatch;
  total += details['Draft actions'];

  // Chat messages
  details['Chat messages'] = monthlyMatches * s.avgChatMessagesPerMatch;
  total += details['Chat messages'];

  // Match results (confirm, submit, etc): ~5 calls per match
  details['Match result calls'] = monthlyMatches * 5;
  total += details['Match result calls'];

  // Roster management: ~2 per user per month
  details['Roster management'] = s.users * 2;
  total += details['Roster management'];

  // Tournament operations: create + registration + management
  details['Tournament operations'] = s.tournamentsPerMonth * (s.avgParticipantsPerTournament * 2 + 20);
  total += details['Tournament operations'];

  // Cost set operations
  details['Cost set operations'] = s.costSetsCreated * 200; // clone = many inserts
  total += details['Cost set operations'];

  // Calendar
  details['Calendar operations'] = s.users * 5;
  total += details['Calendar operations'];

  // Connect/disconnect lifecycle
  details['Connection lifecycle'] = s.users * 30 * 2;
  total += details['Connection lifecycle'];

  return { total, details };
}

// ─── Report Generator ───────────────────────────────────────────────────────

function generateReport(scenarioName, months) {
  const s = SCENARIOS[scenarioName];
  if (!s) {
    console.error(`Unknown scenario: ${scenarioName}. Available: ${Object.keys(SCENARIOS).join(', ')}`);
    process.exit(1);
  }

  const rowCounts = estimateRowCounts(s, months);
  const egress = estimateMonthlyEgress(s, rowCounts);
  const reducers = estimateMonthlyReducerCalls(s);

  // Storage
  let totalStorageBytes = 0;
  const storageByCategory = {};
  const storageByTable = [];

  for (const t of TABLES) {
    const rows = rowCounts[t.name] || 0;
    const tableBytes = rows * t.bytes;
    totalStorageBytes += tableBytes;

    if (!storageByCategory[t.category]) storageByCategory[t.category] = 0;
    storageByCategory[t.category] += tableBytes;

    if (tableBytes > 0) {
      storageByTable.push({ name: t.name, rows, bytesPerRow: t.bytes, totalBytes: tableBytes, growth: t.growth, vis: t.vis });
    }
  }

  storageByTable.sort((a, b) => b.totalBytes - a.totalBytes);

  // Energy calculations
  const storageGB = totalStorageBytes / (1024 ** 3);
  const egressGB = egress.totalBytes / (1024 ** 3);
  const reducerMillions = reducers.total / 1_000_000;

  const storageEnergy = storageGB * ENERGY.PER_1GB_STORAGE;
  const egressEnergy = (egressGB / 10) * ENERGY.PER_10GB_EGRESS;
  const reducerEnergy = reducerMillions * ENERGY.PER_1M_REDUCER_CALLS;
  const totalEnergy = storageEnergy + egressEnergy + reducerEnergy;

  // Output
  console.log('\n' + '═'.repeat(70));
  console.log(`  SPACETIMEDB ENERGY MODEL — ${s.label}`);
  console.log(`  Projection: ${months} month(s)`);
  console.log('═'.repeat(70));

  console.log('\n── Assumptions ──────────────────────────────────────────────────');
  console.log(`  Users: ${s.users} | Concurrent: ${s.concurrent} | Matches/day: ${s.matchesPerDay}`);
  console.log(`  Tournaments/month: ${s.tournamentsPerMonth} | Avg participants: ${s.avgParticipantsPerTournament}`);
  console.log(`  Cost sets/month: ${s.costSetsCreated} | Chat msgs/match: ${s.avgChatMessagesPerMatch}`);

  console.log('\n── Energy Budget ────────────────────────────────────────────────');
  console.log(`  ${'Resource'.padEnd(25)} ${'Amount'.padEnd(15)} ${'Energy'.padEnd(10)} ${'% Budget'.padEnd(10)}`);
  console.log(`  ${'─'.repeat(60)}`);
  console.log(`  ${'Storage'.padEnd(25)} ${storageGB.toFixed(3).padEnd(15)}GB ${Math.round(storageEnergy).toString().padEnd(10)} ${((storageEnergy / ENERGY.MONTHLY_BUDGET) * 100).toFixed(1).padEnd(10)}%`);
  console.log(`  ${'Egress'.padEnd(25)} ${egressGB.toFixed(2).padEnd(15)}GB ${Math.round(egressEnergy).toString().padEnd(10)} ${((egressEnergy / ENERGY.MONTHLY_BUDGET) * 100).toFixed(1).padEnd(10)}%`);
  console.log(`  ${'Reducer calls'.padEnd(25)} ${(reducerMillions).toFixed(2).padEnd(15)}M ${Math.round(reducerEnergy).toString().padEnd(10)} ${((reducerEnergy / ENERGY.MONTHLY_BUDGET) * 100).toFixed(1).padEnd(10)}%`);
  console.log(`  ${'─'.repeat(60)}`);
  console.log(`  ${'TOTAL'.padEnd(25)} ${''.padEnd(15)} ${Math.round(totalEnergy).toString().padEnd(10)} ${((totalEnergy / ENERGY.MONTHLY_BUDGET) * 100).toFixed(1).padEnd(10)}%`);
  console.log(`  ${'Budget'.padEnd(25)} ${''.padEnd(15)} ${ENERGY.MONTHLY_BUDGET.toString().padEnd(10)} 100.0%`);
  console.log(`  ${'Headroom'.padEnd(25)} ${''.padEnd(15)} ${Math.round(ENERGY.MONTHLY_BUDGET - totalEnergy).toString().padEnd(10)} ${(((ENERGY.MONTHLY_BUDGET - totalEnergy) / ENERGY.MONTHLY_BUDGET) * 100).toFixed(1).padEnd(10)}%`);

  if (totalEnergy > ENERGY.MONTHLY_BUDGET) {
    console.log(`\n  ⚠  OVER BUDGET by ${Math.round(totalEnergy - ENERGY.MONTHLY_BUDGET)} energy`);
  }

  console.log('\n── Storage Breakdown by Category ────────────────────────────────');
  const catEntries = Object.entries(storageByCategory).sort((a, b) => b[1] - a[1]);
  for (const [cat, bytes] of catEntries) {
    if (bytes === 0) continue;
    const mb = bytes / (1024 ** 2);
    console.log(`  ${cat.padEnd(20)} ${mb.toFixed(2).padStart(10)} MB  (${((bytes / totalStorageBytes) * 100).toFixed(1)}%)`);
  }

  console.log('\n── Top 15 Tables by Storage ─────────────────────────────────────');
  console.log(`  ${'Table'.padEnd(32)} ${'Rows'.padEnd(10)} ${'B/Row'.padEnd(8)} ${'Total MB'.padEnd(12)} ${'Growth'.padEnd(12)} ${'Vis'}`);
  console.log(`  ${'─'.repeat(82)}`);
  for (const t of storageByTable.slice(0, 15)) {
    const mb = t.totalBytes / (1024 ** 2);
    console.log(`  ${t.name.padEnd(32)} ${t.rows.toString().padEnd(10)} ${t.bytesPerRow.toString().padEnd(8)} ${mb.toFixed(3).padEnd(12)} ${t.growth.padEnd(12)} ${t.vis}`);
  }

  console.log('\n── Egress Breakdown ─────────────────────────────────────────────');
  const egressEntries = Object.entries(egress.details).sort((a, b) => b[1] - a[1]);
  for (const [label, bytes] of egressEntries) {
    const gb = bytes / (1024 ** 3);
    console.log(`  ${label.padEnd(30)} ${gb.toFixed(3).padStart(10)} GB  (${((bytes / egress.totalBytes) * 100).toFixed(1)}%)`);
  }

  console.log('\n── Reducer Calls Breakdown ──────────────────────────────────────');
  const reducerEntries = Object.entries(reducers.details).sort((a, b) => b[1] - a[1]);
  for (const [label, count] of reducerEntries) {
    const k = count / 1000;
    console.log(`  ${label.padEnd(30)} ${k.toFixed(1).padStart(10)}K  (${((count / reducers.total) * 100).toFixed(1)}%)`);
  }

  console.log('\n── Storage Growth Projection ────────────────────────────────────');
  console.log(`  ${'Month'.padEnd(8)} ${'Storage MB'.padEnd(14)} ${'Storage Energy'.padEnd(16)} ${'Cumul % Budget'}`);
  console.log(`  ${'─'.repeat(55)}`);
  for (let m = 1; m <= Math.min(months, 12); m++) {
    const rc = estimateRowCounts(s, m);
    let mBytes = 0;
    for (const t of TABLES) {
      mBytes += (rc[t.name] || 0) * t.bytes;
    }
    const mGB = mBytes / (1024 ** 3);
    const mEnergy = mGB * ENERGY.PER_1GB_STORAGE;
    const mTotal = mEnergy + egressEnergy + reducerEnergy; // egress/reducers assumed steady
    console.log(`  ${('M' + m).padEnd(8)} ${(mBytes / (1024 ** 2)).toFixed(2).padEnd(14)} ${Math.round(mEnergy).toString().padEnd(16)} ${((mTotal / ENERGY.MONTHLY_BUDGET) * 100).toFixed(1)}%`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('');
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let scenario = 'current';
  let months = 6;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scenario' && args[i + 1]) scenario = args[++i];
    if (args[i] === '--months' && args[i + 1]) months = parseInt(args[++i]);
    if (args[i] === '--users' && args[i + 1]) {
      if (scenario === 'current') scenario = 'custom';
      if (!SCENARIOS.custom) SCENARIOS.custom = { ...SCENARIOS.current, label: 'Custom' };
      SCENARIOS.custom.users = parseInt(args[++i]);
    }
    if (args[i] === '--matches-per-day' && args[i + 1]) {
      if (!SCENARIOS.custom) SCENARIOS.custom = { ...SCENARIOS.current, label: 'Custom' };
      SCENARIOS.custom.matchesPerDay = parseInt(args[++i]);
      scenario = 'custom';
    }
    if (args[i] === '--concurrent' && args[i + 1]) {
      if (!SCENARIOS.custom) SCENARIOS.custom = { ...SCENARIOS.current, label: 'Custom' };
      SCENARIOS.custom.concurrent = parseInt(args[++i]);
      scenario = 'custom';
    }
    if (args[i] === '--all') {
      for (const name of Object.keys(SCENARIOS)) {
        generateReport(name, months);
      }
      return;
    }
    if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
SpacetimeDB Energy Budget Model

Usage:
  node tools/energy-model.js [options]

Options:
  --scenario <name>      Scenario: current, growth, peak (default: current)
  --months <n>           Projection months (default: 6)
  --users <n>            Override user count
  --matches-per-day <n>  Override daily matches
  --concurrent <n>       Override concurrent users
  --all                  Run all scenarios
  --help                 Show this help

Examples:
  node tools/energy-model.js
  node tools/energy-model.js --scenario growth --months 12
  node tools/energy-model.js --users 200 --matches-per-day 30 --months 12
  node tools/energy-model.js --all
`);
      return;
    }
  }

  generateReport(scenario, months);
}

parseArgs();
