// Branded header bar for tenant doc pages.
// Shows tenant logo, name, and login toggle.
import Link from "next/link";
import { getTenant } from "@/lib/tenants";
import { LoginToggle } from "./login-toggle";

export function TenantHeader({ tenantSlug }: { tenantSlug: string }) {
  const tenant = getTenant(tenantSlug);

  return (
    <header className="border-b border-gray-200 px-6 h-14 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded"
            style={{ backgroundColor: tenant.primaryColor, color: "white" }}
          >
            {tenant.logoText}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {tenant.name} Docs
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Admin
        </a>
        <LoginToggle />
      </div>
    </header>
  );
}
