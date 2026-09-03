import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
import { AdminOperationsPanel } from '../AdminOperationsPanel';
export default function BusinessesPage() { return <AdminGate><main className="admin-session-state"><h1>Businesses</h1><AdminNavigation /><AdminOperationsPanel resource="organizations" empty="No organisations are currently active." /></main></AdminGate>; }
