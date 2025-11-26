import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { Header } from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwingAI - Golf Swing Analyzer",
  description: "AI-powered golf swing analysis for golfers of all levels. Get instant feedback, drills, and tips to improve your game.",
  keywords: ["golf", "swing analysis", "AI", "golf lessons", "golf drills", "improve golf"],
  authors: [{ name: "SwingAI" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SwingAI",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <DesktopSidebar />
        <div className="md:ml-64">
          <Header />
          <main className="min-h-screen pb-24 md:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
