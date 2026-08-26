import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Galactic Gunners',
  description: 'Galactic Gunners by Inceptivec Gamification',
  icons: {
    icon: '/gg-runtime-assets/ui/icons/gg_hud_life_icon_v002.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
