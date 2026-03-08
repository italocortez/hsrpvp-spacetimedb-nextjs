import spacetimedb from './schema';
export { broadcast_cursor } from './reducers/cursor';
export { login_as_guest, register_discord_user, delete_guest_account, update_display_name, update_username, update_avatar } from './reducers/auth';

spacetimedb.clientConnected((ctx) => {
  console.log(`Client connected: ${ctx.sender.toHexString()}`);
});

spacetimedb.clientDisconnected((ctx) => {
  console.log(`Client disconnected: ${ctx.sender.toHexString()}`);
});

export default spacetimedb;