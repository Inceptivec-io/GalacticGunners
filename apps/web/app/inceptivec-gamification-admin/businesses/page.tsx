import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
export default function BusinessesPage() { return <AdminGate><main className="admin-session-state"><h1>Businesses</h1><AdminNavigation /><p>Organisation plans, capabilities and active-map quotas are controlled from this protected surface.</p></main></AdminGate>; }
