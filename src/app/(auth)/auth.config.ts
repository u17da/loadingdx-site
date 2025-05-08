import type { NextAuthOptions } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { randomUUID } from 'crypto';

/** Next-Auth 設定（v4 用） */
export const authOptions: NextAuthOptions = {
  // ─── 認証プロバイダ ───────────────────────
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    Credentials({
      id: 'guest',
      name: 'Guest',
      credentials: { guest: { label: 'guest', type: 'hidden' } },
      async authorize() {
        /* ゲスト用ダミーユーザーを返す */
        return { id: randomUUID(), name: 'ゲストさん', type: 'guest' as const };
      },
    }),
  ],

  // ─── セッション ────────────────────────────
  session: { strategy: 'jwt' },

  // ─── デバッグ ──────────────────────────────
  debug: process.env.NODE_ENV !== 'production',
};

/* 他モジュールから import しやすいように default でもエクスポート */
export default authOptions;
