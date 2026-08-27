'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Organization = { slug: string; name: string; role: string };

export function CommandPostHome() {
  const router = useRouter(); const [organizations, setOrganizations] = useState<Organization[]>([]); const [message, setMessage] = useState('Loading authorised organisations...');
  useEffect(() => { void fetch('/api/v1/portal/organizations/', { credentials: 'same-origin' }).then(async (response) => { if (!response.ok) throw new Error('Unable to load organisations.'); return response.json() as Promise<{ results: Organization[] }>; }).then((value) => { setOrganizations(value.results); setMessage(value.results.length ? '' : 'No active organisation memberships.'); }).catch((error) => setMessage(error.message)); }, []);
  async function logout() { const csrf = await fetch('/api/v1/auth/csrf/', { credentials: 'same-origin' }).then((response) => response.json() as Promise<{ csrf_token: string }>); await fetch('/api/v1/auth/logout/', { method: 'POST', credentials: 'same-origin', headers: { 'X-CSRFToken': csrf.csrf_token } }); router.replace('/command-post/login'); }
  return <main className="admin-session-state"><h1>Command Post</h1><p>Choose an authorised organisation.</p>{message && <p role="status">{message}</p>}<ul>{organizations.map((organization) => <li key={organization.slug}><Link href={`/command-post/${organization.slug}`}>{organization.name}</Link> <small>{organization.role}</small></li>)}</ul><nav aria-label="Command Post"><Link href="/account">Profile</Link><a href="/api/docs/" target="_blank" rel="noreferrer">Help</a><button type="button" onClick={() => void logout()}>Logout</button></nav></main>;
}
