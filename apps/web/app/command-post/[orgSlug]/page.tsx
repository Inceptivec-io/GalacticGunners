'use client';

import { useEffect, useState } from 'react';
import { CommandPostGate } from '../CommandPostGate';

type Portal = { organization: { name: string; slug: string }; plan: { code: string; limits: { active_map_limit?: number } } | null; maps: Array<{ id: string; name: string; sequence: number }>; projects: Array<{ id: string; name: string }> };
export default function OrganizationCommandPost({ params }: { params: { orgSlug: string } }) {
  const [portal, setPortal] = useState<Portal | null>(null); const [message, setMessage] = useState('Loading organisation...');
  useEffect(() => { void fetch(`/api/v1/portal/organizations/${params.orgSlug}/`, { credentials: 'same-origin' }).then(async (response) => { if (!response.ok) throw new Error('Organisation unavailable.'); return response.json() as Promise<Portal>; }).then((value) => { setPortal(value); setMessage(''); }).catch((error) => setMessage(error.message)); }, [params.orgSlug]);
  return <CommandPostGate><main className="admin-session-state">{!portal ? <p role="status">{message}</p> : <><h1>{portal.organization.name}</h1><p>Plan: {portal.plan?.code ?? 'No active plan'} · active maps: {portal.maps.length}/{portal.plan?.limits.active_map_limit ?? 0}</p><nav><a href={`/command-post/${portal.organization.slug}/maps`}>Maps</a><a href={`/command-post/${portal.organization.slug}/games`}>Games</a><a href={`/command-post/${portal.organization.slug}/scores`}>Scores</a><a href={`/command-post/${portal.organization.slug}/members`}>Members</a><a href={`/command-post/${portal.organization.slug}/plan`}>Plan</a></nav><h2>Maps</h2><ul>{portal.maps.map((map) => <li key={map.id}>{map.sequence}. {map.name}</li>)}</ul></>}</main></CommandPostGate>;
}
