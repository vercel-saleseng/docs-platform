// Tenant configuration — the single source of truth for multi-tenant branding.
//
// DEMO SETUP (subdomains on a shared root domain):
//   1. Buy/use a domain, e.g. docs-platform.com
//   2. In Vercel, add a wildcard domain: *.docs-platform.com
//   3. Add the root domain too: docs-platform.com
//   4. Visit acme.docs-platform.com, globex.docs-platform.com, etc.
//
// Local dev: *.localhost resolves to 127.0.0.1 automatically — just visit:
//   http://acme.localhost:3000
//   http://globex.localhost:3000
//   http://initech.localhost:3000
//
// ─── SWITCHING TO CUSTOM DOMAINS (CNAME) ───────────────────────────
// For the real ReadMe use case, customers bring their own domain:
//   Customer owns docs.acme.com → CNAMEs to cname.vercel-dns.com
//   You add docs.acme.com to the Vercel project (dashboard or API)
//   The proxy resolves tenant from the exact hostname
//
// To enable this:
//   1. Add a `customDomain` field to each tenant (e.g. "docs.acme.com")
//   2. Build a DOMAIN_TO_TENANT reverse lookup (or use KV/DB)
//   3. In resolveTenantFromHost(), check exact domain match first
//   See git history for the prior custom-domain implementation.
// ────────────────────────────────────────────────────────────────────

export type Tenant = {
  slug: string;
  name: string;
  primaryColor: string;
  logoText: string;
};

// The root domain for the deployed app. Change this to your actual domain.
export const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "docs-platform.com";

export const TENANTS: Record<string, Tenant> = {
  acme: {
    slug: "acme",
    name: "Acme Corp",
    primaryColor: "#2563eb",
    logoText: "ACME",
  },
  globex: {
    slug: "globex",
    name: "Globex Corporation",
    primaryColor: "#059669",
    logoText: "GLOBEX",
  },
  initech: {
    slug: "initech",
    name: "Initech",
    primaryColor: "#dc2626",
    logoText: "INITECH",
  },
};

export function resolveTenantFromHost(host: string): string | null {
  const hostname = host.split(":")[0]; // strip port

  // Production: {tenant}.docs-platform.com → tenant slug
  const rootDomain = ROOT_DOMAIN.split(":")[0];
  if (hostname.endsWith(`.${rootDomain}`)) {
    const sub = hostname.replace(`.${rootDomain}`, "");
    if (sub && sub !== "www" && TENANTS[sub]) return sub;
  }

  // Local dev: {tenant}.localhost → tenant slug
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.replace(".localhost", "");
    if (TENANTS[sub]) return sub;
  }

  // ─── CUSTOM DOMAIN (CNAME) PATTERN ───────────────────────────────
  // Uncomment and populate for the bring-your-own-domain use case:
  //
  // const DOMAIN_TO_TENANT: Record<string, string> = {
  //   "docs.acme.com": "acme",
  //   "docs.globex.io": "globex",
  //   "docs.initech.com": "initech",
  // };
  // if (DOMAIN_TO_TENANT[hostname]) return DOMAIN_TO_TENANT[hostname];
  //
  // In production, replace this map with a KV or DB lookup:
  //   const tenant = await kv.get(`domain:${hostname}`);
  //   if (tenant) return tenant;
  // ─────────────────────────────────────────────────────────────────

  return null;
}

export function getTenant(slug: string): Tenant {
  return TENANTS[slug] ?? TENANTS.acme;
}
