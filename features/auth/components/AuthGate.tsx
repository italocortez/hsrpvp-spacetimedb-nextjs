'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from './LoginForm';
import styles from './AuthGate.module.css';

interface AuthGateProps {
    children: React.ReactNode;
    message?: string;
}

export default function AuthGate({ children, message }: AuthGateProps) {
    const { isAuthenticated, isInitializing } = useAuth();

    // 1. Wait for SpacetimeDB websocket connection and user table sync
    if (isInitializing) {
        return (
            <div className={styles.loading_container}>
                <div className={styles.spinner}></div>
                <p>Connecting to IPC Program...</p>
            </div>
        );
    }

    // 2. If no user row exists for this identity, show the login form
    if (!isAuthenticated) {
        return (
            <div className={styles.gate_wrapper}>
                {message && <h2 className={styles.gate_message}>{message}</h2>}
                <LoginForm />
            </div>
        );
    }

    // 3. Render protected content once user is verified in the DB
    return <>{children}</>;
}