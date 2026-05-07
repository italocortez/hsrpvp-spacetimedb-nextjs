import type { EventContext } from '@/src/module_bindings';

export const SPACETIMEDB_HOST =
  process.env.NEXT_PUBLIC_SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
export const SPACETIMEDB_DB_NAME =
  process.env.NEXT_PUBLIC_SPACETIMEDB_DB_NAME ?? 'hsrpvp-spacetimedb-nextjs-test1';
export const SPACETIMEDB_TOKEN_KEY = `${SPACETIMEDB_HOST}/${SPACETIMEDB_DB_NAME}/auth_token`;

/**
 * Filters out SubscribeApplied / UnsubscribeApplied / Error events from live-change
 * callbacks. Only Reducer and Transaction events represent real mutations — the SDK
 * fires onInsert / onUpdate for EVERY row matching the initial subscription state,
 * which must be ignored to avoid double-processing during reconnect.
 *
 * Used by subscription owners (AuthProvider Stage 1, (authed)/layout.tsx Stage 2).
 */
export function isLiveChange(ctx: EventContext): boolean {
  const tag = ctx?.event?.tag;
  return tag === 'Reducer' || tag === 'Transaction';
}
