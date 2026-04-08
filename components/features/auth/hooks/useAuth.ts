import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { useSpacetimeDB } from 'spacetimedb/react';
import { SPACETIMEDB_TOKEN_KEY } from '@/lib/spacetimedb';
import { AuthState, User } from '../types';

export function useAuth() {
    const router = useRouter();
    const { data: session, status: nextAuthStatus } = useSession();
    const { isActive, identity, getConnection, connectionError } = useSpacetimeDB();

    // Track the user's profile from view_my_profile subscription
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profileReady, setProfileReady] = useState(false);
    const subscribedRef = useRef(false);

    // Set up view_my_profile subscription when connected — event-driven via onApplied
    useEffect(() => {
        if (!isActive || subscribedRef.current) return;
        const conn = getConnection();
        if (!conn) return;
        subscribedRef.current = true;

        // Subscribe to the merged profile view (User + UserPrivate)
        // onApplied fires ONCE when initial data is loaded — no polling needed
        conn.subscriptionBuilder()
            .onApplied(() => {
                setProfileReady(true);
                // Read profile data immediately inside onApplied
                readProfileFromConnection(conn);
            })
            .subscribe('SELECT * FROM view_my_profile');

        // Subscribe to view_my_identity as fallback for userId resolution
        // (A1 failed: ViewMyProfile not in generated bindings — Strategy B path)
        conn.subscriptionBuilder().subscribe('SELECT * FROM view_my_identity');

        // Also subscribe to User table for general user list (admin views, etc.)
        conn.subscriptionBuilder().subscribe('SELECT * FROM user');

        return () => {
            subscribedRef.current = false;
            setProfileReady(false);
        };
    }, [isActive, getConnection]);

    // Event-driven profile reader — called from onApplied and after reducer calls
    const readProfileFromConnection = useCallback((conn: any) => {
        if (!identity) return;

        // Strategy A: Try reading from the generated view table (if A1 holds)
        try {
            const viewRows = [...(conn.db as any).ViewMyProfile?.iter?.() ?? []];
            if (viewRows.length > 0) {
                const profile = viewRows[0];
                setCurrentUser({
                    id: profile.id,
                    username: profile.username,
                    displayName: profile.displayName,
                    isGuest: profile.isGuest,
                    lastLoginAt: profile.lastLoginAt,
                    role: profile.role,
                    hasDiscordLinked: profile.hasDiscordLinked,
                    avatarCharacterName: profile.avatarCharacterName,
                    deletedAt: profile.deletedAt,
                    discordId: profile.discordId,
                    discordUsername: profile.discordUsername,
                } as User);
                return;
            }
        } catch {
            // ViewMyProfile table may not exist in generated bindings (A1 failed)
        }

        // Strategy B (A1 fallback): Read from User table + identity match
        // Since UserIdentity is private, we can't use it directly.
        // But after loginAsGuest, the User table will have our row.
        // Match by guest username pattern or by view_my_identity.
        try {
            const allUsers = [...(conn.db as any).User?.iter?.() ?? []];
            const shortId = identity.toHexString().slice(0, 8);
            const guestUsername = `Guest_${shortId}`;

            // Try exact guest username match first
            let myUser = allUsers.find((u: any) => u.username === guestUsername);

            // If verified user, username was changed — try matching by view_my_identity
            if (!myUser && allUsers.length > 0) {
                try {
                    const identityRows = [...(conn.db as any).ViewMyIdentity?.iter?.() ?? []];
                    if (identityRows.length > 0) {
                        const userId = identityRows[0].userId;
                        myUser = allUsers.find((u: any) => u.id === userId);
                    }
                } catch {
                    // ViewMyIdentity also not in bindings — last resort
                }
            }

            if (myUser) {
                setCurrentUser({
                    id: myUser.id,
                    username: myUser.username,
                    displayName: myUser.displayName,
                    isGuest: myUser.isGuest,
                    lastLoginAt: myUser.lastLoginAt,
                    role: myUser.role,
                    hasDiscordLinked: myUser.hasDiscordLinked,
                    avatarCharacterName: myUser.avatarCharacterName,
                    deletedAt: myUser.deletedAt,
                    // Private fields not available in fallback mode
                    discordId: undefined,
                    discordUsername: undefined,
                } as User);
                return;
            }
        } catch {
            // Fallback failed
        }

        setCurrentUser(null);
    }, [identity]);

    // Re-read profile when profileReady changes or identity changes
    useEffect(() => {
        if (!isActive || !profileReady) {
            setCurrentUser(null);
            return;
        }
        const conn = getConnection();
        if (!conn) return;
        readProfileFromConnection(conn);
    }, [isActive, profileReady, identity, getConnection, readProfileFromConnection]);

    // Discord linking logic (same intent pattern, updated body)
    const DISCORD_INTENT_KEY = 'discord_login_intent';
    const DISCORD_INTENT_TIMEOUT_KEY = 'discord_login_intent_ts';
    const DISCORD_INTENT_TTL_MS = 5 * 60 * 1000;
    const linkingRef = useRef(false);
    const autoRegisteredRef = useRef(false);

    const hasDiscordIntent = useMemo(() => {
        if (typeof window === 'undefined') return false;
        const flag = sessionStorage.getItem(DISCORD_INTENT_KEY);
        if (!flag) return false;
        const ts = Number(sessionStorage.getItem(DISCORD_INTENT_TIMEOUT_KEY) || '0');
        if (Date.now() - ts > DISCORD_INTENT_TTL_MS) {
            sessionStorage.removeItem(DISCORD_INTENT_KEY);
            sessionStorage.removeItem(DISCORD_INTENT_TIMEOUT_KEY);
            return false;
        }
        return true;
    }, [nextAuthStatus]);

    const hasMapping = !!currentUser;

    useEffect(() => {
        if (nextAuthStatus !== "authenticated" || !session?.user) return;
        if (!isActive || !identity) return;
        if (!hasDiscordIntent && !hasMapping) return;

        const conn = getConnection();
        if (!conn) return;

        // Step A: No mapping yet -- call loginAsGuest
        if (!hasMapping && !autoRegisteredRef.current) {
            autoRegisteredRef.current = true;
            try {
                conn.reducers.loginAsGuest({});
            } catch (err) {
                console.error("Auto-register loginAsGuest failed:", err);
                autoRegisteredRef.current = false;
            }
            return;
        }

        // Step B: Link Discord if needed
        if (!currentUser) return;

        // D-02: Use hasDiscordLinked instead of discordId comparison
        const needsSync = currentUser.isGuest || !currentUser.hasDiscordLinked;

        if (needsSync && !linkingRef.current) {
            linkingRef.current = true;
            // D-09: Send spacetimeToken instead of identity hex
            const spacetimeToken = localStorage.getItem(SPACETIMEDB_TOKEN_KEY);
            if (!spacetimeToken) {
                console.error("No SpacetimeDB token available for identity verification");
                linkingRef.current = false;
                return;
            }
            fetch('/api/auth/link-discord', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spacetimeToken }),
            })
                .then(res => {
                    if (!res.ok) return res.json().then(d => { throw new Error(d.error); });
                })
                .catch(e => console.error("Failed to link Discord:", e))
                .finally(() => { linkingRef.current = false; });
        }

        if (!needsSync) {
            sessionStorage.removeItem(DISCORD_INTENT_KEY);
            sessionStorage.removeItem(DISCORD_INTENT_TIMEOUT_KEY);
        }
    }, [nextAuthStatus, session, isActive, identity, hasMapping, hasDiscordIntent, currentUser, getConnection]);

    // Soft-delete detection (same logic, uses currentUser from view)
    const [isDeleted, setIsDeleted] = useState(false);
    const deletionHandledRef = useRef(false);
    useEffect(() => {
        if (!currentUser?.deletedAt || deletionHandledRef.current) return;
        deletionHandledRef.current = true;
        setIsDeleted(true);
        router.push('/');
        const timer = setTimeout(async () => {
            localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
            await signOut({ redirect: false });
            window.location.replace('/');
        }, 4000);
        return () => clearTimeout(timer);
    }, [currentUser?.deletedAt, router]);

    const isLinkingDiscord = hasDiscordIntent && nextAuthStatus === "authenticated" && (!currentUser || currentUser.isGuest);

    // If a token existed at mount time, the user likely has an account — wait for
    // subscriptions before showing the login form (prevents flash during page transitions).
    const hadTokenOnMount = useRef(typeof window !== 'undefined' && !!localStorage.getItem(SPACETIMEDB_TOKEN_KEY));
    const isOrphanedIdentity = profileReady && !hasMapping;
    const isWaitingForData = isActive && !currentUser && hadTokenOnMount.current && !isOrphanedIdentity;
    const isConnecting = !isActive && !connectionError;

    const authState: AuthState = {
        identity: identity || null,
        user: currentUser,
        isAuthenticated: !!currentUser && !isLinkingDiscord,
        isConnecting,
        isLoadingData: isLinkingDiscord || isWaitingForData,
        connectionError,
    };

    const loginGuest = useCallback(() => {
        const conn = getConnection();
        if (!conn) {
            console.error("SpacetimeDB connection not active.");
            return;
        }
        try { conn.reducers.loginAsGuest({}); }
        catch (err) { console.error("Failed loginAsGuest:", err); }
    }, [getConnection]);

    const loginDiscord = useCallback(() => {
        sessionStorage.setItem(DISCORD_INTENT_KEY, '1');
        sessionStorage.setItem(DISCORD_INTENT_TIMEOUT_KEY, String(Date.now()));
        signIn("discord");
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
        signOut({ callbackUrl: '/' });
    }, []);

    const deleteGuestAccount = useCallback(() => {
        const conn = getConnection();
        if (!conn) return;
        try { conn.reducers.deleteGuestAccount({}); }
        catch (err) { console.error("Failed to delete guest account:", err); }
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
