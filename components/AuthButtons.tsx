'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
      >
        Sign out ({session.user?.name ?? 'user'})
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => signIn('github')}
      >
        Sign in with GitHub
      </button>

      <span style={{ margin: '0 0.5rem' }} />

      <button
        type="button"
        onClick={() =>
          signIn('guest', { redirect: false, callbackUrl: '/' })
        }
      >
        Sign in as Guest
      </button>
    </>
  );
}
