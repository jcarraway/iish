import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    // Workspace packages (excluding @oncovax/db — it's server-external)
    '@oncovax/shared',
    '@oncovax/ui',
    '@oncovax/app',
    '@oncovax/api',

    // Core RN Web
    'react-native',
    'react-native-web',

    // Dripsy
    'dripsy',
    '@dripsy/core',

    // Solito
    'solito',

    // React Native components
    'react-native-safe-area-context',
  ],

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };

    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];

    return config;
  },

  serverExternalPackages: [
    '@prisma/client',
    '@oncovax/db',
    '@apollo/server',
    '@react-pdf/renderer',
    '@react-pdf/font',
    '@react-pdf/layout',
    '@react-pdf/pdfkit',
    '@react-pdf/render',
    '@react-pdf/primitives',
    'yoga-layout',
  ],
};

export default nextConfig;
