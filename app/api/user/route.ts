// Mock user/session API — simulates fetching user data from an auth service.
// 300ms artificial delay makes the dynamic streaming visually obvious in the demo.
// In production this would hit a real session store or auth provider.
//
// Accepts ?user=jane or ?user=alex to simulate different logged-in users.
// The doc page cache is NOT invalidated when switching users — the cached
// static shell stays the same, and only the <UserVar /> client component
// islands re-fetch this endpoint to fill in the new user's data.

import { type NextRequest } from "next/server";

const USERS: Record<string, { name: string; apiKey: string }> = {
  jane: { name: "Jane Developer", apiKey: "sk_live_abc123xyz789" },
  alex: { name: "Alex Engineer", apiKey: "sk_live_def456uvw012" },
};

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 300));

  const userId = request.nextUrl.searchParams.get("user") ?? "jane";
  const user = USERS[userId] ?? USERS.jane;

  return Response.json(user);
}
