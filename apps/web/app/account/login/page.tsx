'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

async function csrf() { const response = await fetch('/api/v1/auth/csrf/', { credentials: 'same-origin' }); return (await response.json()).csrf_token as string; }

export default function AccountLoginPage() {
  const router = useRouter(); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await fetch('/api/v1/auth/login/', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'X-CSRFToken': await csrf() }, body: JSON.stringify({ username: form.get('username'), password: form.get('password'), audience: 'PLAYER_ACCOUNT' }) });
    if (!response.ok) { setError('Unable to sign in with those credentials.'); return; }
    router.replace(new URLSearchParams(window.location.search).get('next') || '/account');
  }
  return <main className="admin-session-state"><h1>Player sign in</h1><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">Sign in</button></form>{error ? <p role="alert">{error}</p> : null}<a href="/account/register">Create account</a></main>;
}
