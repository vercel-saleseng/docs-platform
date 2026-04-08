// Tenant configuration — the single source of truth for multi-tenant branding
export type Tenant = {
  slug: string;
  name: string;
  primaryColor: string;
  logoText: string;
};

export const TENANTS: Record<string, Tenant> = {
  acme: {
    slug: "acme",
    name: "Acme Corp",
    primaryColor: "#2563eb", // blue-600
    logoText: "ACME",
  },
  globex: {
    slug: "globex",
    name: "Globex Corporation",
    primaryColor: "#059669", // emerald-600
    logoText: "GLOBEX",
  },
  initech: {
    slug: "initech",
    name: "Initech",
    primaryColor: "#dc2626", // red-600
    logoText: "INITECH",
  },
};

export function getTenant(slug: string): Tenant {
  return TENANTS[slug] ?? TENANTS.acme;
}
