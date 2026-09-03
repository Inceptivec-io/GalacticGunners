import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="home-shell">
      <div className="home-overlay" />
      <section className="home-content" aria-label="Galactic Gunners launch">
        <Image src="/gg-runtime-assets/branding/gg_logo_primary_v002.png" alt="Galactic Gunners" className="home-logo" width={1024} height={512} priority />
        <p className="home-tagline">Defend the galaxy</p>
        <div className="home-actions"><Link href="/play" className="home-play-link">Play</Link><Link href="/leaderboard" className="home-leaderboard-link">Leaderboard</Link></div>
      </section>
    </main>
  );
}
