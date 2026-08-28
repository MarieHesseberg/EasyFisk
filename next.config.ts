import type { NextConfig } from "next";

const isGitHubPages = process.env.EASYFISK_GITHUB_PAGES === "true";

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
