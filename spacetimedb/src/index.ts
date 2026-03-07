import spacetimedb from './schema';
import { Role } from './types/enums';
import './reducers/cursor';

spacetimedb.clientConnected((ctx) => {
  // 1. Check if user exists (use Identity, not String ID)
  const existingUser = ctx.db.User.identity.find(ctx.sender);

  if (existingUser) {
    // 2a. Update existing user's last login
    ctx.db.User.identity.update({
      ...existingUser,
      lastLoginAt: ctx.timestamp,
    });
  } else {
    // 2b. Create new Guest User
    // We use the first 8 characters of the identity hex string for a unique Guest ID
    const shortId = ctx.sender.toHexString().substring(0, 8);
    const guestName = `Guest-${shortId}`;

    // Ensure we insert using the correct schema
    ctx.db.User.insert({
      identity: ctx.sender,
      username: guestName,
      displayName: guestName,
      isGuest: true,
      lastLoginAt: ctx.timestamp,
      role: Role.User,
      discordId: undefined,
      avatarCharacterName: "march7th",
    });
  }
});

spacetimedb.clientDisconnected((ctx) => {
  // Disconnect logic goes here
});


// The compiler needs this export to generate the database structure.
export default spacetimedb;