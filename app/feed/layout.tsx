import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Feed | MoonFluxx',
  description: 'AI-curated token feed with real-time match scores. Swipe through high-conviction picks.',
  openGraph: {
    title: 'AI Feed | MoonFluxx',
    description: 'AI-curated token feed with real-time match scores. Swipe through high-conviction picks.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
