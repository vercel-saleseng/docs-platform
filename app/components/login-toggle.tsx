// User switcher — demonstrates that personalized content updates without
// cache invalidation. The cached MDX shell stays the same; only the
// <UserVar /> islands re-fetch /api/user with the new user ID.
"use client";

import { useUser } from "@/lib/user-context";

const USERS = [
  { id: "jane" as const, label: "Jane Developer" },
  { id: "alex" as const, label: "Alex Engineer" },
];

export function LoginToggle() {
  const { user, loading, loggedIn, currentUserId, switchUser, toggleLogin } =
    useUser();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-block w-28 h-8 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex items-center gap-2">
        {USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => switchUser(u.id)}
            className="px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Log in as {u.label.split(" ")[0]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-md border border-gray-200 overflow-hidden">
        {USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => switchUser(u.id)}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentUserId === u.id
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {u.label.split(" ")[0]}
          </button>
        ))}
      </div>
      <button
        onClick={toggleLogin}
        className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
