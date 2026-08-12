import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Launch Calendar | MoonFluxx',
  description: 'Track upcoming token launches with predicted hype scores, whale interest, and expected liquidity.',
  openGraph: {
    title: 'Launch Calendar | MoonFluxx',
    description: 'Track upcoming token launches with predicted hype scores, whale interest, and expected liquidity.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
