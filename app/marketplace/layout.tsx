import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acquisition Marketplace | MoonFluxx',
  description: 'Buy and sell entire crypto projects. AI-powered valuations and due diligence.',
  openGraph: {
    title: 'Acquisition Marketplace | MoonFluxx',
    description: 'Buy and sell entire crypto projects. AI-powered valuations and due diligence.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
