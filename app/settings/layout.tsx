import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | MoonFluxx',
  description: 'Customize your MoonFluxx experience. Theme, notifications, and wallet settings.',
  openGraph: {
    title: 'Settings | MoonFluxx',
    description: 'Customize your MoonFluxx experience. Theme, notifications, and wallet settings.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
