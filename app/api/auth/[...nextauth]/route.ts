import NextAuth from 'next-auth/next';          // ← “/next” が必須
import Credentials from 'next-auth/providers/credentials';

// いったん ID／PW のダミー認証だけ
export const authOptions = {
  providers: [
    Credentials({
      name: 'Guest',
      credentials: {},
      async authorize() {
        return { id: 'guest', name: 'Guest', email: 'guest@example.com' };
      },
    }),
  ],
  // ここは .env.local のキーと合わせる
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
