// Simple login/logout toggle — no real auth, just flips UserContext.
"use client";

import { useUser } from "@/lib/user-context";

export function LoginToggle() {
  const { user, toggleLogin } = useUser();
  return (
    <button
      onClick={toggleLogin}
      className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
    >
      {user ? `Logged in as ${user.name}` : "Log in"}
    </button>
  );
}
