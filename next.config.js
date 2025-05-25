// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Your other config options can go here */
  reactStrictMode: true, // Example, keep if you have it

  // Add the ESLint configuration block
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. It's recommended to fix the errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
