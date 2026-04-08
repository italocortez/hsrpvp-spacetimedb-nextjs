import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';
import { getServerConnection, verifyIdentityFromToken } from '@/lib/spacetimedb-server';

/**
 * POST /api/auth/link-discord
 *
 * Called by the client after Discord OAuth completes.
 * Reads the NextAuth JWT session cookie directly (more reliable than
 * getServerSession in App Router POST handlers), extracts the Discord
 * user info, verifies the client's SpacetimeDB identity via ephemeral
 * connection (D-09), and calls server_link_provider on SpacetimeDB.
 *
 * Body: { spacetimeToken: string }
 */
export async function POST(request: Request) {
    // 1. Read the NextAuth session JWT directly from cookies
    //    This avoids getServerSession's complex AuthHandler pipeline which
    //    can return null in App Router POST route handlers.
    const cookieStore = await cookies();
    const secureCookie = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false;
    const cookieName = secureCookie
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';

    // Support chunked cookies (next-auth splits large JWTs)
    const allCookies = cookieStore.getAll();
    const tokenChunks = allCookies
        .filter(c => c.name.startsWith(cookieName))
        .sort((a, b) => {
            const aSuffix = parseInt(a.name.split('.').pop() ?? '0');
            const bSuffix = parseInt(b.name.split('.').pop() ?? '0');
            return aSuffix - bSuffix;
        });
    const sessionToken = tokenChunks.map(c => c.value).join('');

    if (!sessionToken) {
        console.error('[link-discord] No session cookie found. Available cookies:',
            allCookies.map(c => c.name));
        return NextResponse.json(
            { error: 'Not authenticated with Discord — no session cookie' },
            { status: 401 }
        );
    }

    // 2. Decode the JWT to get the Discord user info
    const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
    if (!secret) {
        console.error('[link-discord] NEXTAUTH_SECRET not set');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    let token: any;
    try {
        token = await decode({ token: sessionToken, secret });
    } catch (err) {
        console.error('[link-discord] JWT decode failed:', err);
        return NextResponse.json(
            { error: 'Invalid session token' },
            { status: 401 }
        );
    }

    if (!token?.sub) {
        console.error('[link-discord] JWT decoded but no sub claim:', token);
        return NextResponse.json(
            { error: 'Discord ID not found in session' },
            { status: 401 }
        );
    }

    const discordId = token.sub;
    const discordUsername = (token.name as string) || 'DiscordUser';

    // 3. Parse the caller's SpacetimeDB token from the request body
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { spacetimeToken } = body;
    if (!spacetimeToken || typeof spacetimeToken !== 'string') {
        return NextResponse.json({ error: 'spacetimeToken is required' }, { status: 400 });
    }

    // 4. Verify the client's identity via ephemeral connection (D-09)
    let verifiedIdentityHex: string;
    try {
        verifiedIdentityHex = await verifyIdentityFromToken(spacetimeToken);
    } catch (err: any) {
        console.error('[link-discord] Identity verification failed:', err);
        return NextResponse.json(
            { error: 'Identity verification failed: ' + (err.message || 'unknown error') },
            { status: 401 }
        );
    }

    // 5. Call server_link_provider via the trusted server connection (D-10)
    try {
        const conn = await getServerConnection();
        // Fire-and-forget: WebSocket drop between dispatch and server processing
        // silently loses the call. Self-healing: hasDiscordLinked stays false,
        // client retries on next load.
        conn.reducers.serverLinkProvider({
            callerIdentityHex: verifiedIdentityHex,
            provider: 'discord',
            providerId: discordId,
            providerName: discordUsername,
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error('[link-discord] Failed:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to link Discord account' },
            { status: 500 }
        );
    }
}
