import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "30mb" },
  },
  serverExternalPackages: ["unpdf", "mammoth", "xlsx"],
};

export default config;
