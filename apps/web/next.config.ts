import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@oncovax/shared', '@oncovax/db'],
};

export default nextConfig;
