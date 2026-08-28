import { CommandPostGate } from '../CommandPostGate';
import { CommandPostWorkspace } from '../CommandPostWorkspace';

export default async function OrganizationCommandPost({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  return <CommandPostGate><CommandPostWorkspace orgSlug={orgSlug} /></CommandPostGate>;
}
