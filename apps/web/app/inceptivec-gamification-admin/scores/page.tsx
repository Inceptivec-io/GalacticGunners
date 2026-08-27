import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
import { AdminOperationsPanel } from '../AdminOperationsPanel';
export default function ScoresPage() { return <AdminGate><main className="admin-session-state"><h1>Scores</h1><AdminNavigation /><AdminOperationsPanel resource="scores" empty="No server-validated score records are available." /></main></AdminGate>; }
