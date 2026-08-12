import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Launch Token | MoonFluxx',
  description: 'Launch your own Solana token in minutes. AI-generated identity, custom bonding curves, IPFS metadata.',
  openGraph: {
    title: 'Launch Token | MoonFluxx',
    description: 'Launch your own Solana token in minutes. AI-generated identity, custom bonding curves, IPFS metadata.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
