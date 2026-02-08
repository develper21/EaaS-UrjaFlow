/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Custom logging for development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Enable detailed logging in development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
