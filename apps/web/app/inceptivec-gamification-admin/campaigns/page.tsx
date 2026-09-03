import { AdminGate } from '../AdminGate';
import { AdminNavigation } from '../AdminNavigation';
import { CampaignDesigner } from '../CampaignDesigner';

export default function CampaignsPage() { return <AdminGate><main className="admin-session-state"><h1>CORE Campaigns</h1><AdminNavigation /><CampaignDesigner /></main></AdminGate>; }
