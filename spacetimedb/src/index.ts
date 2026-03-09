import spacetimedb from './schema';
export { broadcast_cursor } from './reducers/cursor';
export { login_as_guest } from './reducers/auth';
export { delete_guest_account, update_display_name, update_username, update_avatar } from './reducers/profile';
export { register_server, server_link_discord, server_promote_admin } from './reducers/server';
export { admin_delete_row, admin_bulk_upsert, admin_update_user } from './reducers/admin';

spacetimedb.clientConnected((ctx) => {
  console.log(`Client connected: ${ctx.sender.toHexString()}`);
});

spacetimedb.clientDisconnected((ctx) => {
  console.log(`Client disconnected: ${ctx.sender.toHexString()}`);
});

export default spacetimedb;