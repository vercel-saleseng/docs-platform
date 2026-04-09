// Request interception: resolves tenant from the Host header.
//
// Subdomain pattern:
//   acme.docs-platform.com → tenant "acme"
//   docs-platform.com (root) → no tenant (shows hub page)
//
// Local dev:
//   acme.localhost:3000 → tenant "acme"
//   localhost:3000 → no tenant (hub page)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveTenantFromHost } from "@/lib/tenants";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const tenant = resolveTenantFromHost(host);

  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  if (tenant) {
    headers.set("x-tenant", tenant);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
