import type { Metadata } from 'next';

import { CampaignDesigner } from './CampaignDesigner';
import { AdminGate } from './AdminGate';
import { AdminNavigation } from './AdminNavigation';

export const metadata: Metadata = {
  title: 'Campaign Designer | Galactic Gunners',
  robots: { index: false, follow: false },
};

export default function CampaignDesignerPage() {
  return <AdminGate><main className="admin-session-state"><h1>Inceptivec Gamification Admin</h1><AdminNavigation /><CampaignDesigner /></main></AdminGate>;
}
