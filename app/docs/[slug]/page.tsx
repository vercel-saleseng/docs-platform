// Doc page: fetches markdown from Gitto API, compiles via MDX, renders with cache.
// Demonstrates "use cache" + cacheTag + cacheLife + PPR with Suspense boundaries.
import { Suspense } from "react";
import { headers } from "next/headers";
import { cacheTag, cacheLife } from "next/cache";
import { compileDoc } from "@/lib/mdx";
import { getDoc } from "@/lib/gitto";
import { getTenant } from "@/lib/tenants";
import { DynamicTimestamp } from "@/app/components/dynamic-timestamp";

async function CachedDocContent({
  tenant,
  slug,
}: {
  tenant: string;
  slug: string;
}) {
  "use cache";
  cacheTag(`doc:${tenant}/${slug}`, `tenant:${tenant}`);
  cacheLife("max");

  const { markdown } = await getDoc(tenant, slug);
  const content = await compileDoc(markdown);

  return (
    <article className="prose prose-gray max-w-none [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm [&_table]:text-sm">
      {content}
    </article>
  );
}

// Resolves dynamic data (headers + params) inside Suspense for PPR
async function DocContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  const [{ slug }, hdrs] = await Promise.all([paramsPromise, headers()]);
  const tenantSlug = hdrs.get("x-tenant") ?? "acme";
  const tenant = getTenant(tenantSlug);

  return (
    <div>
      <a
        href={`/?tenant=${tenantSlug}`}
        className="text-sm hover:underline mb-6 inline-block"
        style={{ color: tenant.primaryColor }}
      >
        ← Back to {tenant.name} docs
      </a>
      <CachedDocContent tenant={tenantSlug} slug={slug} />
    </div>
  );
}

export default function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        }
      >
        <DocContent paramsPromise={params} />
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
