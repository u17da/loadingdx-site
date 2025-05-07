// app/api/env/route.ts
export const runtime = 'edge';  // Edge Function のランタイムを使う

export async function GET() {
  // 読み込まれている環境変数を返します
  const env = {
    POSTGRES_URL: process.env.POSTGRES_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_IMAGES_ENABLED: process.env.OPENAI_IMAGES_ENABLED,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  };
  return new Response(JSON.stringify(env, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
