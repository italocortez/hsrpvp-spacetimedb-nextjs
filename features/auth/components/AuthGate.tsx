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
    const { isAuthenticated, isConnecting, connectionError, loginGuest, loginDiscord } = useAuth();

    if (connectionError) {
        return (
            <div className={styles.loading_container}>
                <p>IPC Link failed: {connectionError.message}</p>
            </div>
        );
    }

    if (isConnecting) {
        return (
            <div className={styles.loading_container}>
                <div className={styles.spinner}></div>
                <p>Connecting to IPC Program...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.gate_wrapper}>
                {message && <h2 className={styles.gate_message}>{message}</h2>}
                <LoginForm loginGuest={loginGuest} loginDiscord={loginDiscord} />
            </div>
        );
    }

    return <>{children}</>;
}
