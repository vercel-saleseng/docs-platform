// Direct Vercel Blob reads for server-side data fetching.
// Pages call these instead of fetching through the API routes,
// avoiding self-referential HTTP calls during prerendering.
import { list } from "@vercel/blob";

export type DocEntry = { slug: string; title: string };

export async function listDocs(tenant: string): Promise<DocEntry[]> {
  const { blobs } = await list({ prefix: `${tenant}/` });
  return blobs.map((blob) => {
    const slug = blob.pathname.replace(`${tenant}/`, "").replace(".md", "");
    const title = slug
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
    return { slug, title };
  });
}

export async function getDoc(
  tenant: string,
  slug: string
): Promise<{ slug: string; markdown: string }> {
  const pathname = `${tenant}/${slug}.md`;
  const { blobs } = await list({ prefix: pathname });
  const blob = blobs.find((b) => b.pathname === pathname);
  if (!blob) throw new Error(`Doc not found: ${pathname}`);

  const res = await fetch(blob.url);
  const markdown = await res.text();
  return { slug, markdown };
}
