import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') ?? '/';

  /* ----- ① JWT を自前生成（Guest 用） ----- */
  const token = await new SignJWT({
    name: 'Guest',
    email: 'guest@example.com',
    picture: null,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

  /* ----- ② Cookie にセット ----- */
  cookies().set('next-auth.session-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return NextResponse.redirect(redirectUrl);
}
