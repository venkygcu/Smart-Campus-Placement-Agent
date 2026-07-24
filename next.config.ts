import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only keep sharp as external — pdf-parse is fully removed
  serverExternalPackages: ["sharp"],
  experimental: {},
};

export default nextConfig;
