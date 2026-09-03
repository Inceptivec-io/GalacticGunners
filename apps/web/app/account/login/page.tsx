'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { safeInternalRedirect } from '../../../lib/internalRedirect';

async function csrf() { const response = await fetch('/api/v1/auth/csrf/', { credentials: 'same-origin' }); return (await response.json()).csrf_token as string; }

function AccountLoginForm() {
  const router = useRouter(); const search = useSearchParams(); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await fetch('/api/v1/auth/login/', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'X-CSRFToken': await csrf() }, body: JSON.stringify({ username: form.get('username'), password: form.get('password'), audience: 'PLAYER_ACCOUNT' }) });
    if (!response.ok) { setError('Unable to sign in with those credentials.'); return; }
    router.replace(safeInternalRedirect(search.get('next'), '/account'));
  }
  return <main className="admin-session-state"><h1>Player sign in</h1><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">Sign in</button></form>{error ? <p role="alert">{error}</p> : null}<a href="/account/register">Create account</a></main>;
}

export default function AccountLoginPage() {
  return <Suspense fallback={<main className="admin-session-state" role="status">Preparing secure login...</main>}><AccountLoginForm /></Suspense>;
}
