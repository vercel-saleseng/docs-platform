// Request interception: resolves tenant from hostname or ?tenant= query param
// Sets x-tenant header for downstream pages/routes to read
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HOST_TO_TENANT: Record<string, string> = {
  "acme.localhost:3000": "acme",
  "globex.localhost:3000": "globex",
  "initech.localhost:3000": "initech",
};

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  let tenant = HOST_TO_TENANT[host];

  // Fallback: read ?tenant= query param (local dev convenience)
  if (!tenant) {
    tenant = request.nextUrl.searchParams.get("tenant") ?? "acme";
  }

  const headers = new Headers(request.headers);
  headers.set("x-tenant", tenant);

  return NextResponse.next({ request: { headers } });
}
