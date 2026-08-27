'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

async function csrf() { const response = await fetch('/api/v1/auth/csrf/', { credentials: 'same-origin' }); return (await response.json()).csrf_token as string; }

export default function AccountRegisterPage() {
  const router = useRouter(); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await fetch('/api/v1/auth/register/', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'X-CSRFToken': await csrf() }, body: JSON.stringify({ username: form.get('username'), display_name: form.get('display_name'), password: form.get('password') }) });
    if (!response.ok) { setError('Account creation could not be completed. Use a unique username and a stronger password.'); return; }
    router.replace('/account');
  }
  return <main className="admin-session-state"><h1>Create player account</h1><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required /></label><label>Display name<input name="display_name" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" required /></label><button type="submit">Create account</button></form>{error ? <p role="alert">{error}</p> : null}<a href="/account/login">Already have an account?</a></main>;
}
