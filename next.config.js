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
  // Files in /public are sent with "max-age=0" by default, so every page view asks the CDN again for the logo and the other
  // pictures (one counted request each). Let browsers keep them for a week instead. If you ever replace a picture, give it a new file name.
  async headers() {
    return [
      {
        source: "/:file(.+\\.(?:png|jpg|jpeg|webp|svg|ico|gif))",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

module.exports = nextConfig;