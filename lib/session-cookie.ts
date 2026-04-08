/**
 * Client-readable session cookie for SSR-safe auth state.
 * Stores display name so NavBar can render the correct UI
 * on first paint without waiting for WebSocket connection.
 *
 * NOT httpOnly — client JS needs to read/write it.
 * NOT sensitive — only contains the display name.
 */

const COOKIE_NAME = 'stdb_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setSessionCookie(displayName: string): void {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(displayName)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

/** Read from document.cookie (client-side) */
export function getSessionCookieClient(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

/** Parse from a cookie header string (server-side) */
export function getSessionCookieFromHeader(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}
