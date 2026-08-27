'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';

function CommandPostLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    await fetch('/api/v1/auth/csrf/', { credentials: 'same-origin' });
    const csrf = document.cookie.split('; ').find((value) => value.startsWith('csrftoken='))?.split('=')[1] ?? '';
    const response = await fetch('/api/v1/auth/login/', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'X-CSRFToken': csrf }, body: JSON.stringify({ username: form.get('username'), password: form.get('password'), audience: 'COMMAND_POST' }) });
    if (!response.ok) { setError(response.status === 403 ? 'This account does not have Command Post access.' : 'Invalid username or password.'); return; }
    const next = search.get('next');
    router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/command-post');
  }
  return <main className="admin-session-state"><h1>Command Post</h1><form onSubmit={submit}><label>Username<input name="username" required autoComplete="username" /></label><label>Password<input name="password" required type="password" autoComplete="current-password" /></label>{error && <p role="alert">{error}</p>}<button type="submit">Log in</button></form></main>;
}

export default function CommandPostLoginPage() {
  return <Suspense fallback={<main className="admin-session-state" role="status">Preparing secure login...</main>}><CommandPostLoginForm /></Suspense>;
}
