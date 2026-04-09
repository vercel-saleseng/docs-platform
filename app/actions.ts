// Server Actions for cache revalidation at three levels of granularity.
//
// Cache tag hierarchy:
//   "global"                  → every cached component across all tenants
//   "tenant:{slug}"           → all cached content for one tenant (sidebar + docs)
//   "doc:{tenant}/{slug}"     → a single doc page
//
// updateTag()      → immediate expiration (read-your-writes, Server Actions only)
// revalidateTag()  → marks stale, serves stale-while-revalidate in background
"use server";

import { updateTag, revalidateTag } from "next/cache";

// Level 1: Invalidate a single doc (used on save)
export async function invalidateDoc(tenant: string, slug: string) {
  updateTag(`doc:${tenant}/${slug}`);
  // Also background-refresh the tenant sidebar in case title changed
  revalidateTag(`tenant:${tenant}`, "max");
  return {
    level: "doc" as const,
    tag: `doc:${tenant}/${slug}`,
    at: new Date().toISOString(),
  };
}

// Level 2: Invalidate all content for a tenant
export async function invalidateTenant(tenant: string) {
  updateTag(`tenant:${tenant}`);
  return {
    level: "tenant" as const,
    tag: `tenant:${tenant}`,
    at: new Date().toISOString(),
  };
}

// Level 3: Invalidate everything across all tenants
export async function invalidateAll() {
  updateTag("global");
  return {
    level: "global" as const,
    tag: "global",
    at: new Date().toISOString(),
  };
}
