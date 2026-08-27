import type { Metadata } from 'next';

import { CampaignDesigner } from './CampaignDesigner';
import { AdminGate } from './AdminGate';

export const metadata: Metadata = {
  title: 'Campaign Designer | Galactic Gunners',
  robots: { index: false, follow: false },
};

export default function CampaignDesignerPage() {
  return <AdminGate><CampaignDesigner /></AdminGate>;
}
