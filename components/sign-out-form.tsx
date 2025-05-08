'use client';

import { signOut } from 'next-auth/react';

export default function SignOutForm() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/sign-in' })}
      className="text-sm underline"
    >
      Sign out
    </button>
  );
}
