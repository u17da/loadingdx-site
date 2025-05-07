"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session } = useSession();

  // すでにログインしている場合
  if (session) {
    return (
      <button onClick={() => signOut()}>
        Sign out ({session.user?.name ?? "user"})
      </button>
    );
  }

  // 未ログインの場合
  return (
    <button
      onClick={() => {
        console.log(">>> click fired"); // 動作確認用ログ
        signIn("github");
      }}
    >
      Sign in with GitHub
    </button>
  );
}
