// Enables "use cache" directive and Partial Prerendering (PPR) in Next.js 16
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
