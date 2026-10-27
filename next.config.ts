import type { NextConfig } from "next";

const cdn = new URL(process.env.NEXT_PUBLIC_CDN_BASE_URL || "https://cdn.albumo.in");
if (
  cdn.protocol !== "https:" ||
  cdn.username ||
  cdn.password ||
  cdn.pathname !== "/" ||
  cdn.search ||
  cdn.hash
) {
  throw new Error("NEXT_PUBLIC_CDN_BASE_URL must be an HTTPS origin");
}
const nextConfig: NextConfig = {
  // Keep watching/resolution inside this app, including the installed token package.
  turbopack: { root: process.cwd() },
  // The persistent dev cache caused long compaction stalls on this workstation.
  experimental: { turbopackFileSystemCacheForDev: false },
  distDir: process.env.ALBUMO_TEST_MODE === "1" ? ".next-smoke" : ".next",
  images: {
    // Image processing belongs to the separate processing repo.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: cdn.hostname,
        port: cdn.port,
        pathname: "/**",
        search: "",
      },
    ],
  },
};
export default nextConfig;
