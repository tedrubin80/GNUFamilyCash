// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode for build
  reactStrictMode: false,
  
  // Output standalone for better deployment
  output: 'standalone',
  
  // Ignore TypeScript and ESLint errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable SWC minification if causing issues
  swcMinify: false,
  
  // Add external packages
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      'prisma',
      'mysql2',
      'bcryptjs'
    ],
  },
  
  // Webpack configuration to handle common issues
  webpack: (config, { isServer }) => {
    // Fix for Prisma
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    
    // Ignore optional dependencies that might cause issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@swc/core': false,
      'utf-8-validate': false,
      'bufferutil': false,
    }
    
    return config
  },
}

module.exports = nextConfig