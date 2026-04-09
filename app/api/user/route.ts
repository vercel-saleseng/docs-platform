// Mock user/session API — simulates fetching user data from an auth service.
// 300ms artificial delay makes the dynamic streaming visually obvious in the demo.
// In production this would hit a real session store or auth provider.

export async function GET() {
  await new Promise((r) => setTimeout(r, 300));

  return Response.json({
    name: "Jane Developer",
    apiKey: "sk_live_abc123xyz789",
  });
}
