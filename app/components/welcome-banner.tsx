// Dynamic welcome banner — client component that reads UserContext.
// Shows personalized greeting when logged in, generic when logged out.
"use client";

import { useUser } from "@/lib/user-context";

export function WelcomeBanner() {
  const { user } = useUser();
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
