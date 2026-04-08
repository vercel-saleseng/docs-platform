// Gitto API: lists available docs for a tenant.
// GET /api/docs?tenant=acme → [{ slug, title }]
import { listDocs } from "@/lib/gitto";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant") ?? "acme";
  const docs = await listDocs(tenant);
  return Response.json(docs);
}
