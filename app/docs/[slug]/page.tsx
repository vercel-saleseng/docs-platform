// DOC PAGE — The core PPR demo.
//
// What happens on page load:
//   1. The static shell (CachedDocContent) serves instantly from edge cache.
//      It contains the full MDX output — headings, prose, code blocks, tables —
//      with <UserVar /> client component placeholders where {{variables}} were.
//   2. Dynamic parts stream in via Suspense boundaries:
//      - <UserVar /> components fetch /api/user (300ms) and fill in real values
//      - <DynamicTimestamp /> fetches current time (300ms) to prove it's live
//
// Cache tags (three levels — see app/actions.ts for invalidation):
//   "doc:acme/getting-started"  → this specific doc
//   "tenant:acme"               → all docs + sidebar for this tenant
//   "global"                    → everything across all tenants
import { Suspense } from "react";
import { headers } from "next/headers";
import { cacheTag, cacheLife } from "next/cache";
import { compileDoc } from "@/lib/mdx";
import { getDoc } from "@/lib/gitto";
import { DynamicTimestamp } from "@/app/components/dynamic-timestamp";

// CACHED: This entire component is cached at the edge.
// The compiled MDX is static HTML, but it contains <UserVar /> client components
// that are "holes" in the cache — they render dynamically on every request.
async function CachedDocContent({
  tenant,
  slug,
}: {
  tenant: string;
  slug: string;
}) {
  "use cache";
  cacheTag(`doc:${tenant}/${slug}`, `tenant:${tenant}`, "global");
  cacheLife("max");

  const { markdown } = await getDoc(tenant, slug);
  const content = await compileDoc(markdown);

  return (
    <article className="prose prose-gray max-w-none [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm [&_table]:text-sm">
      {content}
    </article>
  );
}

// DYNAMIC: Reads headers() (set by proxy.ts) which makes this component dynamic.
// Must be inside a Suspense boundary for PPR — the static shell renders first,
// then this streams in once the dynamic data (headers, params) resolves.
async function DocContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  const [{ slug }, hdrs] = await Promise.all([paramsPromise, headers()]);
  const tenantSlug = hdrs.get("x-tenant") ?? "acme";

  return <CachedDocContent tenant={tenantSlug} slug={slug} />;
}

// PAGE: The static outer shell that PPR prerenderes.
// Suspense boundaries define where the static/dynamic split happens.
export default function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="max-w-3xl px-10 py-10">
      {/* Suspense boundary #1: doc content (cached MDX + dynamic user vars) */}
      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        }
      >
        <DocContent paramsPromise={params} />
      </Suspense>

      {/* Suspense boundary #2: dynamic timestamp (300ms delay proves streaming) */}
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
