import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { guestRegex, isDevelopmentEnvironment } from './lib/constants';

/**
 * すべてのリクエストが最初に通るゲート
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* --- ① Playwright 用ヘルスチェック ---------------------------------- */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  /* --- ② 認可不要エンドポイント -------------------------------------- */
  if (
    pathname.startsWith('/api/auth') ||   // next-auth 本体
    pathname.startsWith('/api/guest')     // ★ ゲスト発行 API
  ) {
    return NextResponse.next();
  }

  /* --- ③ JWT 取得 ----------------------------------------------------- */
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,  // .env.local と同じキー名
    secureCookie: !isDevelopmentEnvironment,
  });

  /* --- ④ 未ログイン → /api/guest へリダイレクト ------------------------ */
  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/api/guest?redirectUrl=${redirectUrl}`, request.url),
    );
  }

  /* --- ⑤ ゲストユーザーのログイン状態判定 ------------------------------ */
  const isGuest = guestRegex.test(token.email ?? '');

  // ゲスト以外が /login /register へ来たらトップへ
  if (token && !isGuest && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

/* --- ⑥ マッチャ設定 --------------------------------------------------- */
export const config = {
  matcher: [
    '/',               // トップ
    '/chat/:id',       // チャット
    '/api/:path*',     // API すべて
    '/login',
    '/register',

    /*
     * Match すべきでない静的アセット類を除外
     * - _next/static (static files)
     * - _next/image  (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
