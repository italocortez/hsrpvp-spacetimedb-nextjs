import { useMemo, useEffect, useCallback, useRef } from 'react';
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

    // 3. Check if this identity has a UserIdentity mapping
    const hasMapping = useMemo(() => {
        if (!isActive || !identity) return false;
        return allIdentities.some(m =>
            m.identity.toHexString() === identity.toHexString()
        );
    }, [allIdentities, identity, isActive]);

    // 4. Resolve: identity → UserIdentity → User
    const currentUser = useMemo(() => {
        if (!isActive || !identity) return null;

        const mapping = allIdentities.find(m =>
            m.identity.toHexString() === identity.toHexString()
        );
        if (!mapping) return null;

        return allUsers.find(u => u.id === mapping.userId) || null;
    }, [allIdentities, allUsers, identity, isActive]);

    // 5. Auto-register: when connected but no mapping exists, call loginAsGuest
    //    to ensure a UserIdentity row is created. This enables direct Discord login
    //    (the server_link_discord reducer requires an existing mapping).
    const autoRegisterRef = useRef(false);
    useEffect(() => {
        if (!isActive || !identity || hasMapping) return;
        if (autoRegisterRef.current) return;

        const conn = getConnection();
        if (!conn) return;

        autoRegisterRef.current = true;
        try {
            conn.reducers.loginAsGuest({});
        } catch (err) {
            console.error("Auto-register loginAsGuest failed:", err);
        }
        // Reset after a delay so it can retry if the mapping doesn't appear
        const timer = setTimeout(() => { autoRegisterRef.current = false; }, 5000);
        return () => clearTimeout(timer);
    }, [isActive, identity, hasMapping, getConnection]);

    // 6. Side effect: when Discord session is authenticated AND a user exists,
    //    call the server-side API route to link the Discord account.
    //    Waits for currentUser (meaning loginAsGuest has completed) before linking.
    const linkingRef = useRef(false);
    useEffect(() => {
        if (nextAuthStatus !== "authenticated" || !session?.user) return;
        if (!isActive || !identity || !currentUser) return;

        const discordUser = session.user as any;
        const needsSync = currentUser.isGuest || (currentUser.discordId !== discordUser.id);

        if (needsSync && !linkingRef.current) {
            linkingRef.current = true;
            fetch('/api/auth/link-discord', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callerIdentityHex: identity.toHexString() }),
            })
                .then(res => {
                    if (!res.ok) return res.json().then(d => { throw new Error(d.error); });
                })
                .catch(e => console.error("Failed to link Discord:", e))
                .finally(() => { linkingRef.current = false; });
        }
    }, [nextAuthStatus, session, isActive, identity, currentUser]);

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
    // For Discord users this is safe — they re-link via server_link_discord on next login.
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
