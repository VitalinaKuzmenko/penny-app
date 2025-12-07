import * as path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.join(__dirname), // points to the Next.js app root
  },
};

module.exports = nextConfig;
