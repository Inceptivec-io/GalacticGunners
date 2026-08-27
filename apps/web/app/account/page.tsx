'use client';

import { useEffect, useState } from 'react';

type Session = { authenticated: boolean; user: { username: string; display_name: string } | null; surface_grants: string[]; memberships: Array<{ organization_slug: string; role: string }> };
export default function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => { void fetch('/api/v1/auth/me/', { credentials: 'same-origin' }).then((r) => r.json()).then(setSession); }, []);
  if (!session) return <main className="admin-session-state">Loading account...</main>;
  if (!session.authenticated || !session.user) return <main className="admin-session-state"><h1>Player account</h1><a href="/account/login">Sign in</a> or <a href="/account/register">create an account</a>.</main>;
  return <main className="admin-session-state"><h1>{session.user.display_name}</h1><p>@{session.user.username}</p><nav><a href="/play">Play</a><a href="/leaderboard">Leaderboard</a>{session.surface_grants.includes('COMMAND_POST') ? <a href="/command-post">Command Post</a> : null}{session.surface_grants.includes('INCEPTIVEC_ADMIN') ? <a href="/inceptivec-gamification-admin">Inceptivec Admin</a> : null}</nav><p>Registered scores are eligible for server validation. Anonymous play remains unranked.</p></main>;
}
