import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LoadingBlock } from './components/Ui';
import router from './routes';

/**
 * One QueryClient for the whole panel.
 * Retries are disabled on 4xx — a 401/404 won't get better by asking again.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingBlock label="Loading…" />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
