import spacetimedb from './schema';
import { auditUpdate, SYSTEM_USER_ID } from './helpers/auditColumns';
export { broadcast_cursor } from './reducers/cursor';
export { login_as_guest } from './reducers/auth';
export { delete_guest_account, update_display_name, update_username, update_avatar } from './reducers/profile';
export { register_server, server_link_discord, server_set_role, server_delete_user } from './reducers/server';
export { admin_delete_row, admin_bulk_upsert, admin_update_user } from './reducers/admin';
export { run_user_deletion } from './reducers/userDeletion';

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
