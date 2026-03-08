import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            // Requesting 'identify' gives us the ID, username, and avatar
            authorization: { params: { scope: 'identify' } },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // We attach the discord ID to the session so the frontend can see it
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };