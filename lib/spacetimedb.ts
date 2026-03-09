export const SPACETIMEDB_HOST =
  process.env.NEXT_PUBLIC_SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
export const SPACETIMEDB_DB_NAME =
  process.env.NEXT_PUBLIC_SPACETIMEDB_DB_NAME ?? 'nextjs-ts';
export const SPACETIMEDB_TOKEN_KEY = `${SPACETIMEDB_HOST}/${SPACETIMEDB_DB_NAME}/auth_token`;
