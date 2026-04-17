import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { useSpacetimeDB } from 'spacetimedb/react';
import { SPACETIMEDB_TOKEN_KEY } from '@/lib/spacetimedb';
import { setSessionCookie, clearSessionCookie } from '@/lib/session-cookie';
import { AuthState, User } from '../types';

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
    const router = useRouter();
    const { data: session, status: nextAuthStatus } = useSession();
    const { isActive, identity, getConnection, connectionError } = useSpacetimeDB();

    // Track the user's profile from view_my_profile subscription
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profileReady, setProfileReady] = useState(false);
    const [guestLoginPending, setGuestLoginPending] = useState(false);
    const stage1Ref = useRef(false);
    const stage2Ref = useRef(false);

    // Dedupe: stores the last-resolved profile signature. Prevents redundant setResolvedUser
    // calls when Stage 1 (view_my_profile) and Stage 2 (User table) both resolve the same profile
    // (returning-user flow, StrictMode remount). Reset in the "no user found" path so a future
    // resolve is treated as new. Live updates pass through because any changed field flips the signature.
    const resolvedSignatureRef = useRef<string | null>(null);

    // D-01: Stage 2 gate signals. Refs initialized once at mount.
    const hadSessionCookie = useRef(typeof document !== 'undefined' && document.cookie.includes('stdb_session'));
    // D-01 revision: gate signal switched from SPACETIMEDB_TOKEN_KEY to USER_ID_KEY.
    // The SDK auto-stores an identity token on first anonymous WS connect (see app/providers.tsx onConnect),
    // so a token alone does NOT indicate prior authentication. USER_ID_KEY is only written inside
    // setResolvedUser after a real User row resolves — the correct "has authenticated" signal.
    const hadUserIdOnMount = useRef(typeof window !== 'undefined' && !!localStorage.getItem(USER_ID_KEY));

    // Stage 2 gate (D-01): opens when any of the three auth signals is present.
    // Mirrors isWaitingForData's signal set, plus currentUser != null so Stage 2
    // stays open after auth resolution.
    const stage2Gate = currentUser != null || hadUserIdOnMount.current || hadSessionCookie.current;

    // Stage 1: always-on view_my_profile subscription
    // Fires as soon as SpacetimeDB connection is active, regardless of auth state.
    // Anonymous callers receive 0 rows (ctx.sender filter); authenticated callers receive their own profile.
    useEffect(() => {
        if (!isActive || stage1Ref.current) return;
        const conn = getConnection();
        if (!conn) return;
        stage1Ref.current = true;

        console.log('[useAuth] Stage 1 subscribing: view_my_profile (always-on, anon-safe)');
        conn.subscriptionBuilder()
            .onApplied(() => {
                console.log('[useAuth] Stage 1 onApplied: view_my_profile subscription active');
                setProfileReady(true);
                readProfileRef.current(conn);
            })
            .subscribe('SELECT * FROM view_my_profile');

        const isLiveChange = (ctx: any) => {
            const tag = ctx?.event?.tag;
            return tag === 'Reducer' || tag === 'Transaction';
        };

        const onViewProfileInsert = (ctx: any, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[useAuth] view_my_profile.onInsert: id=${row?.id}`);
            readProfileRef.current(conn);
        };
        const onViewProfileUpdate = (ctx: any, oldRow: any, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[useAuth] view_my_profile.onUpdate: id=${row?.id}`);
            readProfileRef.current(conn);
        };
        conn.db.view_my_profile.onInsert(onViewProfileInsert);
        conn.db.view_my_profile.onUpdate(onViewProfileUpdate);

        return () => {
            conn.db.view_my_profile.removeOnInsert(onViewProfileInsert);
            conn.db.view_my_profile.removeOnUpdate(onViewProfileUpdate);
            stage1Ref.current = false;
            setProfileReady(false);
        };
    }, [isActive, getConnection]);

    // Stage 2: SELECT * FROM user subscription, gated on stage2Gate (D-01).
    // Anonymous visitors never fire this effect — the gate is false until auth evidence exists.
    useEffect(() => {
        if (!isActive) {
            console.log('[useAuth] Stage 2 skip: connection not active');
            return;
        }
        if (!stage2Gate) {
            console.log(`[useAuth] Stage 2 gated (anon-safe): no auth signal yet (currentUser=null, hadUserId=${hadUserIdOnMount.current}, hadCookie=${hadSessionCookie.current})`);
            return;
        }
        if (stage2Ref.current) return;
        const conn = getConnection();
        if (!conn) return;
        stage2Ref.current = true;

        // Fast-reconnect guard (WR-04): the subscription's onApplied may fire after this effect's
        // cleanup has run (e.g. connection dropped + re-established quickly, leaving the stale
        // subscription's onApplied queued). Without this flag, the callback would iterate a stale
        // conn's cache and push outdated rows through setResolvedUser.
        let cancelled = false;

        console.log(`[useAuth] Stage 2 subscribing: SELECT * FROM user (gate opened via ${currentUser ? 'currentUser' : hadUserIdOnMount.current ? 'userId' : 'cookie'})`);
        conn.subscriptionBuilder()
            .onApplied(() => {
                if (cancelled) return;
                console.log('[useAuth] Stage 2 onApplied: User subscription active');
                // Dedupe: if currentUser already resolved (fresh-guest path, where Stage 1 delivered the
                // profile row first and flipped the gate via currentUser), Stage 1's readProfile already
                // ran — skip. Only re-read on the returning-user path where Stage 2 opened via userId/cookie
                // BEFORE view_my_profile delivered, so currentUser is still null at this moment.
                if (currentUser) {
                    console.log('[useAuth] Stage 2 onApplied: skipping readProfile (already resolved by Stage 1)');
                    return;
                }
                readProfileRef.current(conn);
            })
            .subscribe('SELECT * FROM user');

        // MOVED from pre-refactor Stage 1 (was useAuth.ts:63-80).
        // User callbacks must register AFTER the SELECT * FROM user subscription is active,
        // not before — registering them in Stage 1 would make them dead code for anon visitors
        // and architecturally wrong for authed visitors. See RESEARCH §Pitfall 2.
        const isLiveChange = (ctx: any) => {
            const tag = ctx?.event?.tag;
            return tag === 'Reducer' || tag === 'Transaction';
        };

        const onUserInsert = (ctx: any, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[useAuth] User.onInsert: id=${row?.id} username=${row?.username}`);
            readProfileRef.current(conn);
        };
        const onUserUpdate = (ctx: any, oldRow: any, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[useAuth] User.onUpdate: id=${row?.id} username=${row?.username} (was: ${oldRow?.username})`);
            readProfileRef.current(conn);
        };
        conn.db.User.onInsert(onUserInsert);
        conn.db.User.onUpdate(onUserUpdate);

        return () => {
            cancelled = true;
            conn.db.User.removeOnInsert(onUserInsert);
            conn.db.User.removeOnUpdate(onUserUpdate);
            stage2Ref.current = false;
            // Do NOT reset setProfileReady — Stage 1 owns that.
        };
    }, [isActive, stage2Gate, getConnection]);

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
            console.log('[useAuth] Discord flow Step A: calling loginAsGuest (no mapping yet)');
            conn.reducers.loginAsGuest({}).catch((err: any) => {
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
        console.log('[useAuth] guestLoginPending → true (loginAsGuest click)');
        setGuestLoginPending(true);
        conn.reducers.loginAsGuest({}).catch((err: any) => {
            console.error('[useAuth] loginGuest failed:', err);
            console.log('[useAuth] guestLoginPending → false (error path)');
            setGuestLoginPending(false);
        });
        // Success path: cleared reactively by the useEffect([currentUser]) below.
    }, [getConnection]);

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
        const conn = getConnection();
        if (!conn) return;
        conn.reducers.deleteGuestAccount({}).catch((err: any) => {
            console.error('[useAuth] deleteGuestAccount failed:', err);
        });
        localStorage.removeItem(SPACETIMEDB_TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        clearSessionCookie();
        signOut({ callbackUrl: '/' });
    }, [getConnection]);

    return {
        ...authState,
        isDeleted,
        guestLoginPending,
        loginGuest,
        loginDiscord,
        logout,
        deleteGuestAccount,
    };
}
