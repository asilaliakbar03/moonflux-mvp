import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Tokens | MoonFluxx',
  description: 'Discover trending Solana tokens, track bonding curves, and find the next moonshot. AI-powered token discovery.',
  openGraph: {
    title: 'Explore Tokens | MoonFluxx',
    description: 'Discover trending Solana tokens and find the next moonshot.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
