import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "**.ufs.sh" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "subdomain" },
      { protocol: "https", hostname: "files.stripe.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Experimental features for faster builds
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-select",
      "@radix-ui/react-accordion",
      "@radix-ui/react-scroll-area",
      "date-fns",
      "recharts",
      "@tremor/react",
      "framer-motion",
      "@clerk/nextjs",
    ],
  },
};

export default nextConfig;
