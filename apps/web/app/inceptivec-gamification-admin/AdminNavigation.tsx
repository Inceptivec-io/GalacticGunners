import Link from 'next/link';

export function AdminNavigation() {
  return <nav aria-label="Inceptivec Gamification Admin"><Link href="/inceptivec-gamification-admin">Overview</Link><Link href="/inceptivec-gamification-admin/campaigns">Campaigns</Link><Link href="/inceptivec-gamification-admin/businesses">Businesses</Link><Link href="/inceptivec-gamification-admin/users">Users</Link><Link href="/inceptivec-gamification-admin/scores">Scores</Link><Link href="/inceptivec-gamification-admin/logs">Logs</Link></nav>;
}
