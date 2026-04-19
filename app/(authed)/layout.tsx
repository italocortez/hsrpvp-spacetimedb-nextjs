'use client';

import React, { useEffect, useRef } from 'react';
import { useSpacetimeDB } from 'spacetimedb/react';
import AuthRequired from '@/components/features/auth/components/AuthRequired';
import DeletionBanner from '@/components/features/auth/components/DeletionBanner';
import { useAuthContext } from '@/components/features/auth/components/AuthProvider';
import styles from './layout.module.css';

/**
 * Stage 2 User subscribe owner (Phase 16 D-07, D-08).
 *
 * Relocated out of useAuth.ts (was lines 115-181 pre-refactor). The layout only mounts
 * when the URL matches an authed route — Next.js App Router guarantees it will NOT mount
 * for /, /costs, /teambuilder. The route-group mount IS the structural gate replacing
 * the 15.5 ref-based `stage2Gate` check (currentUser != null || hadUserIdOnMount ||
 * hadSessionCookie). Anonymous visitors therefore receive zero User rows — same
 * observable behavior, simpler implementation.
 *
 * Mechanism choice (RESEARCH Open Question 1): conn.subscriptionBuilder() ("Option B").
 * Yields the cleanest diff against the former useAuth Stage 2 effect — same SQL, same
 * onApplied semantics with the currentUser dedupe, same onUserInsert/onUserUpdate
 * callbacks. useTable (Option A) would still require a secondary useEffect to attach
 * onInsert/onUpdate and would lose the fast-reconnect `cancelled` guard below.
 *
 * D-11 subscribedRef guard: React 18 Strict Mode double-mount defense, replicated here.
 * D-13: AuthRequired reads currentUser (from view_my_profile) not User rows, so routing
 * decisions remain independent of this subscription's readiness.
 */
export default function AuthedLayout({ children }: { children: React.ReactNode }) {
    const { isActive, getConnection } = useSpacetimeDB();
    const auth = useAuthContext();
    // Avoid re-running the subscribe effect on every currentUser transition — we capture
    // the value into a ref and read it inside the onApplied dedupe branch instead.
    const currentUserRef = useRef(auth.user);
    currentUserRef.current = auth.user;

    const subscribedRef = useRef(false); // D-11 Strict Mode double-mount defense

    useEffect(() => {
        if (!isActive) {
            console.log('[authedLayout] Stage 2 skip: connection not active');
            return;
        }
        if (subscribedRef.current) return;
        const conn = getConnection();
        if (!conn) return;
        subscribedRef.current = true;

        // Fast-reconnect guard (15.5 WR-04): onApplied may fire after cleanup runs
        // if the connection dropped + re-established quickly. Without this flag the
        // stale callback would iterate a stale cache and push outdated rows through.
        let cancelled = false;

        console.log('[authedLayout] Stage 2 mount+subscribe: SELECT * FROM user (route-group mount IS the gate per D-07)');
        conn.subscriptionBuilder()
            .onApplied(() => {
                if (cancelled) return;
                console.log('[authedLayout] Stage 2 onApplied: User subscription active');
                // Dedupe: if currentUser already resolved (Stage 1 delivered first on the
                // fresh-guest path), skip. Only re-read when Stage 2 raced ahead of
                // view_my_profile (returning-user path).
                if (currentUserRef.current) {
                    console.log('[authedLayout] Stage 2 onApplied: skipping readProfile (already resolved by Stage 1)');
                    return;
                }
                auth.triggerReadProfile();
            })
            .subscribe('SELECT * FROM user');

        // Pitfall 5: filter SubscribeApplied events out of onInsert/onUpdate callbacks.
        const isLiveChange = (ctx: any) => {
            const tag = ctx?.event?.tag;
            return tag === 'Reducer' || tag === 'Transaction';
        };

        const onUserInsert = (ctx: any, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[authedLayout] User.onInsert: id=${row?.id} username=${row?.username}`);
            auth.triggerReadProfile();
        };
        const onUserUpdate = (ctx: any, oldRow: any, row: any) => {
            if (!isLiveChange(ctx)) return;
            console.log(`[authedLayout] User.onUpdate: id=${row?.id} username=${row?.username} (was: ${oldRow?.username})`);
            auth.triggerReadProfile();
        };
        conn.db.User.onInsert(onUserInsert);
        conn.db.User.onUpdate(onUserUpdate);

        return () => {
            console.log('[authedLayout] Stage 2 unmount: removing User handlers');
            cancelled = true;
            conn.db.User.removeOnInsert(onUserInsert);
            conn.db.User.removeOnUpdate(onUserUpdate);
            subscribedRef.current = false;
            // Do NOT reset setProfileReady — AuthProvider Stage 1 owns that.
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- auth ref members are stable via useCallback;
        // currentUser is read through currentUserRef to avoid effect retrigger churn.
    }, [isActive, getConnection]);

    return (
        <div className={styles.layout_wrapper}>
            <AuthRequired>
                <DeletionBanner />

                {children}
            </AuthRequired>
        </div>
    );
}
