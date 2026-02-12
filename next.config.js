/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'hyperformula'],
  },
  images: {
    domains: ['www.blueally.com'],
  },
}

module.exports = nextConfig
