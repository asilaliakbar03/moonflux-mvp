import type { Metadata } from "next";
import "./globals.css";
import FluidBackground from "@/components/hud/FluidBackground";
import Dock from "@/components/hud/Dock";
import TopBar from "@/components/hud/TopBar";
import { ToastProvider } from "@/components/ToastProvider";
import { SolanaProvider } from "@/components/SolanaProvider";

export const metadata: Metadata = {
  title: "MoonFluxx® — The AI-Powered Launch Ecosystem",
  description: "Where ideas become movements. The operating system of the next bull run.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen text-mf-ink selection:bg-mf-violet/40 selection:text-white">
        
        {/* WebGL Background */}
        <FluidBackground />
        
        {/* Grain Overlay */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

        <SolanaProvider>
          <ToastProvider>
            {/* HUD Navigation */}
            <TopBar />
            <Dock />
    
            {/* Main Content Area */}
            <main className="relative pt-20 pb-16 md:pb-24 px-4 md:px-6 flex flex-col" style={{ height: "100vh", overflow: "hidden auto" }}>
              {children}
            </main>
          </ToastProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
