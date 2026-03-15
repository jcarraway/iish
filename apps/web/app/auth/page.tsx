'use client';

import { useState } from 'react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send magic link');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-4 text-muted-foreground">
          We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-2xl font-bold">Sign in to OncoVax</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your email and we&apos;ll send you a magic link to sign in.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
        </div>
        {status === 'error' && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : 'Send magic link'}
        </button>
      </form>
    </div>
  );
}
