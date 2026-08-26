import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="home-shell">
      <div className="home-overlay" />
      <section className="home-content" aria-label="Galactic Gunners launch">
        <img src="/gg-runtime-assets/branding/gg_logo_primary_v002.png" alt="Galactic Gunners" className="home-logo" />
        <p className="home-tagline">Defend the galaxy</p>
        <Link href="/play" className="home-play-link">Play</Link>
      </section>
    </main>
  );
}
