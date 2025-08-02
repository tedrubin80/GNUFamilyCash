// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Move serverComponentsExternalPackages to the correct location
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'mysql2',
    'bcryptjs'
  ],
  // Remove deprecated swcMinify option
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
}

module.exports = nextConfig