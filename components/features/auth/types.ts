import { Identity, Timestamp } from 'spacetimedb';
import { USER_ROLE_VARIANTS } from '../types/enums';

// Derived from the shared enum variants — stays in sync automatically
export type UserRole = { tag: typeof USER_ROLE_VARIANTS[number] };

// Mirrors the view_my_profile merge of User + UserPrivate
// Public fields come from the User table (visible to all).
// Private fields (discordId, discordUsername) come from UserPrivate — only populated
// when reading via view_my_profile (the current user's own profile).
export interface User {
    id: number;
    username: string;
    displayName: string;
    isGuest: boolean;
    lastLoginAt: Timestamp;
    role: UserRole;
    hasDiscordLinked: boolean;
    avatarCharacterName: string;
    deletedAt?: Timestamp; // Set when admin soft-deletes; hard-delete follows after 5s
    // Private fields from view_my_profile merge (only available to the user themselves)
    discordId?: string;
    discordUsername?: string;
}

export interface AuthState {
    identity: Identity | null;
    user: User | null;
    isAuthenticated: boolean;
    isConnecting: boolean;
    isLoadingData: boolean;
    connectionError: Error | undefined;
}
