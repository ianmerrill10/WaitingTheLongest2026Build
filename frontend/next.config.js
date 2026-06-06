/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.waitingthelongest.com",
      },
    ],
    // Fallback placeholder for missing images
    unoptimized: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
