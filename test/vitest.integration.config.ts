import { defineConfig } from 'vitest/config';
import path from 'path';
import { readFileSync } from 'fs';

// Load .env.local into process.env for integration tests
// Vite's envDir only exposes VITE_* prefixed vars, but our tests use SPACETIMEDB_* directly
function loadEnvLocal() {
  try {
    const content = readFileSync(path.resolve(__dirname, '../.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* .env.local doesn't exist — tests will skip verified-user suites */ }
}

loadEnvLocal();

export default defineConfig({
  test: {
    include: ['test/backend/**/*.test.ts', '!test/backend/**/*.unit.test.ts'],
    alias: {
      '@/': path.resolve(__dirname, '../') + '/',
    },

    // Integration tests need more time (network, SpacetimeDB round-trips)
    testTimeout: 30000,
    hookTimeout: 30000,

    // Run sequentially — tests share SpacetimeDB state
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, '../') + '/',
    },
  },
});
