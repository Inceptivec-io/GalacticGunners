'use client';

import { useEffect, useState } from 'react';

type Row = Record<string, string | number | boolean | null | undefined | object>;

export function AdminOperationsPanel({ resource, empty }: { resource: 'users' | 'organizations' | 'scores' | 'logs'; empty: string }) {
  const [rows, setRows] = useState<Row[]>([]); const [message, setMessage] = useState('Loading protected operational data...');
  const load = () => void fetch(`/api/v1/admin/operations/${resource}/`, { credentials: 'same-origin' }).then(async (response) => { if (!response.ok) throw new Error('Protected operational data is unavailable.'); return response.json() as Promise<{ results?: Row[]; platform_events?: Row[]; moderation_events?: Row[] }>; }).then((data) => { const values = data.results ?? [...(data.platform_events ?? []), ...(data.moderation_events ?? [])]; setRows(values); setMessage(values.length ? '' : empty); }).catch((error: Error) => setMessage(error.message));
  useEffect(() => { load(); }, [resource, empty]);
  async function moderate(entryId: string, action: 'suppress' | 'restore') { const reason = window.prompt(`Reason to ${action} this server-validated score:`)?.trim(); if (!reason) return; try { const csrf = await fetch('/api/v1/auth/csrf/', { credentials: 'same-origin' }).then((response) => response.json() as Promise<{ csrf_token: string }>); const response = await fetch(`/api/v1/admin/leaderboard/entries/${encodeURIComponent(entryId)}/${action}/`, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'X-CSRFToken': csrf.csrf_token }, body: JSON.stringify({ reason }) }); if (!response.ok) throw new Error('Moderation action was denied.'); setMessage(`Score ${action}ed with an audit record.`); load(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Moderation action failed.'); } }
  return <section className="admin-operations-panel" aria-live="polite">{message ? <p>{message}</p> : <div className="admin-operation-list">{rows.map((row, index) => <article key={String(row.id ?? index)}>{Object.entries(row).filter(([, value]) => value !== null && value !== undefined && value !== '').map(([key, value]) => <p key={key}><strong>{key.replaceAll('_', ' ')}</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>)}{resource === 'scores' && typeof row.id === 'string' ? <p><button onClick={() => moderate(row.id as string, row.visible === false ? 'restore' : 'suppress')}>{row.visible === false ? 'Restore score' : 'Suppress score'}</button></p> : null}</article>)}</div>}</section>;
}
