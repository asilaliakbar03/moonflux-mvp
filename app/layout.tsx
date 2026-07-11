import type { Metadata } from "next";
import "./globals.css";
import FluidBackground from "@/components/hud/FluidBackground";
import Dock from "@/components/hud/Dock";
import Sidebar from "@/components/hud/Sidebar";
import TickerBar from "@/components/hud/TickerBar";
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
      <body className="antialiased min-h-screen selection:bg-[#F59E0B]/30 selection:text-white" style={{ background: "#0C0A14", color: "#F0ECE5" }}>
        
        {/* WebGL Background */}
        <FluidBackground />
        
        {/* Grain Overlay */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

        <SolanaProvider>
          <ToastProvider>
            {/* HUD Navigation */}
            <TopBar />

            {/* Stitch Redesign: Left Sidebar (desktop only) */}
            <Sidebar />

            {/* Stitch Redesign: Scrolling Ticker Bar */}
            <div className="fixed top-20 left-0 md:left-20 right-0 z-30">
              <TickerBar />
            </div>

            {/* Legacy bottom Dock (mobile only — Sidebar handles desktop) */}
            <Dock />
    
            {/* Main Content Area — offset for top bar + ticker + sidebar */}
            <main
              className="relative pt-32 pb-16 md:pb-8 md:pl-20 px-4 md:px-6 flex flex-col"
              style={{ height: "100vh", overflow: "hidden auto" }}
            >
              {children}
            </main>
          </ToastProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
