'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

type Session = { authenticated: boolean; surface_grants: string[] };

export function CommandPostGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'denied' | 'ready' | 'error'>('checking');

  useEffect(() => {
    fetch('/api/v1/auth/me/', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() as Promise<Session> : Promise.reject())
      .then((session) => {
        if (!session.authenticated) {
          router.replace(`/command-post/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setState(session.surface_grants.includes('COMMAND_POST') ? 'ready' : 'denied');
      })
      .catch(() => setState('error'));
  }, [pathname, router]);

  if (state === 'ready') return <>{children}</>;
  if (state === 'checking') return <main className="admin-session-state" role="status">Checking Command Post access...</main>;
  if (state === 'denied') return <main className="admin-session-state"><h1>Command Post access denied</h1><p>Your account does not have an active organisation membership.</p><Link href="/account">Account</Link></main>;
  return <main className="admin-session-state"><h1>Service unavailable</h1><p>The Command Post is temporarily unavailable. Please retry.</p></main>;
}
