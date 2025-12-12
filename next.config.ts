import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/app",
  sw: "service-worker.js",
});

const nextConfig: NextConfig = {
  // ... other config options
};

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

export default withPWA(withNextIntl(nextConfig));
