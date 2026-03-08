import spacetimedb from './schema';
export { register_guest, register_discord_user } from './reducers/auth';
export { broadcast_cursor } from './reducers/cursor';

spacetimedb.clientConnected((ctx) => {
  console.log(`Client connected: ${ctx.sender.toHexString()}`);
});

spacetimedb.clientDisconnected((ctx) => {
  console.log(`Client disconnected: ${ctx.sender.toHexString()}`);
});

export default spacetimedb;