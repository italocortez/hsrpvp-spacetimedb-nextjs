import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { SPACETIMEDB_TOKEN_KEY } from '@/lib/spacetimedb';
import { AuthState, User, UserIdentityRow } from '../types';

export function useAuth() {
    // 1. External state: NextAuth session + SpacetimeDB connection + router
    const router = useRouter();
    const { data: session, status: nextAuthStatus } = useSession();
    const { isActive, identity, getConnection, connectionError } = useSpacetimeDB();

    // 2. Subscribe to UserIdentity and User tables
    // Note: tables.UserIdentity requires regenerated bindings after publish
    const [identityRows, identitiesReady] = useTable((tables as any).UserIdentity);
    const allIdentities = (identityRows || []) as unknown as UserIdentityRow[];

    const [userRows, usersReady] = useTable(tables.User);
    const allUsers = (userRows || []) as unknown as User[];

    const subscriptionsReady = identitiesReady && usersReady;

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

    // 5. Discord linking: only runs when the user explicitly clicked "Connect with Discord"
    //    in this tab session. A sessionStorage flag tracks intent (survives OAuth redirect).
    //    If the user already has a mapping + linked Discord, the flag is cleared and
    //    subsequent visits with a stale NextAuth cookie won't auto-register.
    const DISCORD_INTENT_KEY = 'discord_login_intent';
    const linkingRef = useRef(false);
    const autoRegisteredRef = useRef(false);
    const hasDiscordIntent = typeof window !== 'undefined' && !!sessionStorage.getItem(DISCORD_INTENT_KEY);

    useEffect(() => {
        if (nextAuthStatus !== "authenticated" || !session?.user) return;
        if (!isActive || !identity) return;
        // Only proceed if user explicitly initiated Discord login, OR
        // if they already have a mapping (returning user on authenticated page).
        if (!hasDiscordIntent && !hasMapping) return;

        const conn = getConnection();
        if (!conn) return;

        // Step A: No mapping yet — call loginAsGuest to create one, then wait
        // for the subscription to deliver the mapping (next render).
        if (!hasMapping && !autoRegisteredRef.current) {
            autoRegisteredRef.current = true;
            try {
                conn.reducers.loginAsGuest({});
            } catch (err) {
                console.error("Auto-register loginAsGuest failed:", err);
                autoRegisteredRef.current = false;
            }
            return; // Wait for mapping to appear via subscription
        }

        // Step B: Mapping exists, now link Discord if needed
        if (!currentUser) return;

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

        // Linking complete (or not needed) — clear the intent flag
        if (!needsSync) {
            sessionStorage.removeItem(DISCORD_INTENT_KEY);
        }
    }, [nextAuthStatus, session, isActive, identity, hasMapping, hasDiscordIntent, currentUser, getConnection]);

    // 5b. Detect soft-delete: if admin set deletedAt, notify user and auto-logout.
    // Navigate to landing page (client-side, preserves React state) so the banner
    // is visible, then sign out after 4 seconds.
    const [isDeleted, setIsDeleted] = useState(false);
    const deletionHandledRef = useRef(false);
    useEffect(() => {
        if (!currentUser?.deletedAt || deletionHandledRef.current) return;
        deletionHandledRef.current = true;
        setIsDeleted(true);

        // Navigate to landing page so user can't interact with authenticated pages
        router.push('/');

        // Sign out after delay so user can read the banner.
        // Use signOut with redirect:false then force a hard reload to ensure
        // the SpacetimeDB connection is fully reset (no stale subscriptions).
        const timer = setTimeout(async () => {
            localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
            await signOut({ redirect: false });
            window.location.replace('/');
        }, 4000);
        return () => clearTimeout(timer);
    }, [currentUser?.deletedAt, router]);

    // Discord linking is in progress when the user explicitly initiated Discord login
    // and the link hasn't completed yet. Prevents flash of "Welcome Guest_xxx".
    const isLinkingDiscord = hasDiscordIntent && nextAuthStatus === "authenticated" && (!currentUser || currentUser.isGuest);

    // If a token existed at mount time, the user likely has an account — wait for
    // subscriptions before showing the login form (prevents flash during page transitions).
    // We use a ref so that tokens saved by onConnect AFTER mount don't trigger waiting.
    // Once subscriptions load and there's no mapping (orphaned identity), stop waiting.
    const hadTokenOnMount = useRef(typeof window !== 'undefined' && !!localStorage.getItem(SPACETIMEDB_TOKEN_KEY));
    const isOrphanedIdentity = subscriptionsReady && !hasMapping;
    const isWaitingForData = isActive && !currentUser && hadTokenOnMount.current && !isOrphanedIdentity;

    // Auth state
    const isConnecting = !isActive && !connectionError;

    const authState: AuthState = {
        identity: identity || null,
        user: currentUser,
        isAuthenticated: !!currentUser && !isLinkingDiscord,
        isConnecting,
        isLoadingData: isLinkingDiscord || isWaitingForData,
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

    const loginDiscord = useCallback(() => {
        sessionStorage.setItem(DISCORD_INTENT_KEY, '1');
        signIn("discord");
    }, []);

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
        isDeleted,
        loginGuest,
        loginDiscord,
        logout,
        deleteGuestAccount,
    };
}
