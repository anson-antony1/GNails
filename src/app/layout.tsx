import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50`}
      >
        <div className="flex flex-col h-full">
          {/* Top Navbar */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <h1 className="text-xl font-semibold text-gray-900">
                    G Nail Growth
                  </h1>
                  <div className="flex space-x-4">
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/check-in"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                    >
                      Check-in
                    </Link>
                    <Link
                      href="/review-insights"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                    >
                      Review Insights
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
