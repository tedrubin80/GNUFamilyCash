/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}
module.exports = nextConfig