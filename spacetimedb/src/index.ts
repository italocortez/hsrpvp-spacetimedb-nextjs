import spacetimedb from './schema';

import './reducers/cursor';
import './reducers/auth';

spacetimedb.clientConnected((ctx) => {
  console.log(`Client connected: ${ctx.sender.toHexString()}`);
});

spacetimedb.clientDisconnected((ctx) => {
  console.log(`Client disconnected: ${ctx.sender.toHexString()}`);
});

export default spacetimedb;