import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getServerConnection } from '@/lib/spacetimedb-server';
import { authOptions } from '@/app/api/auth/authOptions';

/**
 * POST /api/auth/link-discord
 *
 * Called by the client after Discord OAuth completes.
 * Verifies the NextAuth session server-side (trusted), then calls
 * server_link_discord on SpacetimeDB with the verified Discord info.
 *
 * Body: { callerIdentityHex: string }
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

    // 2. Parse the caller's SpacetimeDB identity hex from the request body
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { callerIdentityHex } = body;
    if (!callerIdentityHex || typeof callerIdentityHex !== 'string') {
        return NextResponse.json({ error: 'callerIdentityHex is required' }, { status: 400 });
    }

    // 3. Call the server_link_discord reducer via the trusted server connection
    try {
        const conn = await getServerConnection();
        conn.reducers.serverLinkDiscord({
            callerIdentityHex,
            discordId,
            discordUsername,
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
