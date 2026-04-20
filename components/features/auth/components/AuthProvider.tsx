'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSpacetimeDB } from 'spacetimedb/react';
import { useAuth } from '../hooks/useAuth';
import { isLiveChange } from '@/lib/spacetimedb';
import type { EventContext } from '@/src/module_bindings';

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Stage 1 view_my_profile subscribe owner (Phase 16 D-03).
 *
 * Relocated out of useAuth.ts (was lines 72-111 pre-refactor). AuthProvider mounts inside
 * SpacetimeDBProvider, so the "providers.tsx owns view_my_profile" architectural intent
 * is satisfied without touching providers.tsx itself.
 *
 * Uses conn.subscriptionBuilder() (NOT useTable) because:
 *   - view_my_profile needs an explicit .onApplied() callback to flip profileReady, which
 *     useTable does not expose.
 *   - The live-change filter must route through the reader, requiring explicit
 *     onInsert / onUpdate registration.
 *
 * Wiring to useAuth (D-03 recommended path (a)+trigger):
 *   - useAuth exposes setProfileReady + triggerReadProfile on its return shape (internal use only).
 *   - onApplied calls setProfileReady(true) + triggerReadProfile().
 *   - onInsert / onUpdate call triggerReadProfile() after isLiveChange filter.
 *
 * D-11 subscribedRef guard: replicated here for React 18 Strict Mode double-mount defense.
 */
function useViewMyProfileSubscription(auth: AuthContextType) {
    const { isActive, getConnection } = useSpacetimeDB();
    const subscribedRef = useRef(false);

    useEffect(() => {
        if (!isActive || subscribedRef.current) return;
        const conn = getConnection();
        if (!conn) return;
        subscribedRef.current = true;

        console.log('[AuthProvider] Stage 1 subscribing: view_my_profile (always-on, anon-safe)');
        conn.subscriptionBuilder()
            .onApplied(() => {
                console.log('[AuthProvider] Stage 1 onApplied: view_my_profile subscription active');
                // setProfileReady(true) alone is enough: it flips a useAuth useEffect dep,
                // which then calls readProfileRef.current(conn) on the next render. Calling
                // triggerReadProfile() here too caused a second redundant read (was the
                // second of 3x "No user found" fires on anon cold-load).
                auth.setProfileReady(true);
            })
            .subscribe('SELECT * FROM view_my_profile');

        // Pitfall 5: filter SubscribeApplied events out of onInsert/onUpdate callbacks —
        // the SDK fires them for EVERY row matching the initial state, not just live changes.
        // isLiveChange hoisted to @/lib/spacetimedb (IN-15).
        // `row` stays as `any` — the SDK's current generator emits `{ [k: string]: {} }` as
        // the row-param type on table handlers (view row-types not projected through __Infer),
        // so a narrower shape won't satisfy the callback signature. EventContext is typed (IN-01).
        const onViewProfileInsert = (ctx: EventContext, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[AuthProvider] view_my_profile.onInsert: id=${row?.id}`);
            auth.triggerReadProfile();
        };
        const onViewProfileUpdate = (ctx: EventContext, _oldRow: any, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[AuthProvider] view_my_profile.onUpdate: id=${row?.id}`);
            auth.triggerReadProfile();
        };
        conn.db.view_my_profile.onInsert(onViewProfileInsert);
        conn.db.view_my_profile.onUpdate(onViewProfileUpdate);

        return () => {
            console.log('[AuthProvider] Stage 1 cleanup: removing view_my_profile handlers');
            conn.db.view_my_profile.removeOnInsert(onViewProfileInsert);
            conn.db.view_my_profile.removeOnUpdate(onViewProfileUpdate);
            subscribedRef.current = false;
            auth.setProfileReady(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- auth ref members are stable via setState/useCallback;
        // including `auth` in deps would retrigger on every render (authState is recomputed each render).
    }, [isActive, getConnection]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    useViewMyProfileSubscription(auth);
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return ctx;
}
