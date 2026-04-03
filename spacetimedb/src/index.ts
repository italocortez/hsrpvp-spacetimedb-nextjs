import spacetimedb from './schema';
import { auditInsert, auditUpdate, SYSTEM_USER_ID } from './helpers/auditColumns';
import { transferCaptain, transferReferee, transferHost } from './helpers/flagTransferHelpers';

// Security views — must be imported so they register with the module
import './views/securityViews';
// Anonymous + history views — imported so they register with the module
import './views/anonymousViews';
export { broadcast_cursor } from './reducers/cursor';
export { login_as_guest } from './reducers/auth';
export { delete_guest_account, update_display_name, update_username, update_avatar } from './reducers/profile';
export { register_server, server_link_discord, server_set_role, server_delete_user, server_set_mmr } from './reducers/server';
export { admin_delete_row, admin_bulk_upsert, admin_update_user } from './reducers/admin';
export { admin_update_elo_config, admin_seed_elo_config } from './reducers/eloAdmin';
export { run_user_deletion } from './reducers/userDeletion';
export { create_hsr_account, update_hsr_account, set_active_hsr_account, delete_hsr_account, batch_upsert_characters, batch_remove_characters, migrate_roster } from './reducers/roster';
export { admin_create_hsr_account, admin_update_hsr_account, admin_delete_hsr_account, admin_batch_upsert_characters, admin_batch_remove_characters, admin_upsert_archetype, admin_delete_archetype, admin_assign_character_archetypes, admin_remove_character_archetypes } from './reducers/rosterAdmin';
export { create_cost_set, edit_draft_character_cost, edit_draft_lightcone_cost, edit_draft_synergy_cost, publish_cost_set, lock_cost_set, unpublish_cost_set, delete_cost_set } from './reducers/costSetManagement';
export { create_tournament, update_tournament, advance_tournament_stage, cancel_tournament } from './reducers/tournamentManagement';
export { register_for_tournament, withdraw_from_tournament, approve_participant, waitlist_promote } from './reducers/tournamentRegistration';
export { create_tournament_team, request_join_team, accept_team_request, reject_team_request, leave_tournament_team, disband_tournament_team } from './reducers/tournamentTeams';
export { transfer_referee, reclaim_referee } from './reducers/refereeManagement';
export { confirm_match_scores, submit_match_result, dispute_match_result } from './reducers/matchResultSubmission';
export { record_game_scores } from './reducers/scoreEntry';
export { dq_participant, override_match_result, assign_tournament_assistant, remove_tournament_assistant, mod_promote_to_host, mod_demote_from_host } from './reducers/tournamentAdmin';
export { generate_bracket, seed_bracket, swap_seeds } from './reducers/bracketGeneration';
export { advance_bracket_match, submit_and_advance_bracket, rollback_bracket_match, advance_group_to_elimination } from './reducers/bracketAdvancement';
export { finalize_match_result, process_tournament_mmr } from './reducers/matchFinalization';
export { create_season, set_active_season } from './reducers/seasonAdmin';
export { create_achievement, update_achievement, delete_achievement, add_achievement_criteria, remove_achievement_criteria, manual_award_achievement, set_displayed_achievement } from './reducers/achievementManagement';
export { create_availability_slot, update_availability_slot, delete_availability_slot } from './reducers/calendarAvailability';
export { save_calendar, unsave_calendar, toggle_calendar_visibility } from './reducers/calendarSaved';
export { create_calendar_event, update_calendar_event, delete_calendar_event, invite_to_event, remove_invite } from './reducers/calendarEvents';
export { respond_to_invite } from './reducers/calendarInviteResponse';
export { create_lobby, join_lobby, leave_lobby, close_lobby, kick_member, ban_member } from './reducers/lobbyLifecycle';
export { send_chat_message, delete_chat_message } from './reducers/chat';
export { update_lobby_settings, set_team_slot, confirm_ready, unconfirm_ready, set_captain } from './reducers/lobbySettings';
export { create_lobby_preset, update_lobby_preset, delete_lobby_preset } from './reducers/lobbyPresets';
export { create_tournament_lobby, approve_stand_in } from './reducers/tournamentLobby';
export { run_lobby_gc } from './reducers/lobbyGc';
export { start_draft, pick_character, ban_character, timer_expiry_classic } from './reducers/draftClassic';
export { undo_last_step, pause_draft, resume_draft } from './reducers/draftControl';
export { nominate_character, place_bid, pass_bid, timer_expiry_auction } from './reducers/draftAuction';
export { equip_lightcone, arrange_lineup, confirm_lineup, advance_stage } from './reducers/postDraft';
export { concede_match, claim_forfeit, defer_match } from './reducers/concede';

