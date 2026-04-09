// USER VARIABLE — the dynamic island inside cached content.
//
// This "use client" component is embedded inside server-cached MDX output.
// The surrounding doc content serves instantly from cache; this component
// is a "hole" that fills in dynamically on every request.
//
// Lifecycle on page load:
//   1. Static MDX shell renders from cache (this component shows a skeleton)
//   2. UserProvider fetches GET /api/user (300ms artificial delay)
//   3. Skeleton is replaced with the real value ("Jane Developer", "sk_live_...")
//
// Toggle login/logout to see it swap between real values and placeholders.
"use client";

import { useUser } from "@/lib/user-context";

const FIELD_MAP: Record<string, (user: { name: string; apiKey: string }) => string> = {
  "user.name": (u) => u.name,
  "user.apiKey": (u) => u.apiKey,
};

const PLACEHOLDER_MAP: Record<string, string> = {
  "user.name": "YOUR_NAME",
  "user.apiKey": "YOUR_API_KEY",
};

export function UserVar({ field }: { field: string }) {
  const { user, loading } = useUser();

  if (loading) {
    const width = field === "user.apiKey" ? "w-36" : "w-24";
    return (
      <span
        className={`inline-block ${width} h-5 bg-gray-200 rounded animate-pulse align-middle`}
      />
    );
  }

  if (user && FIELD_MAP[field]) {
    return (
      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono text-sm">
        {FIELD_MAP[field](user)}
      </span>
    );
  }

  return (
    <span className="bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono text-sm">
      {PLACEHOLDER_MAP[field] ?? `{{${field}}}`}
    </span>
  );
}
