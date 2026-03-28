import spacetimedb from './schema';
import { auditUpdate, SYSTEM_USER_ID } from './helpers/auditColumns';

// Security views — must be imported so they register with the module
import './views/securityViews';
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
export { transfer_referee, reclaim_referee, set_coach, remove_coach } from './reducers/refereeManagement';
export { confirm_match_scores, submit_match_result, dispute_match_result } from './reducers/matchResultSubmission';
export { record_game_scores } from './reducers/scoreEntry';
export { dq_participant, override_match_result, assign_tournament_assistant, remove_tournament_assistant, mod_promote_to_host, mod_demote_from_host } from './reducers/tournamentAdmin';
export { generate_bracket, seed_bracket, swap_seeds } from './reducers/bracketGeneration';
export { advance_bracket_match, submit_and_advance_bracket, rollback_bracket_match } from './reducers/bracketAdvancement';
export { finalize_match_result, process_tournament_mmr } from './reducers/matchFinalization';
export { create_season, set_active_season } from './reducers/seasonAdmin';
export { create_achievement, update_achievement, delete_achievement, add_achievement_criteria, remove_achievement_criteria, manual_award_achievement, set_displayed_achievement } from './reducers/achievementManagement';

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
  if (mapping) {
    const user = ctx.db.User.id.find(mapping.userId);
    if (user) {
      ctx.db.User.id.update({
        ...user,
        isOnline: false,
        ...auditUpdate(ctx, user, user.id),
      });
    }
  }
});

export default spacetimedb;
