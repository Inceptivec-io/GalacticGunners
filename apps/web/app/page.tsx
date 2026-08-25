import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="home-shell">
      <img src="/gg-runtime-assets/branding/gg_logo_primary_v002.png" alt="Galactic Gunners" className="home-logo" />
      <Link href="/play" className="home-play-link">Play</Link>
    </main>
  );
}
