// Gitto API: reads/writes raw markdown for a single doc.
// GET /api/docs/getting-started?tenant=acme → { slug, markdown }
// POST /api/docs/getting-started?tenant=acme → writes updated markdown to Blob
import { getDoc } from "@/lib/gitto";
import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant") ?? "acme";
  const slug = request.nextUrl.pathname.split("/").pop()!;

  try {
    const doc = await getDoc(tenant, slug);
    return Response.json(doc);
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant") ?? "acme";
  const slug = request.nextUrl.pathname.split("/").pop()!;
  const { markdown } = await request.json();
  const pathname = `${tenant}/${slug}.md`;

  await put(pathname, markdown, {
    access: "public",
    addRandomSuffix: false,
    contentType: "text/markdown",
  });

  return Response.json({ ok: true });
}
