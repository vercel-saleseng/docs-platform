// Client component island that renders personalized variable placeholders.
// When logged in: shows real values. When logged out: shows styled placeholder.
// This is the key "dynamic island" inside otherwise-cached MDX content.
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
  const { user } = useUser();

  if (user && FIELD_MAP[field]) {
    return (
      <span className="bg-blue-100 text-blue-800 px-1 rounded font-mono text-sm">
        {FIELD_MAP[field](user)}
      </span>
    );
  }

  return (
    <span className="bg-gray-200 text-gray-500 px-1 rounded font-mono text-sm">
      {PLACEHOLDER_MAP[field] ?? `{{${field}}}`}
    </span>
  );
}
