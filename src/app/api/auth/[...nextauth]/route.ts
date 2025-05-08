import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { randomUUID } from 'node:crypto';

export const authOptions = {
  providers: [
    // --- GitHub OAuth ---
    GitHub({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),

    // --- Guest login ---
    Credentials({
      id: 'guest',
      name: 'Guest',
      credentials: { guest: { label: 'guest', type: 'hidden' } },
      async authorize() {
        return { id: randomUUID(), name: 'ゲストさん', type: 'guest' };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  debug: process.env.NODE_ENV !== 'production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
