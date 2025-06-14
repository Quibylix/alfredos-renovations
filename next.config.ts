import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/notifications",
      "@mantine/dropzone",
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/features/i18n/request.ts");

export default withNextIntl(nextConfig);