spacetimedb.clientConnected((ctx) => {
  console.log(`Client connected: ${ctx.sender.toHexString()}`);

  // Set isOnline = true for the connected user
  const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
  if (mapping) {
    const user = ctx.db.User.id.find(mapping.userId);
    if (user) {
      ctx.db.User.id.update({
        ...user,
        isOnline: true,
        ...auditUpdate(ctx, user, user.id),
      });
    }
  }
});

spacetimedb.clientDisconnected((ctx) => {
  console.log(`Client disconnected: ${ctx.sender.toHexString()}`);

  // Set isOnline = false for the disconnected user
  const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
  if (!mapping) return;
  const userId = mapping.userId;

  const user = ctx.db.User.id.find(userId);
  if (user) {
    ctx.db.User.id.update({
      ...user,
      isOnline: false,
      ...auditUpdate(ctx, user, userId),
    });
  }

  // Handle lobby member disconnect tracking (D-01, D-08, D-72, D-73)
  const memberships = [...ctx.db.LobbyMember.user_id.filter(userId)];
  for (const member of memberships) {
    const lobby = ctx.db.Lobby.id.find(member.lobbyId);
    if (!lobby) continue;

    // Only process active stages (Drafting/Equipping/Scoring)
    const stageTag = lobby.stage.tag;
    if (stageTag !== 'Drafting' && stageTag !== 'Equipping' && stageTag !== 'Scoring') {
      // For Waiting/AwaitingResult/Finished: just set isOnline=false
      ctx.db.LobbyMember.by_lobby_and_user.delete([member.lobbyId, userId]);
      ctx.db.LobbyMember.insert({
        ...member,
        isOnline: false,
        ...auditUpdate(ctx, member, SYSTEM_USER_ID),
      } as any);
      continue;
    }

    // NoAction policy: tracking only, no pool/pause (D-23, D-25)
    if (lobby.disconnectPolicy.tag === 'NoAction') {
      ctx.db.LobbyMember.by_lobby_and_user.delete([member.lobbyId, userId]);
      ctx.db.LobbyMember.insert({
        ...member,
        isOnline: false,
        ...auditUpdate(ctx, member, SYSTEM_USER_ID),
      } as any);
      continue;
    }

    // Standard/Deferred: set disconnectedAt, isOnline=false (D-08)
    ctx.db.LobbyMember.by_lobby_and_user.delete([member.lobbyId, userId]);
    ctx.db.LobbyMember.insert({
      ...member,
      isOnline: false,
      disconnectedAt: ctx.timestamp,
      ...auditUpdate(ctx, member, SYSTEM_USER_ID),
    } as any);

    // Transfer captain/referee/host flags (D-34, D-35, D-36) — permanent
    transferCaptain(ctx, member.lobbyId, userId);
    transferReferee(ctx, member.lobbyId, userId);
    transferHost(ctx, member.lobbyId, lobby, userId);

    // Auto-pause if match session is not already paused (D-08)
    if (stageTag === 'Drafting') {
      const session = ctx.db.MatchSession.lobbyId.find(member.lobbyId);
      if (session && !session.timerState.isPaused) {
        ctx.db.MatchSessionStep.insert({
          id: 0,
          lobbyId: member.lobbyId,
          sequence: session.turnIndex,
          actorUserId: SYSTEM_USER_ID,
          anonymousLabel: undefined,
          actorSlot: member.lobbySlot,
          action: { tag: 'Pause', value: {} },
          payload: { tag: 'Pause', value: { isAutoPause: true, accumulatedPauseMs: session.timerState.accumulatedPauseMs ?? 0 } },
          timestamp: ctx.timestamp,
          ...auditInsert(ctx, SYSTEM_USER_ID),
        } as any);
        ctx.db.MatchSession.lobbyId.update({
          ...session,
          timerState: {
            ...session.timerState,
            isPaused: true,
          },
          ...auditUpdate(ctx, session, SYSTEM_USER_ID),
        } as any);
      }
    }

    console.log(`[DISCONNECT] User #${userId} disconnected from lobby #${member.lobbyId} (stage: ${stageTag})`);
  }
});

export default spacetimedb;
