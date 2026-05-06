import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { useSpacetimeDB, useReducer } from 'spacetimedb/react';
import { reducers } from '@/src/module_bindings';
import { SPACETIMEDB_TOKEN_KEY } from '@/lib/spacetimedb';
import { setSessionCookie, clearSessionCookie } from '@/lib/session-cookie';
import { User } from '../types';

// localStorage key for the resolved userId. Written by setResolvedUser after a User row
// resolves; cleared by logout / deleteGuestAccount. Used as the "has authenticated" signal
// for the Stage 2 subscription gate (see hadUserIdOnMount below).
const USER_ID_KEY = 'spacetimedb_user_id';

// Single source of truth for the profile dedupe signature.
// MUST include every field copied into currentUser by setResolvedUser — otherwise a live update
// affecting only a missing field would be silently dropped by the dedupe. If you add a new field
// to User + setResolvedUser, add it here too.
//
// SpacetimeDB timestamp columns (lastLoginAt, deletedAt) are BigInt at the SDK layer; JSON.stringify
// throws on BigInt. The replacer coerces any BigInt to string — safe for identity comparison since
// two identical BigInts stringify to the same decimal.
function extractProfileSignature(user: any): string {
    return JSON.stringify({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        isGuest: user.isGuest,
        lastLoginAt: user.lastLoginAt,
        role: user.role?.tag,
        hasDiscordLinked: user.hasDiscordLinked,
        avatarCharacterName: user.avatarCharacterName,
        deletedAt: user.deletedAt,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
    }, (_k, v) => typeof v === 'bigint' ? v.toString() : v);
}

