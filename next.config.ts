import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const isGitHubPages = process.env.EASYFISK_GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  // Allow interactive previews from this computer's LAN addresses as well as localhost.
  allowedDevOrigins: [
    "localhost",
    ...Object.values(networkInterfaces()).flatMap((addresses) =>
      (addresses ?? []).filter(({ family }) => family === "IPv4").map(({ address }) => address),
    ),
  ],
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: "/EasyFisk",
        assetPrefix: "/EasyFisk/",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
