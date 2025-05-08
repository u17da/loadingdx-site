'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await signIn('email', { email, callbackUrl: '/' });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border rounded p-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Sign in'}
      </button>
    </form>
  );
}