export function useAuth() {
    // Phase 16 D-33: subscription ownership delegated out of useAuth.
    // Stage 1 (view_my_profile) now lives in AuthProvider; Stage 2 (User) lives in (authed)/layout.tsx.
    // This hook retains readProfileFromConnection + state-machine + reader coordination only.

    const router = useRouter();
    const { data: session, status: nextAuthStatus } = useSession();
    const { isActive, identity, getConnection, connectionError } = useSpacetimeDB();

    // Track the user's profile from view_my_profile subscription
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profileReady, setProfileReady] = useState(false);
    const [guestLoginPending, setGuestLoginPending] = useState(false);

    // Phase 16.4 Plan 06 (D-15): typed Promise-returning reducer callbacks that queue
    // internally until the connection is ready. Replaces per-callsite getConnection()
    // null-check + (conn.reducers as any) cast for these 2 reducers. The `_call` suffix
    // avoids name collision with the loginGuest / deleteGuestAccount callbacks below.
    const loginAsGuestCall = useReducer(reducers.loginAsGuest);
    const deleteGuestAccountCall = useReducer(reducers.deleteGuestAccount);

    // Render-diagnostic log: shows WHICH state change triggered this render.
    // If renders look excessive, diff consecutive entries to isolate the culprit.
    console.log('[useAuth] render', {
        isActive,
        idShort: identity?.toHexString().slice(0, 8),
        profileReady,
        nextAuthStatus,
        hasUser: !!currentUser,
    });

    // Dedupe: stores the last-resolved profile signature. Prevents redundant setResolvedUser
    // calls when Stage 1 (view_my_profile) and Stage 2 (User table) both resolve the same profile
    // (returning-user flow, StrictMode remount). Reset in the "no user found" path so a future
    // resolve is treated as new. Live updates pass through because any changed field flips the signature.
    const resolvedSignatureRef = useRef<string | null>(null);

    // D-09: isWaitingForData signals. Refs initialized once at mount.
    // Post Phase 16 they no longer gate a subscription (route-group mount is the gate),
    // but they still drive `isWaitingForData` composition below.
    const hadSessionCookie = useRef(typeof document !== 'undefined' && document.cookie.includes('stdb_session'));
    // D-09: the SDK auto-stores an identity token on first anonymous WS connect (see app/providers.tsx onConnect),
    // so a token alone does NOT indicate prior authentication. USER_ID_KEY is only written inside
    // setResolvedUser after a real User row resolves — the correct "has authenticated" signal.
    const hadUserIdOnMount = useRef(typeof window !== 'undefined' && !!localStorage.getItem(USER_ID_KEY));

    // Persist userId + session cookie when resolved
    const setResolvedUser = useCallback((user: any) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_ID_KEY, String(user.id));
            setSessionCookie(user.displayName);
        }
        setCurrentUser({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            isGuest: user.isGuest,
            lastLoginAt: user.lastLoginAt,
            role: user.role,
            hasDiscordLinked: user.hasDiscordLinked,
            avatarCharacterName: user.avatarCharacterName,
            deletedAt: user.deletedAt,
            discordId: user.discordId,
            discordUsername: user.discordUsername,
        } as User);
    }, []);

    // Stable ref so table callbacks always call the latest version
    const readProfileRef = useRef<(conn: any) => void>(() => {});

    // Event-driven profile reader — called from onApplied, table callbacks, and after reducer calls
    const readProfileFromConnection = useCallback((conn: any) => {
        if (!identity) return;

        // PRIMARY: Read from view_my_profile — has private fields (discordId, discordUsername)
        const profileRows = [...conn.db.view_my_profile.iter()];
        const profile = profileRows[0]; // At most 1 row (filtered by ctx.sender server-side)
        if (profile) {
            const sig = extractProfileSignature(profile);
            if (resolvedSignatureRef.current === sig) return;
            resolvedSignatureRef.current = sig;
            console.log(`[useAuth] View hit: view_my_profile → id=${profile.id} username=${profile.username}`);
            setResolvedUser(profile);
            return;
        }

        // FALLBACK: User table strategies (connection recovery paths)
        // View subscription may not have data yet during rapid connection/reconnection.

        // Strategy 1: Cached userId from previous session → PK lookup on User table
        const cachedId = typeof window !== 'undefined' ? localStorage.getItem(USER_ID_KEY) : null;
        if (cachedId) {
            const user = conn.db.User.id.find(Number(cachedId));
            if (user) {
                const sig = extractProfileSignature(user);
                if (resolvedSignatureRef.current === sig) return;
                resolvedSignatureRef.current = sig;
                console.log(`[useAuth] Strategy 1 hit: cached id=${cachedId} → ${user.username}`);
                setResolvedUser(user); return;
            }
            // Cached id is stale — clear it and cookie
            console.log(`[useAuth] Strategy 1 miss: cached id=${cachedId} not found, clearing`);
            localStorage.removeItem(USER_ID_KEY);
            clearSessionCookie();
        }

        // Strategy 2: Guest username → unique index lookup on User table
        const shortId = identity.toHexString().slice(0, 8);
        const guestUsername = `Guest_${shortId}`;
        const guestUser = conn.db.User.username.find(guestUsername);
        if (guestUser) {
            const sig = extractProfileSignature(guestUser);
            if (resolvedSignatureRef.current === sig) return;
            resolvedSignatureRef.current = sig;
            console.log(`[useAuth] Strategy 2 hit: ${guestUsername} → id=${guestUser.id}`);
            setResolvedUser(guestUser); return;
        }

        // Strategy 3: NextAuth session username → unique index lookup on User table
        // Handles post-merge recovery: after server_link_provider re-points identity
        // to an existing user (Case 1b), the guest is deleted and Strategies 1+2 fail.
        // The Discord username from NextAuth matches the existing user's username.
        const sessionName = session?.user?.name;
        if (sessionName) {
            const sessionUser = conn.db.User.username.find(sessionName);
            if (sessionUser && !sessionUser.isGuest) {
                const sig = extractProfileSignature(sessionUser);
                if (resolvedSignatureRef.current === sig) return;
                resolvedSignatureRef.current = sig;
                console.log(`[useAuth] Strategy 3 hit: session name "${sessionName}" → id=${sessionUser.id}`);
                setResolvedUser(sessionUser); return;
            }
        }

        // No user found — clear stale session cookie and force profileReady
        // so isOrphanedIdentity triggers and LOGIN shows
        console.log(`[useAuth] No user found (view + strategies 1-3 failed). identity=${shortId}, sessionName=${sessionName ?? 'none'}`);
        clearSessionCookie();
        resolvedSignatureRef.current = null;
        setProfileReady(true);
        setCurrentUser(null);
    }, [identity, session, setResolvedUser]);

    // Keep ref in sync so table callbacks always use latest version
    readProfileRef.current = readProfileFromConnection;

    // Re-read profile when profileReady changes or identity changes.
    // Uses readProfileRef (assigned every render on line above) so reference churn of
    // readProfileFromConnection does NOT re-fire this effect. That previously caused
    // 3x "No user found" on anon cold-load because `session` reference flips during
    // next-auth resolution, regenerating readProfileFromConnection, re-invalidating
    // this effect. Stable deps here; the latest reader is always called.
    useEffect(() => {
        if (!isActive || !profileReady) {
            setCurrentUser(null);
            return;
        }
        const conn = getConnection();
        if (!conn) return;
        readProfileRef.current(conn);
    }, [isActive, profileReady, identity, getConnection]);

    // Discord linking logic (same intent pattern, updated body)
    const DISCORD_INTENT_KEY = 'discord_login_intent';
    const DISCORD_INTENT_TIMEOUT_KEY = 'discord_login_intent_ts';
    const DISCORD_INTENT_TTL_MS = 5 * 60 * 1000; // 5 min — Discord OAuth round-trip including slow networks
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

    // Effect retriggers on any dep change; getConnection is assumed referentially stable
    // (SDK contract, see spacetimedb/react). autoRegisteredRef + linkingRef guard against
    // re-entrancy if that assumption ever breaks.
    useEffect(() => {
        if (nextAuthStatus !== "authenticated" || !session?.user) return;
        if (!isActive || !identity) return;
        if (!hasDiscordIntent && !hasMapping) return;

        const conn = getConnection();
        if (!conn) return;

        // Step A: No mapping yet -- call loginAsGuest
        if (!hasMapping && !autoRegisteredRef.current) {
            autoRegisteredRef.current = true;
            console.log('[useAuth] Discord flow Step A: calling loginAsGuest (no mapping yet)');
            loginAsGuestCall().catch((err: any) => {
                console.error('[useAuth] Discord auto-register loginAsGuest failed:', err);
                autoRegisteredRef.current = false;
            });
            return;
        }

        // Step B: Link Discord — only if user explicitly clicked "Link Discord"
        // A stale NextAuth session should NOT auto-link without explicit intent.
        if (!currentUser || !hasDiscordIntent) return;

        // D-02: Use hasDiscordLinked instead of discordId comparison
        // Also sync when hasDiscordIntent — forces identity merge on server even if
        // the displayed user already has Discord linked (Strategy 3 recovery case).
        const needsSync = hasDiscordIntent || currentUser.isGuest || !currentUser.hasDiscordLinked;

        if (needsSync && !linkingRef.current) {
            linkingRef.current = true;
            // Clear intent immediately — it served its purpose (gating Step B).
            // Prevents re-entry loop: API → onUpdate → effect → needsSync still true.
            sessionStorage.removeItem(DISCORD_INTENT_KEY);
            sessionStorage.removeItem(DISCORD_INTENT_TIMEOUT_KEY);
            console.log(`[useAuth] Discord flow Step B: linking Discord for user id=${currentUser.id} (isGuest=${currentUser.isGuest})`);
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
                    console.log('[useAuth] Discord link API returned 200 — waiting for subscription update');
                    // Keep linkingRef true on success — prevents re-entry loop
                    // (memoized hasDiscordIntent stays true until next render cycle)
                })
                .catch(e => {
                    console.error("Failed to link Discord:", e);
                    linkingRef.current = false; // Allow retry on failure
                });
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

    // D-03: clear guestLoginPending once currentUser resolves (success path).
    // Error path clears inside loginGuest's .catch above.
    useEffect(() => {
        // Only act when guestLoginPending was actually true — otherwise the log fires spuriously
        // on every currentUser reference change (Scenario 2 reconnect, Scenario 3 Discord relink)
        // even though nothing is transitioning.
        if (currentUser && guestLoginPending) {
            console.log(`[useAuth] guestLoginPending → false (currentUser resolved: id=${currentUser.id})`);
            setGuestLoginPending(false);
        }
    }, [currentUser, guestLoginPending]);

    const isLinkingDiscord = hasDiscordIntent && nextAuthStatus === "authenticated" && (!currentUser || currentUser.isGuest);

    // If a session cookie exists, suppress LOGIN until auth resolves.
    // (hadSessionCookie / hadUserIdOnMount refs are declared at mount, above the Stage 2 gate.)
    const isOrphanedIdentity = profileReady && !hasMapping;
    const isWaitingForData = !currentUser && (hadUserIdOnMount.current || hadSessionCookie.current) && !isOrphanedIdentity;
    const isConnecting = !isActive && !connectionError;

    const isAuthenticated = !!currentUser && !isLinkingDiscord;
    const isLoadingData = isLinkingDiscord || isWaitingForData;

    const loginGuest = useCallback(() => {
        console.log('[useAuth] guestLoginPending → true (loginAsGuest click)');
        setGuestLoginPending(true);
        loginAsGuestCall().catch((err: any) => {
            console.error('[useAuth] loginGuest failed:', err);
            console.log('[useAuth] guestLoginPending → false (error path)');
            setGuestLoginPending(false);
        });
        // Success path: cleared reactively by the useEffect([currentUser]) below.
    }, [loginAsGuestCall]);

    const loginDiscord = useCallback(() => {
        sessionStorage.setItem(DISCORD_INTENT_KEY, '1');
        sessionStorage.setItem(DISCORD_INTENT_TIMEOUT_KEY, String(Date.now()));
        signIn("discord");
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        clearSessionCookie();
        signOut({ callbackUrl: '/' });
    }, []);

    const deleteGuestAccount = useCallback(() => {
        deleteGuestAccountCall().catch((err: any) => {
            console.error('[useAuth] deleteGuestAccount failed:', err);
        });
        localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        clearSessionCookie();
        signOut({ callbackUrl: '/' });
    }, [deleteGuestAccountCall]);

    // Phase 16 D-03: subscription-owner coordination.
    //
    // INTERNAL USE ONLY — exposed on the useAuth return shape so that AuthProvider (Stage 1
    // view_my_profile owner) and (authed)/layout.tsx (Stage 2 User owner) can drive the
    // existing state machine from their respective effect callbacks. Consumers outside
    // those two owners must NOT call these — doing so only flips local UI state, grants
    // no privilege, and violates the provider/layout-owns-lifecycle architectural invariant.
    //
    // triggerReadProfile is a useRef-backed ref so callers always hit the latest reader
    // without re-renders; wrap in a stable callback that forwards to readProfileRef.current.
    const triggerReadProfile = useCallback(() => {
        const conn = getConnection();
        if (!conn) return;
        readProfileRef.current(conn);
    }, [getConnection]);

    // Memoize the return so consumers (9 useAuthContext callers including NavBar,
    // AuthRequired, useProfile, layouts) skip re-renders when upstream providers
    // cause AuthProvider to re-render without any auth-relevant state change.
    // Before this memo: 12 AuthProvider renders -> 12 cascades to every consumer.
    // After: cascade only fires when a listed semantic dep actually changes.
    return useMemo(() => ({
        identity: identity || null,
        user: currentUser,
        isAuthenticated,
        isConnecting,
        isLoadingData,
        connectionError,
        isDeleted,
        guestLoginPending,
        loginGuest,
        loginDiscord,
        logout,
        deleteGuestAccount,
        /** @internal Phase 16 D-03 — AuthProvider calls this from view_my_profile.onApplied. */
        setProfileReady,
        /** @internal Phase 16 D-03 — AuthProvider + (authed)/layout.tsx call this from subscription callbacks. */
        triggerReadProfile,
    }), [
        identity, currentUser, isAuthenticated, isConnecting, isLoadingData,
        connectionError, isDeleted, guestLoginPending,
        loginGuest, loginDiscord, logout, deleteGuestAccount,
        setProfileReady, triggerReadProfile,
    ]);
}
