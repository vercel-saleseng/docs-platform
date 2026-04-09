// Admin page: lives on the root domain at /admin.
// The server component fetches all tenant doc lists at build time using
// "use cache" — the sidebar populates instantly without a client-side fetch.
// The editor itself is a client component that receives the cached data.
//
// Cache tags: tagged with each tenant + global, so doc list updates
// when content is published or cache is invalidated.
import { Suspense } from "react";
import { cacheTag, cacheLife } from "next/cache";
import { listDocs } from "@/lib/gitto";
import { TENANTS } from "@/lib/tenants";
import { AdminEditor } from "./editor";
import type { DocEntry } from "@/lib/gitto";

// Cached: fetches doc lists for ALL tenants and caches them.
// Tagged so they invalidate when docs are added/removed.
async function CachedAdminData() {
  "use cache";
  cacheTag("global", ...Object.keys(TENANTS).map((t) => `tenant:${t}`));
  cacheLife("max");

  const entries = await Promise.all(
    Object.keys(TENANTS).map(async (slug) => {
      const docs = await listDocs(slug);
      return [slug, docs] as [string, DocEntry[]];
    })
  );

  const allDocs: Record<string, DocEntry[]> = Object.fromEntries(entries);

  return <AdminEditor allDocs={allDocs} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading admin…</p>
          </div>
        </div>
      }
    >
      <CachedAdminData />
    </Suspense>
  );
}
