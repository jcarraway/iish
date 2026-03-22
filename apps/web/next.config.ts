import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    // Workspace packages (excluding @iish/db — it's server-external)
    '@iish/shared',
    '@iish/ui',
    '@iish/app',
    '@iish/api',

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
      // Redirect Solito Pages Router imports to App Router versions
      'solito/link': 'solito/navigation',
      'solito/router': 'solito/navigation',
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
    '@iish/db',
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
