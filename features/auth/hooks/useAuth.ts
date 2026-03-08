import { useMemo, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { AuthState, User } from '../types';

export function useAuth() {
    // 1. Get External States (Auth.js and SpacetimeDB)
    const { data: session, status: nextAuthStatus } = useSession();
    const { isActive, identity, getConnection } = useSpacetimeDB();
    const conn = getConnection();

    // 2. Fetch Table Data
    const [rows, isLoadingTable] = useTable(tables.User);
    const allUsers = rows as unknown as User[];

    // 3. Define currentUser FIRST
    const currentUser = useMemo(() => {
        if (!identity || isLoadingTable) return null;

        return allUsers.find(u =>
            u.identity.toHexString() === identity.toHexString()
        ) || null;
    }, [allUsers, identity, isLoadingTable]);

    // 4. Side Effect: Sync Discord Session to SpacetimeDB
    useEffect(() => {
        // Only attempt to sync if we have a valid Discord session and a SpacetimeDB connection
        if (nextAuthStatus === "authenticated" && session?.user && conn && isActive) {
            const discordUser = session.user as any;

            // Check if we need to link this identity to a Discord ID
            const needsSync = !currentUser || (currentUser.discordId !== discordUser.id);

            if (needsSync) {
                // ✅ Use camelCase and object syntax for the reducer
                conn.reducers.registerDiscordUser({
                    discordId: discordUser.id,
                    username: discordUser.name || "DiscordUser",
                    displayName: discordUser.name || "DiscordUser",
                });
            }
        }
    }, [nextAuthStatus, session, conn, isActive, currentUser]);

    // 5. Build Final Auth State
    const authState: AuthState = {
        identity: identity || null,
        user: currentUser,
        isAuthenticated: currentUser !== null,
        isInitializing: !isActive || isLoadingTable || nextAuthStatus === "loading",
    };

    const loginGuest = (alias: string) => {
        if (!conn) return;
        conn.reducers.registerGuest({ displayName: alias });
    };

    const loginDiscord = () => signIn("discord");

    const logout = () => {
        signOut();
        if (typeof window !== 'undefined') {
            const HOST = process.env.NEXT_PUBLIC_SPACETIMEDB_HOST;
            const DB_NAME = process.env.NEXT_PUBLIC_SPACETIMEDB_DB_NAME;
            localStorage.removeItem(`${HOST}/${DB_NAME}/auth_token`);
            window.location.reload();
        }
    };

    return {
        ...authState,
        loginGuest,
        loginDiscord,
        logout,
    };
}