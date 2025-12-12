import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: true, // Temporarily disabled to force cache clear
  register: true,
  scope: "/app",
  sw: "service-worker.js",
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // ... other config options
};

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

export default withPWA(withNextIntl(nextConfig));
