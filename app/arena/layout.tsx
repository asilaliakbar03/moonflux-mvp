import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Battle Arena | MoonFluxx',
  description: 'Pit tokens against each other in AI-powered head-to-head battles. Compare metrics and find the alpha.',
  openGraph: {
    title: 'Battle Arena | MoonFluxx',
    description: 'Pit tokens against each other in AI-powered head-to-head battles. Compare metrics and find the alpha.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
