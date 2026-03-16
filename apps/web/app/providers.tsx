'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DripsyProvider } from '@oncovax/app';
import { apolloClient } from '../lib/apollo';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <DripsyProvider>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </DripsyProvider>
    </ApolloProvider>
  );
}
