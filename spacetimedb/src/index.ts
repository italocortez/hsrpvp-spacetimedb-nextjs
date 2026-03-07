import spacetimedb from './schema';
import { Role } from './types/enums';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE ENTRYPOINT
// ─────────────────────────────────────────────────────────────────────────────
// This file bundles the SpacetimeDB module. 
// It must import the schema and any files containing reducers.

// TODO: As you create reducer files, import them here to register them:
// import './reducers/admin';
// import './reducers/lobby';
// import './reducers/draft';

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

spacetimedb.clientConnected((ctx) => {
  // 1. Check if user exists
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

    ctx.db.User.insert({
      identity: ctx.sender,
      username: guestName,
      displayName: guestName, // Default display name matches username
      isGuest: true,
      lastLoginAt: ctx.timestamp,
      role: Role.User,        // Default role
      discordId: undefined,   // No Discord ID for guests
      avatarCharacterName: "march7th",
    });
  }
});

spacetimedb.clientDisconnected((ctx) => {
  // Note: We don't track "Online/Offline" in the User table itself 
  // (that is handled per-lobby in LobbyMember), so we don't need logic here yet.
  // 
  // However, if we wanted to mark a global "Offline" status, we would do it here.
});