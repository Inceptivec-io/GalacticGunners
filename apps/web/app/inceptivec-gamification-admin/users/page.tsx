import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
export default function UsersPage() { return <AdminGate><main className="admin-session-state"><h1>Users</h1><AdminNavigation /><p>Identity, memberships and role grants are audited server-side. Passwords and session tokens are never displayed here.</p></main></AdminGate>; }
