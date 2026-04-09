// Landing page: hub on root domain, welcome page on tenant subdomain.
// The sidebar (in layout) handles doc navigation — this page is the "home" content.
import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { getTenant, TENANTS } from "@/lib/tenants";
import { WelcomeBanner } from "@/app/components/welcome-banner";
import { DynamicTimestamp } from "@/app/components/dynamic-timestamp";

// ── Hub page (root domain) ─────────────────────────────────────────

function HubPage({ host }: { host: string }) {
  const tenants = Object.values(TENANTS);
  // Derive protocol and base domain from the current host
  // localhost:3000 → http + localhost:3000
  // docs-platform.com → https + docs-platform.com
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Docs Platform POC</h1>
      <p className="text-gray-500 mb-10">
        Multi-tenant documentation platform built with Next.js 16.
        Each tenant runs on its own subdomain.
      </p>

      <div className="grid gap-4">
        {tenants.map((t) => {
          const tenantHost = isLocal
            ? `${t.slug}.localhost:3000`
            : `${t.slug}.${host}`;
          return (
            <a
              key={t.slug}
              href={`${protocol}://${tenantHost}`}
              target="_blank"
              className="flex items-center gap-4 border border-gray-200 rounded-lg px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <span
                className="text-xs font-bold tracking-widest uppercase px-2 py-1 rounded"
                style={{ backgroundColor: t.primaryColor, color: "white" }}
              >
                {t.logoText}
              </span>
              <div>
                <h2 className="font-semibold">{t.name}</h2>
                <p className="text-sm text-gray-400">{tenantHost}</p>
              </div>
            </a>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-10">
        Each tenant also has an admin page at <code className="bg-gray-100 px-1 rounded">/admin</code>
      </p>
    </div>
  );
}

// ── Tenant welcome (subdomain) ──────────────────────────────────────

function TenantWelcome({ tenantSlug }: { tenantSlug: string }) {
  const tenant = getTenant(tenantSlug);

  return (
    <div className="max-w-3xl px-10 py-10">
      <Suspense fallback={<div className="h-12 bg-gray-100 rounded mb-6 animate-pulse" />}>
        <WelcomeBanner />
      </Suspense>

      <h1 className="text-3xl font-bold mb-3">
        {tenant.name} Developer Docs
      </h1>
      <p className="text-gray-500 leading-relaxed mb-8">
        Everything you need to integrate with the {tenant.name} API.
        Browse the guides in the sidebar to get started, or jump straight
        to the Getting Started guide.
      </p>

      <Link
        href="/docs/getting-started"
        prefetch={true}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: tenant.primaryColor }}
      >
        Get started →
      </Link>

      <Suspense
        fallback={<p className="text-xs text-gray-300 mt-12 border-t pt-4">Loading timestamp…</p>}
      >
        <DynamicTimestamp />
      </Suspense>
    </div>
  );
}

// ── Route handler ───────────────────────────────────────────────────

async function PageContent() {
  const hdrs = await headers();
  const tenant = hdrs.get("x-tenant");
  const host = hdrs.get("host") ?? "localhost:3000";

  if (!tenant) return <HubPage host={host} />;
  return <TenantWelcome tenantSlug={tenant} />;
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
