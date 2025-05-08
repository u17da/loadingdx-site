import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { randomUUID } from 'node:crypto';

export default function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      GitHub({
        clientId: process.env.GITHUB_ID ?? '',
        clientSecret: process.env.GITHUB_SECRET ?? '',
      }),
      Credentials({
        id: 'guest',
        name: 'Guest',
        credentials: { guest: { label: 'guest', type: 'hidden' } },
        authorize() {
          return { id: randomUUID(), name: 'ゲストさん', type: 'guest' };
        },
      }),
    ],
    session: { strategy: 'jwt' },
    debug: process.env.NODE_ENV !== 'production',
  });
}
