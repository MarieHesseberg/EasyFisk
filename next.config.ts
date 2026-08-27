import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  agentRules: false,
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

