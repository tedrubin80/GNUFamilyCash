/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2', '@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Fix for Railway deployment
  output: 'standalone',
  // Disable type checking during build (handle separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper env handling
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
}

module.exports = nextConfig