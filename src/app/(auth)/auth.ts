// サーバー専用ファイル  （← 'use client' は書かない）
import { getServerSession } from 'next-auth';
import { authOptions } from './auth.config';  // 既存の Next-Auth 設定

export type UserType = 'guest' | 'user';

export async function auth() {
  // セッションが無い場合は null が返る
  return getServerSession(authOptions);
}
