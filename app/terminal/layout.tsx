import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Terminal | MoonFluxx',
  description: 'Professional trading terminal with AI copilot, pump forecasts, flash crash detection, and narrative radar.',
  openGraph: {
    title: 'AI Terminal | MoonFluxx',
    description: 'Professional trading terminal with AI copilot, pump forecasts, flash crash detection, and narrative radar.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
