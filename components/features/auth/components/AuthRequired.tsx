'use client';

import React from 'react';
import { useAuthContext } from './AuthProvider';
import styles from './AuthRequired.module.css';

interface AuthRequiredProps {
    children: React.ReactNode;
}

/**
 * AuthRequired wraps pages that need authentication.
 *
 * Unlike AuthGate, children are ALWAYS rendered in the React tree from the
 * very first mount. This ensures useTable subscriptions are created once and
 * never destroyed — they receive real-time updates without interruption.
 *
 * When not authenticated, an overlay covers the page content. The children
 * remain mounted underneath (invisible, non-interactive) so their
 * subscriptions stay alive.
 */
export default function AuthRequired({ children }: AuthRequiredProps) {
    const { isAuthenticated, isConnecting, isLoadingData, connectionError } = useAuthContext();

    return (
        <>
            {/* Overlay: shown when not authenticated */}
            {!isAuthenticated && (
                <div className={styles.overlay}>
                    {connectionError ? (
                        <div className={styles.overlay_content}>
                            <p>IPC Link failed: {connectionError.message}</p>
                        </div>
                    ) : (isConnecting || isLoadingData) ? (
                        <div className={styles.overlay_content}>
                            <div className={styles.spinner}></div>
                            <p>Connecting to IPC Program...</p>
                        </div>
                    ) : (
                        <div className={styles.overlay_content}>
                            <p className={styles.login_message}>
                                Please log in from the home page to continue.
                            </p>
                            <a href="/" className={styles.home_link}>Go to Home</a>
                        </div>
                    )}
                </div>
            )}

            {/* Children: ALWAYS rendered. Hidden visually when not authenticated,
                but kept in the React tree so subscriptions stay alive. */}
            <div className={!isAuthenticated ? styles.hidden_content : undefined}>
                {children}
            </div>
        </>
    );
}
