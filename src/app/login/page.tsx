'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminToken } from '@/services/adminAuth';

// Same backend address as the rest of the dashboard (.env.local / Vercel settings)
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Please enter username and password.');
      }

      // FIX: check the username and password with the backend. Before, any
      // username/password was accepted and a fake token was saved.
      let response: Response;
      try {
        response = await fetch(`${API_ORIGIN}/api/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });
      } catch {
        throw new Error(
          "Can't reach the server. It may be waking up, so wait a minute and try again."
        );
      }

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Wrong username or password.');
      }
      if (!response.ok) {
        throw new Error(data?.error || `Login failed (${response.status}).`);
      }
      if (typeof data?.token !== 'string' || !data.token) {
        throw new Error('The server did not return a login token.');
      }

      setAdminToken(data.token);
      router.replace('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-400">Sign in to manage the campus shuttle fleet</p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}