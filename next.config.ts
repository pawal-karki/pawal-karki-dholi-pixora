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
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: false,
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Experimental features for faster builds
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
      "recharts",
    ],
  },
};

export default nextConfig;
