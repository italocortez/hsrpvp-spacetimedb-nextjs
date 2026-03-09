'use client';

import { SessionProvider } from "next-auth/react";
import { useMemo } from 'react';
import { SpacetimeDBProvider, useTable } from 'spacetimedb/react';
import { DbConnection, ErrorContext, tables } from '../src/module_bindings';
import { Identity } from 'spacetimedb';
import { SPACETIMEDB_HOST as HOST, SPACETIMEDB_DB_NAME as DB_NAME, SPACETIMEDB_TOKEN_KEY as TOKEN_KEY } from '@/lib/spacetimedb';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { GameDataProvider } from '@/features/game-data/components/GameDataProvider';
import { HeroUIProvider } from '@heroui/system';
import type { HsrCharacterRow } from '@/features/game-data/components/GameDataProvider';

export function useCharacters(): { characters: HsrCharacterRow[]; isLoading: boolean } {
  const [rows, isLoading] = useTable(tables.HsrCharacter);
  return {
    characters: (rows || []) as unknown as HsrCharacterRow[],
    isLoading,
  };
}

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