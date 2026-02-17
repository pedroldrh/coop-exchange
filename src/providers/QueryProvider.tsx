import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { extractErrorMessage, showAlert } from '../lib/utils';

const mutationCache = new MutationCache({
  onError: (error) => {
    showAlert('Error', extractErrorMessage(error));
  },
});

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 60_000,  // 60 seconds before data is considered stale
      gcTime: 300_000,    // 5 minutes before unused data is garbage collected
      retry: 1,           // retry failed queries once
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
