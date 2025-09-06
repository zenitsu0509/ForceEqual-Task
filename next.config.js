/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse'],
  outputFileTracingRoot: process.cwd(),
}

module.exports = nextConfig
