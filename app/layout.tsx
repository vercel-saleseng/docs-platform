// Root layout: wraps app in UserProvider for simulated auth context.
// Includes login toggle in a persistent header bar.
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from "@/lib/user-context";
import { LoginToggle } from "@/app/components/login-toggle";
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
  title: "Docs Platform POC",
  description: "Multi-tenant documentation platform built with Next.js 16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <a href="/" className="text-sm font-semibold text-gray-700 hover:text-black">
              Docs Platform
            </a>
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
                Admin
              </a>
              <LoginToggle />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
