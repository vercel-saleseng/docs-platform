// Server Actions for cache revalidation after content updates.
// Demonstrates updateTag() for read-your-writes and revalidateTag() for background refresh.
"use server";

import { updateTag, revalidateTag } from "next/cache";

export async function revalidateDoc(tenant: string, slug: string) {
  // Immediate expiration — the editing user sees fresh content on next load
  updateTag(`doc:${tenant}/${slug}`);
  // Background revalidation of the tenant index page
  revalidateTag(`tenant:${tenant}`, "max");
  return { revalidatedAt: new Date().toISOString() };
}
