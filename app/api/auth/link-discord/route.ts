import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getServerConnection, verifyIdentityFromToken } from '@/lib/spacetimedb-server';
import { authOptions } from '@/app/api/auth/authOptions';

/**
 * POST /api/auth/link-discord
 *
 * Called by the client after Discord OAuth completes.
 * Verifies the NextAuth session server-side (trusted), then verifies the
 * client's SpacetimeDB identity via ephemeral connection (D-09), and calls
 * server_link_provider on SpacetimeDB with the verified identities.
 *
 * Body: { spacetimeToken: string }
 */
export async function POST(request: Request) {
    // 1. Verify the Discord session server-side
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Not authenticated with Discord' }, { status: 401 });
    }

    const discordUser = session.user as any;
    const discordId = discordUser.id;
    const discordUsername = discordUser.name || 'DiscordUser';

    if (!discordId) {
        return NextResponse.json({ error: 'Discord ID not found in session' }, { status: 400 });
    }

    // 2. Parse the caller's SpacetimeDB token from the request body
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

    // 3. Verify the client's identity via ephemeral connection (D-09)
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

    // 4. Call server_link_provider via the trusted server connection (D-10)
    try {
        const conn = await getServerConnection();
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
