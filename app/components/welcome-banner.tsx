// Dynamic welcome banner — shows loading skeleton while user data is fetched,
// then personalized greeting (logged in) or generic welcome (logged out).
"use client";

import { useUser } from "@/lib/user-context";

export function WelcomeBanner() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Welcome back,</span>
          <span className="inline-block w-28 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
      {user ? (
        <p className="text-sm text-gray-700">
          Welcome back, <strong>{user.name}</strong>. Your personalized docs are below.
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Welcome! Log in to see personalized code samples with your API key.
        </p>
      )}
    </div>
  );
}
