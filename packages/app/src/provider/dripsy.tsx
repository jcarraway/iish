import React from 'react';
import { DripsyProvider as BaseDripsyProvider } from 'dripsy';
import { theme } from '../theme';

interface DripsyProviderProps {
  children: React.ReactNode;
}

export function DripsyProvider({ children }: DripsyProviderProps) {
  return (
    <BaseDripsyProvider theme={theme}>
      {children}
    </BaseDripsyProvider>
  );
}
