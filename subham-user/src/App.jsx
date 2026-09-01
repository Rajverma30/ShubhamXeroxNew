import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { StoreProvider } from './context/StoreContext';
import ErrorBoundary from './components/layout/ErrorBoundary';
import router from './routes';

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <StoreProvider>
          <RouterProvider router={router} />
        </StoreProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
