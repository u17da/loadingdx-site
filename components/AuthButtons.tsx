"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session } = useSession();

  // ========================= 既にログイン中 =========================
  if (session) {
    return (
      <button onClick={() => signOut()}>
        Sign out ({session.user?.name ?? "user"})
      </button>
    );
  }

  // ========================= 未ログイン時 =========================
  return (
    <>
      <button onClick={() => signIn("github")}>Sign in with GitHub</button>
      <span style={{ margin: "0 0.5rem" }} />
      <button
   onClick={() =>
     signIn("guest", {
       redirect: false,
       guest: "guest",      // ← ダミー値を渡す
     })
   }
 >
   Sign in as Guest
 </button>
    </>
  );
}
