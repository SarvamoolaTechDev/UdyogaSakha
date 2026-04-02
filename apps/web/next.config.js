/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@udyogasakha/types', '@udyogasakha/validators', '@udyogasakha/api-client'],
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
};

module.exports = nextConfig;
