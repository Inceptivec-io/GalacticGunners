'use client';

import { useEffect, useRef, useState } from 'react';

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
        const apiBaseUrl = params.get('api') === 'offline'
          ? 'http://127.0.0.1:8999/api/v1'
          : publicConfig.apiBaseUrl;
        gameRef.current = await gameModule.createGalacticGunnersGame({
          parent: hostRef.current,
          apiBaseUrl,
          hostileQa: params.get('qa') === 'hostile',
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
