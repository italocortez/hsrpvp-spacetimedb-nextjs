'use client';

import { SessionProvider } from "next-auth/react";
import { useEffect, useMemo } from 'react';
import { SpacetimeDBProvider } from 'spacetimedb/react';
import { DbConnection, ErrorContext } from '../src/module_bindings';
import { Identity } from 'spacetimedb';
import { SPACETIMEDB_HOST as HOST, SPACETIMEDB_DB_NAME as DB_NAME, SPACETIMEDB_TOKEN_KEY as TOKEN_KEY } from '@/lib/spacetimedb';
import { AuthProvider } from '@/components/features/auth/components/AuthProvider';
import { GameDataProvider } from '@/components/features/game-data/components/GameDataProvider';
import { HeroUIProvider } from '@heroui/system';
const onConnect = (_conn: DbConnection, identity: Identity, token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
  console.log(
    'Connected to SpacetimeDB with identity:',
    identity.toHexString()
  );
};

const onDisconnect = () => {
  console.log('Disconnected from SpacetimeDB');
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
  console.log('Error connecting to SpacetimeDB:', err);
};

export function Providers({ children }: { children: React.ReactNode }) {
  const connectionBuilder = useMemo(
    () =>
      DbConnection.builder()
        .withUri(HOST)
        .withDatabaseName(DB_NAME)
        .withConfirmedReads(false)
        .withToken(
          typeof window !== 'undefined'
            ? localStorage.getItem(TOKEN_KEY) || undefined
            : undefined
        )
        .onConnect(onConnect)
        .onDisconnect(onDisconnect)
        .onConnectError(onConnectError),
    []
  );

  // Phase 16 Plan 04 — Service Worker registration (D-19).
  // Empty dep array: run once per mount (Pitfall 7 — dep-drift causes multi-register).
  useEffect(() => {
    const shouldRegister =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

    if (!shouldRegister) {
      console.log('[SW] skip register: NODE_ENV=' + process.env.NODE_ENV);
      return;
    }
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] skip register: serviceWorker API unavailable');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] registered, scope=' + reg.scope);
        // IN-11: log when a new SW version is waiting so a VERSION bump reaches
        // existing tabs predictably. The new SW activates on full tab close.
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw?.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] update available — next reload will activate new version');
            }
          });
        });
      })
      .catch((err) => console.error('[SW] register failed:', err));
  }, []);

  // we wrap everything inside the session provider so that the session is available to the client
  return (
    <SessionProvider>
      <HeroUIProvider>
        <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
          <AuthProvider>
            <GameDataProvider>
              {children}
            </GameDataProvider>
          </AuthProvider>
        </SpacetimeDBProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}