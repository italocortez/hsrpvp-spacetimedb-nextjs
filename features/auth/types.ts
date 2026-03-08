import { Identity, Timestamp } from 'spacetimedb';

// Mirror the Role enum from your backend enums.ts
export type UserRole =
    | { tag: "User" }
    | { tag: "Admin" }
    | { tag: "TournamentHost" };

// Explicitly define the User row structure to match spacetimedb/tables/user.ts
export interface User {
    identity: Identity;
    username: string;
    displayName: string;
    isGuest: boolean;
    lastLoginAt: Timestamp;
    role: UserRole;
    discordId?: string;
    avatarCharacterName: string;
}

export interface AuthState {
    identity: Identity | null;
    user: User | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
}