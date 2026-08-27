'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';

type DesignerLevel = { id: string; slug: string; name: string; sequence: number; active_version?: { version: number; status: string; checksum: string } | null };

const tools = ['Player', 'Scout formation', 'Bunker', 'Shield tile', 'Hazard', 'NUKE drop', 'LIFE drop', 'Boarding anchor'];

export function CampaignDesigner() {
  const [levels, setLevels] = useState<DesignerLevel[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('Loading governed level catalogue...');
  const [zoom, setZoom] = useState(1);

  const selectedLevel = useMemo(() => levels.find((level) => level.id === selected) ?? null, [levels, selected]);
  async function call(path: string, init?: RequestInit) {
    const response = await fetch(`/api/v1${path}`, {
      credentials: 'same-origin',
      headers: { ...(init?.body ? { 'content-type': 'application/json' } : {}), ...init?.headers },
      ...init,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
  }
  async function load() {
    try {
      const value = await call('/levels/'); setLevels(value.results ?? value); setMessage('Published level catalogue loaded.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load levels.'); }
  }
  useEffect(() => { void load(); }, []);
  async function generate() {
    try {
      const value = await call('/admin/levels/generate/', { method: 'POST', body: JSON.stringify({ sequence: levels.length + 2, seed: 12000 + levels.length + 2 }) });
      setLevels((current) => [...current, value]); setSelected(value.id); setMessage(`Draft ${value.slug} generated. It is not published.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Generation failed.'); }
  }
  async function lifecycle(action: 'validate' | 'publish' | 'archive' | 'clone' | 'rollback') {
    if (!selectedLevel) return;
    try { await call(`/admin/levels/${selectedLevel.id}/${action}/`, { method: 'POST', body: '{}' }); setMessage(`${action} completed.`); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : `${action} failed.`); }
  }
  return <main className="designer-shell" data-designer-route="hidden">
    <aside className="designer-sidebar"><h1>Campaign Designer</h1><button onClick={load}>Refresh levels</button><button onClick={generate}>Generate draft</button><section><h2>Layers</h2>{['Background', 'Formation', 'Shields', 'Pickups', 'Objectives'].map((layer) => <label key={layer}><input type="checkbox" defaultChecked />{layer}</label>)}</section><section><h2>Palette</h2>{tools.map((tool) => <button key={tool} className="tool-button">{tool}</button>)}</section></aside>
    <section className="designer-workspace"><header><strong>{selectedLevel?.name ?? 'No level selected'}</strong><span>{message}</span><label>Zoom <input aria-label="Canvas zoom" type="range" min="0.6" max="1.5" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label></header><div className="designer-canvas" style={{ '--designer-zoom': zoom } as CSSProperties} aria-label="Level canvas"><div className="designer-playfield"><div className="designer-formation">Scout formation</div><div className="designer-bunkers">8 bunkers / 256 tiles</div><div className="designer-player">Player</div></div></div><footer><button onClick={() => lifecycle('clone')} disabled={!selected}>Clone</button><button onClick={() => lifecycle('validate')} disabled={!selected}>Validate</button><button onClick={() => lifecycle('publish')} disabled={!selected}>Publish</button><button onClick={() => lifecycle('rollback')} disabled={!selected}>Rollback</button><button onClick={() => lifecycle('archive')} disabled={!selected}>Archive</button><button onClick={() => selected && window.open(`/play?level=${selected}`, '_blank')} disabled={!selected}>Same-runtime preview</button></footer></section>
    <aside className="designer-inspector"><h2>Level list</h2>{levels.map((level) => <button key={level.id} onClick={() => setSelected(level.id)} className={selected === level.id ? 'selected' : ''}>{level.sequence}. {level.name}<small>{level.active_version?.status ?? 'DRAFT'}</small></button>)}<h2>Inspector</h2><p>Use the palette and layer controls to compose a validated draft. Publishing is server-authorized and immutable.</p></aside>
  </main>;
}
