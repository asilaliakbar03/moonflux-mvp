import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reputation Graph | MoonFluxx',
  description: 'Visualize the Solana ecosystem. Track connections between founders, wallets, projects, and investors.',
  openGraph: {
    title: 'Reputation Graph | MoonFluxx',
    description: 'Visualize the Solana ecosystem. Track connections between founders, wallets, projects, and investors.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
