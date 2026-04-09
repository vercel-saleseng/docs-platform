// Login/logout toggle — triggers a real /api/user fetch on login.
"use client";

import { useUser } from "@/lib/user-context";

export function LoginToggle() {
  const { user, loading, loggedIn, toggleLogin } = useUser();
  return (
    <button
      onClick={toggleLogin}
      disabled={loading}
      className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {loading
        ? "Loading..."
        : loggedIn && user
          ? `Logged in as ${user.name}`
          : "Log in"}
    </button>
  );
}
