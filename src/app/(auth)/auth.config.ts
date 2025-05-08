// src/app/(auth)/auth.config.ts
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { randomUUID } from 'node:crypto';

/**
 * Next-Auth 共通設定
 *  – GitHub ログイン + ゲストログインの 2 つ
 *  – JWT セッション
 */
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),

    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {
        guest: { label: 'guest', type: 'hidden' },
      },
      authorize() {
        // 必ず成功して “ゲストさん” として返す
        return { id: randomUUID(), name: 'ゲストさん', type: 'guest' as const };
      },
    }),
  ],

  session: { strategy: 'jwt' },
};
