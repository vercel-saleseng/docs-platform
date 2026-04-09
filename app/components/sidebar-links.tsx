// Client component that highlights the active doc link in the sidebar.
"use client";

import { usePathname } from "next/navigation";
import type { DocEntry } from "@/lib/gitto";

export function SidebarLinks({ docs }: { docs: DocEntry[] }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {docs.map((doc) => {
        const href = `/docs/${doc.slug}`;
        const isActive = pathname === href;
        return (
          <li key={doc.slug}>
            <a
              href={href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {doc.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
