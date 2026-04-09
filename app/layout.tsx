// Root layout: wraps app in UserProvider for simulated auth context.
// The tenant-specific header/sidebar is rendered conditionally in page layouts.
import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from "@/lib/user-context";
import { TenantHeader } from "@/app/components/tenant-header";
import { DocsSidebar } from "@/app/components/docs-sidebar";
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

async function TenantShell({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const tenant = hdrs.get("x-tenant");
  const pathname = hdrs.get("x-pathname");

  // Root domain or /admin: render children directly (no docs shell)
  if (!tenant || pathname === "/admin") {
    return <>{children}</>;
  }

  // Tenant subdomain: render the docs layout with header + sidebar
  return (
    <div className="flex flex-col h-full">
      <TenantHeader tenantSlug={tenant} />
      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar tenant={tenant} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

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
      <body className="h-full flex flex-col">
        <UserProvider>
          <Suspense>
            <TenantShell>{children}</TenantShell>
          </Suspense>
        </UserProvider>
      </body>
    </html>
  );
}
