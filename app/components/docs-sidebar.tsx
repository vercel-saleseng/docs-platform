// Sidebar navigation for the tenant docs layout.
// Cached separately — revalidates when any doc in the tenant changes.
import { cacheTag, cacheLife } from "next/cache";
import { listDocs } from "@/lib/gitto";
import { SidebarLinks } from "./sidebar-links";

export async function DocsSidebar({ tenant }: { tenant: string }) {
  "use cache";
  cacheTag(`tenant:${tenant}`, "global");
  cacheLife("max");

  const docs = await listDocs(tenant);

  return (
    <nav className="w-64 shrink-0 border-r border-gray-200 py-6 px-4 overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-2">
        Guides
      </p>
      <SidebarLinks docs={docs} />
    </nav>
  );
}
