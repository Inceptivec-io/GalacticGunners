import { CampaignDesigner } from '../../inceptivec-gamification-admin/CampaignDesigner';
import { CommandPostGate } from '../CommandPostGate';

export default function OrganizationCommandPost({ params }: { params: { orgSlug: string } }) {
  return <CommandPostGate><CampaignDesigner context={{ surface: 'COMMAND_POST', organizationSlug: params.orgSlug }} /></CommandPostGate>;
}
