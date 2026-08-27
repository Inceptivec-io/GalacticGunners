'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiClient, type LeaderboardResponse } from '../../lib/api/client';

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    apiClient.getLeaderboard(100).then(setBoard).catch(() => setDegraded(true));
  }, []);

  return <main className="leaderboard-shell">
    <header className="leaderboard-header">
      <Link href="/" className="leaderboard-back">Main Menu</Link>
      <img src="/gg-runtime-assets/branding/gg_logo_primary_v002.png" alt="Galactic Gunners" />
      <Link href="/play" className="leaderboard-back">Play</Link>
    </header>
    <section className="leaderboard-panel" aria-labelledby="leaderboard-title">
      <h1 id="leaderboard-title">Global Leaderboard</h1>
      {degraded && <p role="status" className="leaderboard-status">Leaderboard service is temporarily unavailable. Your game remains playable.</p>}
      {!board && !degraded && <p role="status" className="leaderboard-status">Loading validated runs...</p>}
      {board && <>
        <p className="leaderboard-status">{board.total} validated pilot{board.total === 1 ? '' : 's'}</p>
        <ol className="leaderboard-list">
          {board.results.map((entry) => <li key={entry.run_id} className="leaderboard-row">
            <span className="leaderboard-rank">{entry.rank}</span>
            <span className="leaderboard-name">{entry.display_name}</span>
            <span className="leaderboard-level">LV {entry.campaign_level_reached}{entry.victory ? ' VICTORY' : ''}</span>
            <strong>{entry.score.toLocaleString()}</strong>
          </li>)}
        </ol>
      </>}
    </section>
  </main>;
}
