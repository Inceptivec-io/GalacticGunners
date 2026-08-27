'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

type Session = { authenticated: boolean; platform_access: boolean };

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'login' | 'denied' | 'ready' | 'error'>('checking');

  useEffect(() => {
    fetch('/api/v1/auth/session/', { credentials: 'include' })
      .then((response) => response.ok ? response.json() as Promise<Session> : Promise.reject())
      .then((session) => {
        if (!session.authenticated) {
          router.replace(`/inceptivec-gamification-admin/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setState(session.platform_access ? 'ready' : 'denied');
      })
      .catch(() => setState('error'));
  }, [pathname, router]);

  if (state === 'ready') return <>{children}</>;
  if (state === 'checking') return <main className="admin-session-state" role="status">Checking secure session...</main>;
  if (state === 'login') return <main className="admin-session-state" role="status">Redirecting to secure login...</main>;
  if (state === 'denied') return <main className="admin-session-state"><h1>Access denied</h1><p>Your account is not authorised for the platform portal.</p><Link href="/account">Account</Link></main>;
  return <main className="admin-session-state"><h1>Service unavailable</h1><p>The platform service is temporarily unavailable. Please retry.</p></main>;
}
