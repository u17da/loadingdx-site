/**
 * next.config.ts
 * ―――――――――――――――――
 * Next.js の設定ファイルです。
 */

import { withContentlayer } from 'next-contentlayer';

const nextConfig = {
  // これまで experimental をまとめて有効化していた箇所から "ppr" を削除
  experimental: {
    // ppr: true,    ← Next.js 15.3.1 では未対応なので削除
    // もし他に必要な experimental 設定があればここに書く
  },

  // 例: SWC 上書きや画像最適化設定など…
  // swcMinify: true,
  // images: { domains: ['example.com'] },
};

export default withContentlayer(nextConfig);
