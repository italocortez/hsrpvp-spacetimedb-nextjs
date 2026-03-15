import { Identity, Timestamp } from 'spacetimedb';
import { USER_ROLE_VARIANTS } from '../types/enums';

// Derived from the shared enum variants — stays in sync automatically
export type UserRole = { tag: typeof USER_ROLE_VARIANTS[number] };

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
    deletedAt?: Timestamp; // Set when admin soft-deletes; hard-delete follows after 5s
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
