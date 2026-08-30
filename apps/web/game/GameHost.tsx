'use client';

import { useEffect, useRef, useState } from 'react';
import type { LevelRuntimeConfig } from '@galactic-gunners/game';

import { publicConfig } from '../lib/config/publicConfig';

export function GameHost() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<unknown>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;

    async function mountGame() {
      if (!hostRef.current || gameRef.current) {
        return;
      }
      try {
        await Promise.all([
          document.fonts.load('24px GalacticGunnersGoldDisplay'),
          document.fonts.load('24px GalacticGunnersSilverDisplay'),
          document.fonts.load('24px GalacticGunnersHUD'),
        ]);
        const gameModule = await import('@galactic-gunners/game');
        if (!active || !hostRef.current) {
          return;
        }
        const params = new URLSearchParams(window.location.search);
        // Diagnostic controls are an explicit build capability. A query string
        // alone must never enable them in a normal Founder or production build.
        const hostileQa = process.env.NEXT_PUBLIC_GG_QA_MODE === 'true' && params.get('qa') === 'hostile';
        const apiBaseUrl = params.get('api') === 'offline'
          ? 'http://127.0.0.1:8999/api/v1'
          : publicConfig.apiBaseUrl;
        const previewLevelId = params.get('preview_level_id');
        const previewChecksum = params.get('preview_checksum');
        let previewRuntime: LevelRuntimeConfig | undefined;
        if (previewLevelId && previewChecksum) {
          const previewPath = params.get('preview_organization')
            ? `/portal/organizations/${encodeURIComponent(params.get('preview_organization')!)}/maps/${encodeURIComponent(previewLevelId)}/preview/${encodeURIComponent(previewChecksum)}/`
            : `/admin/levels/${encodeURIComponent(previewLevelId)}/preview/${encodeURIComponent(previewChecksum)}/`;
          const response = await fetch(`${apiBaseUrl}${previewPath}`, { credentials: 'same-origin' });
          if (!response.ok) throw new Error('The requested Designer preview is unavailable or no longer authorised.');
          const preview = await response.json() as { config: unknown; version: number; checksum: string };
          if (preview.checksum !== previewChecksum) throw new Error('Designer preview checksum did not reconcile.');
          previewRuntime = { definition: gameModule.compileLevelDocument(preview.config as LevelRuntimeConfig['definition']), version: preview.version, checksum: preview.checksum, source: 'remote' };
        }
        gameRef.current = await gameModule.createGalacticGunnersGame({
          parent: hostRef.current,
          apiBaseUrl,
          hostileQa,
          allowOfflinePackage: params.get('api') === 'offline',
          previewRuntime,
          onReady: () => setStatus('ready'),
        });
      } catch (error) {
        console.error('Failed to mount Galactic Gunners runtime', error);
        if (active) {
          setStatus('error');
        }
      }
    }

    void mountGame();

    return () => {
      active = false;
      if (gameRef.current) {
        void import('@galactic-gunners/game').then((gameModule) => {
          gameModule.destroyGalacticGunnersGame(gameRef.current as never);
          gameRef.current = null;
        });
      }
    };
  }, []);

  return (
    <section aria-label="Galactic Gunners game runtime" data-game-host className="game-host">
      <div ref={hostRef} className="game-canvas-host" />
      {status !== 'ready' ? (
        <p className="game-status" role={status === 'error' ? 'alert' : 'status'}>
          {status === 'error' ? 'Unable to start Galactic Gunners runtime.' : 'Loading Galactic Gunners...'}
        </p>
      ) : null}
    </section>
  );
}
