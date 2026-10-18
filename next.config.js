/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // keep optimised images cached for 30 days so Supabase is hit once, not on every visit
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

module.exports = nextConfig;