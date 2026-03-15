'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  onAuthDetected: () => void;
  redirectPath?: string;
}

export default function InlineMagicLink({ onAuthDetected, redirectPath }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSend = async () => {
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...(redirectPath ? { redirect: redirectPath } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link');
    } finally {
      setSending(false);
    }
  };

  // Poll for session after sending magic link
  useEffect(() => {
    if (!sent) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated) {
          if (pollRef.current) clearInterval(pollRef.current);
          onAuthDetected();
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sent, onAuthDetected]);

  if (sent) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-800">Check your email</p>
        <p className="mt-1 text-sm text-blue-600">
          We sent a sign-in link to <strong>{email}</strong>. Click it to continue.
        </p>
        <p className="mt-2 text-xs text-blue-500">
          Waiting for you to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">
        Sign in to save your profile and find matches
      </p>
      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && email && handleSend()}
        />
        <button
          type="button"
          disabled={!email || sending}
          onClick={handleSend}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {sending ? 'Sending...' : 'Send link'}
        </button>
      </div>
    </div>
  );
}
