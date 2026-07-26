import type { Metadata } from "next";
import "./globals.css";
import FluidBackground from "@/components/hud/FluidBackground";
import Sidebar from "@/components/hud/Sidebar";
import TopBar from "@/components/hud/TopBar";
import { ToastProvider } from "@/components/ToastProvider";
import { SolanaProvider } from "@/components/SolanaProvider";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "MoonFluxx — Launch, Trade & Discover Tokens",
  description: "The easiest way to launch, discover, and trade memecoins across multiple chains. AI-powered. Community-first.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen overflow-x-clip"
      >
        <SmoothScroll />
        <ScrollProgress />
        <Preloader />
        <CustomCursor />
        <FluidBackground />
        
        {/* Grain overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.015,
            mixBlendMode: "overlay",
          }}
        />

        <SolanaProvider>
          <ToastProvider>
            {/* Top navigation bar */}
            <TopBar />

            {/* Left sidebar — desktop only */}
            <Sidebar />

            {/* Main content */}
            <main
              className="relative z-10 pt-[64px] md:pl-[72px] min-h-screen"
            >
              <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
                <PageTransition>
                  {children}
                </PageTransition>
              </div>
            </main>
          </ToastProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
