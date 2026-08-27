import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
export default function ScoresPage() { return <AdminGate><main className="admin-session-state"><h1>Scores</h1><AdminNavigation /><p>Server-validated leaderboard submissions and moderation events are available to authorised platform operators.</p></main></AdminGate>; }
