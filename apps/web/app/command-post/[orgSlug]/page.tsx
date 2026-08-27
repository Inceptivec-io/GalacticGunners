import { CommandPostGate } from '../CommandPostGate';
import { CommandPostWorkspace } from '../CommandPostWorkspace';

export default function OrganizationCommandPost({ params }: { params: { orgSlug: string } }) {
  return <CommandPostGate><CommandPostWorkspace orgSlug={params.orgSlug} /></CommandPostGate>;
}
