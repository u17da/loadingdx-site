// app/api/guest/route.ts  全文
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ───── ① HS512 でダミー JWT を発行
async function createGuestJWT() {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

  const jwt = await new SignJWT({
    email: 'guest@example.com',
    name: 'Guest User',
    guest: true,
  })
    .setProtectedHeader({ alg: 'HS512', typ: 'JWT' })   // ← HS512 に変更
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  return jwt;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirectUrl = searchParams.get('redirectUrl') ?? '/';

  // ② JWT を発行してブラウザに渡す
  const jwt = await createGuestJWT();

  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set('next-auth.session-token', jwt, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
  return res;
}
