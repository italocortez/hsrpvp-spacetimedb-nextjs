import { useMemo, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { AuthState, User } from '../types';

export function useAuth() {
    // 1. Get External States
    const { data: session, status: nextAuthStatus } = useSession();

    const { isActive, identity, getConnection } = useSpacetimeDB();
    const conn = getConnection();

    // 2. Fetch Table Data
    const [rows, isReady] = useTable(tables.User);

    const allUsers = (rows || []) as unknown as User[];

    // 3. Define currentUser
    const currentUser = useMemo(() => {
        // ✅ FIX: Logic inversion. We return null if NOT ready.
        // If !isActive (connecting) OR !isReady (loading table) OR !identity (no wallet), we have no user.
        if (!isActive || !identity || !isReady) return null;

        return allUsers.find(u =>
            u.identity.toHexString() === identity.toHexString()
        ) || null;
    }, [allUsers, identity, isReady, isActive]);

    // 4. Side Effect: Sync Discord Session
    useEffect(() => {
        if (nextAuthStatus === "authenticated" && session?.user && conn && isActive) {
            const discordUser = session.user as any;

            // Only attempt sync if table data is ready so we don't double-register
            if (isReady) {
                const needsSync = !currentUser || (currentUser.discordId !== discordUser.id);

                if (needsSync) {
                    try {
                        conn.reducers.registerDiscordUser({
                            discordId: discordUser.id,
                            username: discordUser.name || "DiscordUser",
                            displayName: discordUser.name || "DiscordUser",
                        });
                    } catch (e) {
                        console.error("Failed to sync Discord user:", e);
                    }
                }
            }
        }
    }, [nextAuthStatus, session, conn, isActive, currentUser, isReady]);

    // 5. Build Final Auth State
    // ✅ FIX: Define initialization as "Not connected OR Connected but table still loading"
    const isInitializing = !isActive || (isActive && !isReady);

    const authState: AuthState = {
        identity: identity || null,
        user: currentUser,
        isAuthenticated: !!currentUser,
        isInitializing,
    };

    const loginGuest = (alias: string) => {
        if (!conn || !isActive) {
            console.error("IPC Link not active. Cannot register guest.");
            return;
        }
        try {
            conn.reducers.registerGuest({ displayName: alias });
        } catch (err) {
            console.error("Failed to call registerGuest reducer:", err);
        }
    };

    const loginDiscord = () => signIn("discord");

    const logout = () => {
        signOut();
        // Clear token logic here if needed
        window.location.reload();
    };

    return {
        ...authState,
        loginGuest,
        loginDiscord,
        logout,
    };
}