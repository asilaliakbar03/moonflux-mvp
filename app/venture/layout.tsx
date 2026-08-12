import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Venture | MoonFluxx',
  description: 'Decentralized venture capital. Fund the next generation of Solana projects.',
  openGraph: {
    title: 'Venture | MoonFluxx',
    description: 'Decentralized venture capital. Fund the next generation of Solana projects.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
