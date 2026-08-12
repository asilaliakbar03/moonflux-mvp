import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | MoonFluxx',
  description: 'View your portfolio, trading history, and wallet analytics.',
  openGraph: {
    title: 'Profile | MoonFluxx',
    description: 'View your portfolio, trading history, and wallet analytics.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
