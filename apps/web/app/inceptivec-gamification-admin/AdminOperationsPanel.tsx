'use client';

import { useEffect, useState } from 'react';

type Row = Record<string, string | number | boolean | null | undefined | object>;

export function AdminOperationsPanel({ resource, empty }: { resource: 'users' | 'organizations' | 'scores' | 'logs'; empty: string }) {
  const [rows, setRows] = useState<Row[]>([]); const [message, setMessage] = useState('Loading protected operational data...');
  useEffect(() => { void fetch(`/api/v1/admin/operations/${resource}/`, { credentials: 'same-origin' }).then(async (response) => { if (!response.ok) throw new Error('Protected operational data is unavailable.'); return response.json() as Promise<{ results?: Row[]; platform_events?: Row[]; moderation_events?: Row[] }>; }).then((data) => { const values = data.results ?? [...(data.platform_events ?? []), ...(data.moderation_events ?? [])]; setRows(values); setMessage(values.length ? '' : empty); }).catch((error: Error) => setMessage(error.message)); }, [resource, empty]);
  return <section className="admin-operations-panel" aria-live="polite">{message ? <p>{message}</p> : <div className="admin-operation-list">{rows.map((row, index) => <article key={String(row.id ?? index)}>{Object.entries(row).filter(([, value]) => value !== null && value !== undefined && value !== '').map(([key, value]) => <p key={key}><strong>{key.replaceAll('_', ' ')}</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>)}</article>)}</div>}</section>;
}
