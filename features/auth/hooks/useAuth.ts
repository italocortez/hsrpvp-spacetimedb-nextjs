import { useMemo } from 'react';
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { AuthState, User } from '../types';

export function useAuth() {
    const { isActive, identity, getConnection } = useSpacetimeDB();

    const conn = getConnection();

    const [rows, isLoading] = useTable(tables.User);
    const allUsers = rows as unknown as User[];

    const currentUser = useMemo(() => {
        if (!identity || isLoading) return null;

        return allUsers.find(u =>
            u.identity.toHexString() === identity.toHexString()
        ) || null;
    }, [allUsers, identity, isLoading]);

    const authState: AuthState = {
        identity: identity || null,
        user: currentUser,
        isAuthenticated: currentUser !== null,
        isInitializing: !isActive || isLoading,
    };

    const loginGuest = (alias: string) => {
        if (!conn) return;

        // ✅ Reducers use camelCase and MUST use object syntax for parameters
        conn.reducers.registerGuest({ displayName: alias });
    };

    const loginDiscord = () => {
        console.log("Discord OAuth flow initiated - Redirecting to provider...");
        // Future implementation: window.location.href = "/api/auth/discord";
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            const HOST = process.env.NEXT_PUBLIC_SPACETIMEDB_HOST;
            const DB_NAME = process.env.NEXT_PUBLIC_SPACETIMEDB_DB_NAME;
            localStorage.removeItem(`${HOST}/${DB_NAME}/auth_token`);
            window.location.reload();
        }
    };

    return {
        ...authState,
        loginGuest,
        loginDiscord,
        logout,
    };
}