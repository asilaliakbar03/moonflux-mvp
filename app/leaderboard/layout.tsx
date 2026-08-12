import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard | MoonFluxx',
  description: 'Top traders, biggest gains, and most active wallets on MoonFluxx.',
  openGraph: {
    title: 'Leaderboard | MoonFluxx',
    description: 'Top traders, biggest gains, and most active wallets on MoonFluxx.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
