// Dynamic component that fetches current time at request time.
// Wrapped in <Suspense> to demonstrate PPR — this streams in after the cached shell.
// Artificial 300ms delay makes the streaming visually obvious during demos.

async function getCurrentTime() {
  await new Promise((r) => setTimeout(r, 300));
  return new Date().toLocaleString();
}

export async function DynamicTimestamp() {
  const time = await getCurrentTime();
  return (
    <p className="text-xs text-gray-400 mt-8 border-t pt-4">
      Page rendered at {time}
    </p>
  );
}
