import type { Metadata } from 'next';

import { CampaignDesigner } from './CampaignDesigner';

export const metadata: Metadata = {
  title: 'Campaign Designer | Galactic Gunners',
  robots: { index: false, follow: false },
};

export default function CampaignDesignerPage() {
  return <CampaignDesigner />;
}
