import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
import { AdminOperationsPanel } from '../AdminOperationsPanel';
export default function UsersPage() { return <AdminGate><main className="admin-session-state"><h1>Users</h1><AdminNavigation /><AdminOperationsPanel resource="users" empty="No user records are available." /></main></AdminGate>; }
