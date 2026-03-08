import { useMemo, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { SPACETIMEDB_TOKEN_KEY } from '@/lib/spacetimedb';
import { AuthState, User, UserIdentityRow } from '../types';

export function useAuth() {
    // 1. External state: NextAuth session + SpacetimeDB connection
    const { data: session, status: nextAuthStatus } = useSession();
    const { isActive, identity, getConnection, connectionError } = useSpacetimeDB();

    // 2. Subscribe to UserIdentity and User tables
    // Note: tables.UserIdentity requires regenerated bindings after publish
    const [identityRows] = useTable((tables as any).UserIdentity);
    const allIdentities = (identityRows || []) as unknown as UserIdentityRow[];

    const [userRows] = useTable(tables.User);
    const allUsers = (userRows || []) as unknown as User[];

    // 3. Resolve: identity → UserIdentity → User
    const currentUser = useMemo(() => {
        if (!isActive || !identity) return null;

        // Find the UserIdentity mapping for this device's identity
        const mapping = allIdentities.find(m =>
            m.identity.toHexString() === identity.toHexString()
        );
        if (!mapping) return null;

        // Find the User by userId
        return allUsers.find(u => u.id === mapping.userId) || null;
    }, [allIdentities, allUsers, identity, isActive]);

    // 4. Side effect: when Discord session is authenticated, sync to SpacetimeDB
    useEffect(() => {
        if (nextAuthStatus !== "authenticated" || !session?.user) return;
        const conn = getConnection();
        if (!conn || !isActive) return;

        const discordUser = session.user as any;
        const needsSync = !currentUser || currentUser.isGuest || (currentUser.discordId !== discordUser.id);

        if (needsSync) {
            try {
                conn.reducers.registerDiscordUser({
                    discordId: discordUser.id,
                    discordUsername: discordUser.name || "DiscordUser",
                });
            } catch (e) {
                console.error("Failed to sync Discord user:", e);
            }
        }
    }, [nextAuthStatus, session, getConnection, isActive, currentUser]);

    // 5. Auth state
    const isConnecting = !isActive && !connectionError;

    const authState: AuthState = {
        identity: identity || null,
        user: currentUser,
        isAuthenticated: !!currentUser,
        isConnecting,
        isLoadingData: false,
        connectionError,
    };

    // 6. Actions
    const loginGuest = useCallback(() => {
        const conn = getConnection();
        if (!conn) {
            console.error("SpacetimeDB connection not active. Cannot login as guest.");
            return;
        }
        try {
            conn.reducers.loginAsGuest({});
        } catch (err) {
            console.error("Failed to call loginAsGuest reducer:", err);
        }
    }, [getConnection]);

    const loginDiscord = useCallback(() => signIn("discord"), []);

    // Logout: clear SpacetimeDB token so a fresh identity is generated next time.
    // For Discord users this is safe — they re-link via register_discord_user on next login.
    const logout = useCallback(() => {
        localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
        signOut({ callbackUrl: '/' });
    }, []);

    // Guest-only: delete the guest account before clearing credentials.
    // The caller is responsible for showing a confirmation dialog before calling this.
    const deleteGuestAccount = useCallback(() => {
        const conn = getConnection();
        if (!conn) return;
        try {
            conn.reducers.deleteGuestAccount({});
        } catch (err) {
            console.error("Failed to delete guest account:", err);
        }
        localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
        signOut({ callbackUrl: '/' });
    }, [getConnection]);

    return {
        ...authState,
        loginGuest,
        loginDiscord,
        logout,
        deleteGuestAccount,
    };
}
