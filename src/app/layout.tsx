import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "G Nail Growth",
  description: "Nail salon retention system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full relative overflow-x-hidden`}
      >
        {/* Gradient Glows */}
        <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none">
          {/* Top Center Gold Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
            style={{
              background: `radial-gradient(circle, var(--gn-gold), transparent 70%)`,
            }}
          />

          {/* Bottom Left Rose Glow */}
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
            style={{
              background: `radial-gradient(circle, var(--gn-rose), transparent 70%)`,
            }}
          />

          {/* Bottom Right Blue/Teal Glow */}
          <div
            className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full opacity-25 blur-[110px]"
            style={{
              background: `radial-gradient(circle, #3b82f6, #06b6d4, transparent 70%)`,
            }}
          />
        </div>

        {/* Main Layout */}
        <div className="flex flex-col h-full relative z-0">
          <SiteHeader />

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-12">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-slate-400">
                <p>© {currentYear} G Nail Pines – Internal Console</p>
                <p className="hidden md:block text-slate-500">
                  Built for retention & reputation, not just bookings.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
