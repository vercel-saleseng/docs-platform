// Landing page: tenant-branded doc index with cached content + dynamic welcome.
// Demonstrates "use cache" on a component, cacheTag for tenant-level invalidation,
// and Suspense boundaries around dynamic sections for PPR.
import { Suspense } from "react";
import { headers } from "next/headers";
import { cacheTag, cacheLife } from "next/cache";
import { getTenant } from "@/lib/tenants";
import { listDocs } from "@/lib/gitto";
import { WelcomeBanner } from "@/app/components/welcome-banner";
import { DynamicTimestamp } from "@/app/components/dynamic-timestamp";

async function CachedDocIndex({ tenant }: { tenant: string }) {
  "use cache";
  cacheTag(`tenant:${tenant}`);
  cacheLife("max");

  const tenantConfig = getTenant(tenant);
  const docs = await listDocs(tenant);

  return (
    <div>
      <div className="mb-8">
        <span
          className="text-xs font-bold tracking-widest uppercase px-2 py-1 rounded"
          style={{
            backgroundColor: tenantConfig.primaryColor,
            color: "white",
          }}
        >
          {tenantConfig.logoText}
        </span>
        <h1 className="text-3xl font-bold mt-4">{tenantConfig.name} Docs</h1>
        <p className="text-gray-500 mt-1">
          API documentation and guides
        </p>
      </div>

      <div className="grid gap-3">
        {docs.map((doc) => (
          <a
            key={doc.slug}
            href={`/docs/${doc.slug}?tenant=${tenant}`}
            className="block border border-gray-200 rounded-lg px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold">{doc.title}</h2>
            <p className="text-sm text-gray-400 mt-1">/{doc.slug}</p>
          </a>
        ))}
        {docs.length === 0 && (
          <p className="text-gray-400">
            No docs yet. Run <code className="text-sm bg-gray-100 px-1 rounded">npx tsx scripts/seed.ts</code> to seed content.
          </p>
        )}
      </div>
    </div>
  );
}

// Dynamic wrapper that reads headers (must be inside Suspense for PPR)
async function LandingContent() {
  const hdrs = await headers();
  const tenant = hdrs.get("x-tenant") ?? "acme";

  return <CachedDocIndex tenant={tenant} />;
}

export default async function LandingPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Suspense fallback={<div className="h-12 bg-gray-100 rounded mb-6 animate-pulse" />}>
        <WelcomeBanner />
      </Suspense>

      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-100 rounded w-1/2" />
            <div className="h-20 bg-gray-100 rounded" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        }
      >
        <LandingContent />
      </Suspense>

      <Suspense
        fallback={
          <p className="text-xs text-gray-300 mt-8 border-t pt-4">Loading timestamp…</p>
        }
      >
        <DynamicTimestamp />
      </Suspense>
    </div>
  );
}
