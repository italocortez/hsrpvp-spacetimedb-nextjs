import { DbConnection, tables } from '../src/module_bindings';
import type { Infer } from 'spacetimedb';

const HOST = process.env.SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
const DB_NAME = process.env.SPACETIMEDB_DB_NAME ?? 'nextjs-ts';