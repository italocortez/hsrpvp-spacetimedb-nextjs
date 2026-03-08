import { Identity, Timestamp } from 'spacetimedb';

// Mirror the Role enum from your backend enums.ts
export type UserRole =
    | { tag: "User" }
    | { tag: "Admin" }
    | { tag: "TournamentHost" };

// Mirrors spacetimedb/tables/user.ts (id-based, not identity-based)
export interface User {
    id: number;
    username: string;
    displayName: string;
    isGuest: boolean;
    lastLoginAt: Timestamp;
    role: UserRole;
    discordId?: string;
    avatarCharacterName: string;
}

// Mirrors spacetimedb/tables/userIdentity.ts
export interface UserIdentityRow {
    identity: Identity;
    userId: number;
    lastSeenAt: Timestamp;
}

export interface AuthState {
    identity: Identity | null;
    user: User | null;
    isAuthenticated: boolean;
    isConnecting: boolean;
    isLoadingData: boolean;
    connectionError: Error | undefined;
}
