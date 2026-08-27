import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
import { AdminOperationsPanel } from '../AdminOperationsPanel';
export default function LogsPage() { return <AdminGate><main className="admin-session-state"><h1>Runtime and audit logs</h1><AdminNavigation /><AdminOperationsPanel resource="logs" empty="No platform audit or moderation events are currently retained." /></main></AdminGate>; }
